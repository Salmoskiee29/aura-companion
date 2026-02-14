import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    // Simulate typing
    setIsTyping(true);
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: mockReplies[Math.min(newCount - 1, mockReplies.length - 1)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);

      // Check if paywall should show after this reply
      if (!isSubscribed && newCount >= FREE_MESSAGE_LIMIT) {
        setTimeout(() => setShowPaywall(true), 1500);
      }
    }, delay);
  };

  const remainingFree = Math.max(0, FREE_MESSAGE_LIMIT - freeMessagesUsed);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="glass-card border-b px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/models">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <img src={model.avatar} alt={model.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/30" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{model.name}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        {!isSubscribed && (
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                  : 'bg-card border border-border text-card-foreground rounded-2xl rounded-bl-md'
              } px-4 py-3`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card border-t px-4 py-3 shrink-0">
        <div className="flex gap-2 items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT ? 'Subscribe to continue...' : 'Type a message...'}
            disabled={!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || (!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT)}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 w-12 shrink-0"
          >
            {!isSubscribed && freeMessagesUsed >= FREE_MESSAGE_LIMIT ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
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
