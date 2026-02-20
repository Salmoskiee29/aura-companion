import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chat = () => {
  const { modelId } = useParams();
  const { user } = useAuth();
  const [model, setModel] = useState<{ id: string; name: string; avatar: string; online: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ status: string; tier: string } | null>(null);
  const [diamondBalance, setDiamondBalance] = useState<number>(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSubscribed = subscription?.status === 'active';
  const isLocked = !isSubscribed && diamondBalance <= 0;

  // Load model, subscription, and conversation
  useEffect(() => {
    if (!modelId || !user) return;

    const init = async () => {
      // Fetch model
      const { data: m } = await supabase.from('companion_models').select('id, name, avatar, online').eq('id', modelId).single();
      if (m) setModel(m);

      // Fetch subscription
      const { data: sub } = await supabase.from('subscriptions').select('status, tier').eq('user_id', user.id).single();
      if (sub) setSubscription(sub);

      // Fetch diamond balance
      const { data: wallet } = await supabase.from('gem_wallets').select('balance').eq('user_id', user.id).single();
      if (wallet) setDiamondBalance(wallet.balance);

      // Find or create conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('model_id', modelId)
        .limit(1)
        .single();

      let convId: string;
      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, model_id: modelId })
          .select('id')
          .single();
        convId = newConv?.id || '';
      }
      setConversationId(convId);

      // Load existing messages
      if (convId) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, message, sender_type, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (msgs && msgs.length > 0) {
          setMessages(msgs.map(msg => ({
            id: msg.id,
            sender: msg.sender_type === 'user' ? 'user' : 'model',
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        } else if (m) {
          // Welcome message
          setMessages([{
            id: '0',
            sender: 'model',
            text: `Hey there! 💕 I'm ${m.name}. So glad you're here. What's on your mind today?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      }
    };
    init();
  }, [modelId, user]);

  // Realtime messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_type !== 'user') {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              sender: 'model' as const,
              text: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }];
          });
          setIsTyping(false);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user || isLocked) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const messageText = input.trim();
    setInput('');
    setIsTyping(true);

    // Save user message to DB
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      message: messageText,
      sender_type: 'user',
      sender_id: user.id,
    });

    // Call AI chat edge function with streaming
    try {
      const chatHistory = messages.filter(m => m.id !== '0').map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));
      chatHistory.push({ role: 'user', content: messageText });

      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory, modelId, conversationId }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 403) {
          toast.error(errData.error || 'Free message limit reached. Please subscribe.');
          setIsTyping(false);
          return;
        }
        if (resp.status === 429) {
          toast.error('Rate limited. Please try again in a moment.');
          setIsTyping(false);
          return;
        }
        throw new Error(errData.error || 'Chat error');
      }

      // Stream response
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream');
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantText = '';
      const assistantId = crypto.randomUUID();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, text: assistantText } : m);
                }
                return [...prev, { id: assistantId, sender: 'model' as const, text: assistantText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setIsTyping(false);

      // Save AI response to DB
      if (assistantText) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          message: assistantText,
          sender_type: 'model',
        });
        // Deduct diamond if on free plan
        if (subscription && subscription.status !== 'active') {
          setDiamondBalance(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsTyping(false);
      toast.error(err.message || 'Failed to get response');
    }
  };

  if (!model) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/dashboard/models">
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="relative">
          <img src={model.avatar} alt={model.name} className="w-11 h-11 rounded-full object-cover border-2 border-primary/30" />
          {model.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[hsl(var(--online))] border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{model.name}</h2>
          <span className="text-xs text-muted-foreground">{model.online ? 'Online now' : 'Away'}</span>
        </div>
        {!isSubscribed && (
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
            💎 {diamondBalance} diamonds
          </span>
        )}
        {isSubscribed && (
          <span className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 font-medium">
            Premium ✨
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                  : 'glass-card text-card-foreground rounded-2xl rounded-bl-md'
              } px-4 py-3`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-5 py-3.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card border-t border-border/50 px-4 py-3 shrink-0">
        <div className="flex gap-2 items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isLocked ? 'Subscribe to continue...' : 'Type a message...'}
            disabled={isLocked}
            className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLocked || isTyping}
            className="h-12 w-12 rounded-2xl btn-premium text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLocked ? <Lock className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
