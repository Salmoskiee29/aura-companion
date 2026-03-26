import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  time: string;
  pending?: boolean;
  imageUrl?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function ChatSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border/50 px-4 py-3 flex items-center gap-3 shrink-0">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex-1 px-4 py-6 space-y-4">
        <div className="flex justify-start"><Skeleton className="h-16 w-64 rounded-2xl" /></div>
        <div className="flex justify-end"><Skeleton className="h-12 w-48 rounded-2xl" /></div>
        <div className="flex justify-start"><Skeleton className="h-20 w-72 rounded-2xl" /></div>
      </div>
      <div className="border-t border-border/50 px-4 py-3 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Skeleton className="flex-1 h-12 rounded-2xl" />
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

const Chat = () => {
  const { modelId } = useParams();
  const { user } = useAuth();
  const [characterInfo, setCharacterInfo] = useState<{ id: string; name: string; avatar: string; online: boolean; isUserCharacter: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ status: string; tier: string } | null>(null);
  const [diamondBalance, setDiamondBalance] = useState<number>(10);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSubscribed = subscription?.status === 'active';
  const isLocked = !isSubscribed && diamondBalance <= 0;

  // Determine if this is a user character (prefixed with "user-") or public model
  const isUserCharacter = modelId?.startsWith('user-') ?? false;
  const actualId = isUserCharacter ? modelId!.replace('user-', '') : modelId;

  useEffect(() => {
    if (!actualId || !user) return;

    const init = async () => {
      // Fetch character info, subscription, and wallet in parallel
      const subPromise = supabase.from('subscriptions').select('status, tier').eq('user_id', user.id).single();
      const walletPromise = supabase.from('gem_wallets').select('balance').eq('user_id', user.id).single();

      let charInfo: typeof characterInfo = null;

      if (isUserCharacter) {
        const { data } = await supabase
          .from('user_characters' as any)
          .select('id, name, avatar_url, personality_prompt')
          .eq('id', actualId)
          .single();
        if (data) {
          const d = data as any;
          charInfo = { id: d.id, name: d.name, avatar: d.avatar_url || '', online: true, isUserCharacter: true };
        }
      } else {
        const { data } = await supabase
          .from('companion_models')
          .select('id, name, avatar, online')
          .eq('id', actualId)
          .maybeSingle();
        if (data) {
          charInfo = { ...data, isUserCharacter: false };
        } else {
          // Fallback: check user_characters in case the route is missing the user- prefix
          const { data: ucData } = await supabase
            .from('user_characters' as any)
            .select('id, name, avatar_url, personality_prompt')
            .eq('id', actualId)
            .maybeSingle();
          if (ucData) {
            const d = ucData as any;
            charInfo = { id: d.id, name: d.name, avatar: d.avatar_url || '', online: true, isUserCharacter: true };
          }
        }
      }

      const [subRes, walletRes] = await Promise.all([subPromise, walletPromise]);
      if (charInfo) setCharacterInfo(charInfo);
      if (subRes.data) setSubscription(subRes.data);
      if (walletRes.data) setDiamondBalance(walletRes.data.balance);

      if (!charInfo) {
        setInitialLoading(false);
        return;
      }

      // For user characters, we use the actual character ID as model_id in conversations
      const convModelId = isUserCharacter ? actualId! : actualId!;

      // Find or create conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('model_id', convModelId)
        .limit(1)
        .single();

      let convId: string;
      if (existing) {
        convId = existing.id;
      } else {
        // For user characters, we can't use foreign key to companion_models
        // So we store with the user character ID directly
        if (isUserCharacter) {
          // Insert without foreign key constraint - use service function or direct
          const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({ user_id: user.id, model_id: convModelId })
            .select('id')
            .single();
          if (error) {
            console.error('Create conversation error:', error);
            // If FK constraint fails, still try to use the chat without persisting conversation
            convId = '';
          } else {
            convId = newConv?.id || '';
          }
        } else {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({ user_id: user.id, model_id: convModelId })
            .select('id')
            .single();
          convId = newConv?.id || '';
        }
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
          setMessages(msgs.map(msg => {
            const imageMatch = msg.message.match(/\[Image:\s*(https?:\/\/[^\]]+)\]/);
            const imageUrl = imageMatch ? imageMatch[1] : undefined;
            const text = imageMatch ? msg.message.replace(/\n?\[Image:\s*https?:\/\/[^\]]+\]/, '').trim() : msg.message;
            return {
              id: msg.id,
              sender: (msg.sender_type === 'user' ? 'user' : 'model') as 'user' | 'model',
              text,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              imageUrl,
            };
          }));
        } else if (charInfo) {
          setMessages([{
            id: '0',
            sender: 'model',
            text: `Hey there! 💕 I'm ${charInfo.name}. So glad you're here. What's on your mind today?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } else if (charInfo) {
        // No conversation persisted, start fresh
        setMessages([{
          id: '0',
          sender: 'model',
          text: `Hey there! 💕 I'm ${charInfo.name}. So glad you're here. What's on your mind today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
      setInitialLoading(false);
    };
    init();
  }, [actualId, user, isUserCharacter]);

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
            // Avoid duplicates from realtime when we already added the message client-side
            const msgText = msg.message || '';
            if (prev.some(m => m.sender === 'model' && m.text === msgText && msgText.length > 10)) return prev;
            return [...prev, {
              id: msg.id,
              sender: 'model' as const,
              text: msgText,
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
    if (!input.trim() || !user || isLocked) return;

    const messageText = input.trim();
    const optimisticId = crypto.randomUUID();

    const userMsg: ChatMessage = {
      id: optimisticId,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Save user message to DB if conversation exists
    if (conversationId) {
      supabase.from('messages').insert({
        conversation_id: conversationId,
        message: messageText,
        sender_type: 'user',
        sender_id: user.id,
      }).then(() => {
        setMessages(prev => prev.map(m => m.id === optimisticId ? { ...m, pending: false } : m));
      });
    } else {
      setMessages(prev => prev.map(m => m.id === optimisticId ? { ...m, pending: false } : m));
    }

    // Call AI chat edge function with streaming
    try {
      const chatHistory = messages.filter(m => m.id !== '0').map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));
      chatHistory.push({ role: 'user', content: messageText });

      const { data: { session } } = await supabase.auth.getSession();
      
      // For user characters, pass the character ID; for public models, pass modelId
      const chatModelId = isUserCharacter ? `user-${actualId}` : actualId;
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory, modelId: chatModelId, conversationId }),
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

      const contentType = resp.headers.get('Content-Type') || '';

      // Handle JSON response (image requests)
      if (contentType.includes('application/json')) {
        const jsonData = await resp.json();
        const assistantId = crypto.randomUUID();
        const assistantText = jsonData.reply || '';
        const imageUrl = jsonData.imageUrl || null;

        setMessages(prev => [...prev, {
          id: assistantId,
          sender: 'model' as const,
          text: assistantText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl,
        }]);
        setIsTyping(false);

        if (assistantText && conversationId) {
          const msgContent = imageUrl ? `${assistantText}\n[Image: ${imageUrl}]` : assistantText;
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            message: msgContent,
            sender_type: 'model',
          });
          if (subscription && subscription.status !== 'active') {
            setDiamondBalance(prev => Math.max(0, prev - 2));
          }
        }
        return;
      }

      // Stream response (standard chat)
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
      if (assistantText && conversationId) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          message: assistantText,
          sender_type: 'model',
        });
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

  if (initialLoading) return <ChatSkeleton />;

  const navigate = useNavigate();

  if (!characterInfo) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to={characterInfo.isUserCharacter ? "/dashboard/my-characters" : "/dashboard/models"}>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="relative">
          {characterInfo.avatar ? (
            <img src={characterInfo.avatar} alt={characterInfo.name} className="w-11 h-11 rounded-full object-cover border-2 border-primary/30" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
              <span className="text-sm font-bold text-primary">{characterInfo.name.charAt(0)}</span>
            </div>
          )}
          {characterInfo.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[hsl(var(--online))] border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{characterInfo.name}</h2>
          <span className="text-xs text-muted-foreground">
            {characterInfo.isUserCharacter ? 'Your Character' : characterInfo.online ? 'Online now' : 'Away'}
          </span>
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
              animate={{ opacity: msg.pending ? 0.6 : 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                  : 'glass-card text-card-foreground rounded-2xl rounded-bl-md'
              } px-4 py-3`}>
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-2">
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={msg.imageUrl} alt="Sent photo" className="w-full max-w-[300px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" />
                    </a>
                  </div>
                )}
                {msg.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {msg.pending ? 'Sending...' : msg.time}
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
