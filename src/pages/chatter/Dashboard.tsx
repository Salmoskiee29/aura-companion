import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, LogOut,
  Send, Wifi, WifiOff, Sun, Moon, Menu, X,
} from 'lucide-react';
import logoImg from '@/assets/yourmatch-logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConversationItem {
  id: string;
  user_id: string;
  model_id: string;
  user_email: string;
  model_name: string;
  created_at: string;
}

interface MessageItem {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

const ChatterDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState('');
  const [chatterStatus, setChatterStatus] = useState<'online' | 'offline'>('offline');
  const [workload, setWorkload] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch chatter's status
  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('chatters')
        .select('status, active_conversations')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setChatterStatus(data.status as 'online' | 'offline');
        setWorkload(data.active_conversations);
      }
    };
    fetchStatus();
  }, [user]);

  // Fetch assigned conversations
  useEffect(() => {
    if (!user) return;
    const fetchConvs = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('id, user_id, model_id, created_at')
        .eq('assigned_chatter_id', user.id);
      
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const modelIds = [...new Set(data.map(c => c.model_id))];
        
        const { data: profiles } = await supabase.from('profiles').select('user_id, email').in('user_id', userIds);
        const { data: models } = await supabase.from('companion_models').select('id, name').in('id', modelIds);
        
        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
        const modelMap = new Map(models?.map(m => [m.id, m.name]) || []);

        setConversations(data.map(c => ({
          ...c,
          user_email: emailMap.get(c.user_id) || 'Unknown',
          model_name: modelMap.get(c.model_id) || 'Unknown',
        })));
      } else {
        setConversations([]);
      }
    };
    fetchConvs();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, message, sender_type, created_at')
        .eq('conversation_id', selectedConv)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [selectedConv]);

  const toggleStatus = async () => {
    if (!user) return;
    const newStatus = chatterStatus === 'online' ? 'offline' : 'online';
    await supabase
      .from('chatters')
      .update({ status: newStatus })
      .eq('user_id', user.id);
    setChatterStatus(newStatus);
    toast.success(`You are now ${newStatus}`);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv || !user) return;
    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConv,
      message: replyText.trim(),
      sender_type: 'chatter',
      sender_id: user.id,
    });
    if (error) {
      toast.error('Failed to send message');
      return;
    }
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      message: replyText.trim(),
      sender_type: 'chatter',
      created_at: new Date().toISOString(),
    }]);
    setReplyText('');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const activeConv = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="YourMatch" className="h-5 w-5 rounded" />
              <span className="font-display font-bold text-foreground">YourMatch</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <button onClick={handleLogout} className="hidden md:block text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{user?.email}</p>

          {/* Status toggle */}
          <Button
            size="sm"
            variant="outline"
            className={`w-full text-xs ${chatterStatus === 'online' ? 'border-chatter-primary/30 text-chatter-primary' : 'border-border text-muted-foreground'}`}
            onClick={toggleStatus}
          >
            {chatterStatus === 'online' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {chatterStatus === 'online' ? 'Online' : 'Offline'} — Click to toggle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-chatter-primary">{conversations.length}</p>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-chatter-primary">{workload}</p>
            <p className="text-xs text-muted-foreground">Workload</p>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations assigned yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedConv(conv.id); setMobileSidebarOpen(false); }}
                className={`w-full flex flex-col gap-1 p-4 border-b border-border hover:bg-secondary/50 transition-colors text-left ${
                  selectedConv === conv.id ? 'bg-chatter-primary/5 border-l-2 border-l-chatter-primary' : ''
                }`}
              >
                <span className="text-sm font-medium text-foreground">{conv.user_email}</span>
                <span className="text-xs text-muted-foreground">Model: {conv.model_name}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Toggle Theme
          </Button>
          <button onClick={handleLogout} className="md:hidden w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold tracking-widest text-chatter-primary uppercase">Chatter Panel</span>
          </div>
          {activeConv && (
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{activeConv.user_email}</p>
              <p className="text-xs text-muted-foreground">as {activeConv.model_name}</p>
            </div>
          )}
        </header>

        {activeConv ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No messages yet. Send the first one!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.sender_type === 'user'
                        ? 'bg-secondary text-secondary-foreground rounded-br-md'
                        : 'bg-chatter-primary/10 border border-chatter-primary/20 text-foreground rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-border px-6 py-4 shrink-0 bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder={`Type reply as ${activeConv.model_name}...`}
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chatter-primary/40"
                />
                <Button onClick={handleSendReply} className="bg-chatter-primary hover:bg-chatter-primary/90 text-chatter-primary-foreground rounded-xl h-12 px-5">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {conversations.length === 0 ? 'No users assigned yet.' : 'Select a conversation to start replying'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatterDashboard;
