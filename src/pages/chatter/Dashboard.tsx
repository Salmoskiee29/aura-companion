import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, Star, LogOut, Heart,
  Send, Search, Bell, Wifi, WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatter } from '@/contexts/ChatterContext';
import { useRoleAuth } from '@/contexts/RoleAuthContext';

const ChatterDashboard = () => {
  const navigate = useNavigate();
  const { logoutChatter } = useRoleAuth();
  const {
    chatters, conversations, notifications,
    addChatterReply, toggleChatterStatus, dismissNotification,
  } = useChatter();

  const handleLogout = () => {
    logoutChatter();
    navigate('/chatter-login');
  };

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeChatterId, setActiveChatterId] = useState(chatters.find(c => c.status === 'online')?.id || chatters[0]?.id);

  // Select first conversation on load
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const activeChatter = chatters.find(c => c.id === activeChatterId);
  const myConversations = conversations.filter(c => c.chatterId === activeChatterId);
  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return;
    addChatterReply(selectedConversation, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-foreground">Chatter Panel</span>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Chatter selector */}
          <select
            value={activeChatterId}
            onChange={(e) => setActiveChatterId(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {chatters.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status}) — {c.activeConversationCount} active
              </option>
            ))}
          </select>

          {/* Toggle online status */}
          {activeChatter && (
            <Button
              size="sm"
              variant="outline"
              className={`w-full text-xs ${activeChatter.status === 'online' ? 'border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}
              onClick={() => toggleChatterStatus(activeChatterId!)}
            >
              {activeChatter.status === 'online' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
              {activeChatter.status === 'online' ? 'Online' : 'Offline'} — Click to toggle
            </Button>
          )}

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search conversations..."
              className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-3 mt-2 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2"
            >
              <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Just now</p>
              </div>
              <button onClick={() => dismissNotification(n.id)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{myConversations.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{activeChatter?.activeConversationCount || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {myConversations.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">New subscribers will appear here</p>
            </div>
          ) : (
            myConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-border hover:bg-secondary/50 transition-colors text-left ${
                  selectedConversation === conv.id ? 'bg-secondary' : ''
                }`}
              >
                <div className="relative">
                  <img src={conv.modelAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{conv.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].time : 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    as {conv.modelName}: {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : 'New subscriber — say hello!'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="glass-card border-b px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img src={selectedConv.modelAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedConv.userName} → {selectedConv.modelName}
                  </h3>
                  <span className="text-xs text-primary">Subscriber • Active</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-secondary text-xs">
                  <Star className="mr-1 h-3 w-3" /> Mark VIP
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConv.messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">New subscriber! Send the first message as {selectedConv.modelName}.</p>
                  </div>
                </div>
              ) : (
                selectedConv.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      msg.sender === 'user'
                        ? 'bg-secondary text-secondary-foreground rounded-2xl rounded-br-md'
                        : 'bg-primary/10 border border-primary/20 text-foreground rounded-2xl rounded-bl-md'
                    } px-4 py-3`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Reply */}
            <div className="glass-card border-t px-6 py-4 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">
                Replying as <span className="text-primary font-medium">{selectedConv.modelName}</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder={`Type reply as ${selectedConv.modelName}...`}
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button
                  onClick={handleSendReply}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-5"
                >
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
                {myConversations.length === 0
                  ? 'No subscribers assigned yet. They will appear when users subscribe.'
                  : 'Select a conversation to start replying'
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatterDashboard;
