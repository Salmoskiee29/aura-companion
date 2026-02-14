import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { mockModels } from '@/data/models';
import { PaywallModal } from '@/components/chat/PaywallModal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

const FREE_MESSAGE_LIMIT = 5;

const Chat = () => {
  const { modelId } = useParams();
  const model = mockModels.find(m => m.id === modelId) || mockModels[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      sender: 'model',
      text: `Hey there! 💕 I'm ${model.name}. So glad you're here. What's on your mind today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubscribed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const mockReplies = [
    `That's so sweet of you to say! 😊 I really enjoy talking with you. Tell me more about yourself!`,
    `Mmm I love that! You know what, I've been thinking about you... What do you do for fun?`,
    `Haha you're so funny! 😄 I feel like we really click. What's your favorite way to spend a weekend?`,
    `You're making me smile so much right now ☺️ I'm curious though... what made you want to talk to me?`,
    `I feel like I could talk to you for hours... 💭 There's something special about this connection, don't you think?`,
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    if (!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const newCount = freeMessagesUsed + 1;
    setFreeMessagesUsed(newCount);

    setIsTyping(true);
    const delay = 1500 + Math.random() * 3000;
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: mockReplies[Math.min(newCount - 1, mockReplies.length - 1)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);

      if (!isSubscribed && newCount >= FREE_MESSAGE_LIMIT) {
        setTimeout(() => setShowPaywall(true), 1500);
      }
    }, delay);
  };

  const remainingFree = Math.max(0, FREE_MESSAGE_LIMIT - freeMessagesUsed);

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
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-online border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{model.name}</h2>
          <span className="text-xs text-muted-foreground">{model.online ? 'Online now' : 'Away'}</span>
        </div>
        {!isSubscribed && (
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
            {remainingFree} free left
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
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT ? 'Subscribe to continue...' : 'Type a message...'}
            disabled={!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT}
            className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || (!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT)}
            className="h-12 w-12 rounded-2xl btn-premium text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Paywall */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        modelName={model.name}
      />
    </div>
  );
};

export default Chat;
