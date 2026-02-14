import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, Star, LogOut, Heart,
  Send, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockModels } from '@/data/models';

interface MockConversation {
  id: string;
  userName: string;
  modelName: string;
  modelAvatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  isVip: boolean;
  subscriptionStatus: 'active' | 'inactive';
}

const mockConversations: MockConversation[] = [
  { id: '1', userName: 'John D.', modelName: 'Sophia', modelAvatar: mockModels[0].avatar, lastMessage: 'Hey, how was your day?', time: '2m ago', unread: true, isVip: false, subscriptionStatus: 'active' },
  { id: '2', userName: 'Alex M.', modelName: 'Sophia', modelAvatar: mockModels[0].avatar, lastMessage: 'That sounds amazing!', time: '15m ago', unread: false, isVip: true, subscriptionStatus: 'active' },
  { id: '3', userName: 'Chris R.', modelName: 'Emma', modelAvatar: mockModels[3].avatar, lastMessage: 'Tell me more about...', time: '1h ago', unread: true, isVip: false, subscriptionStatus: 'active' },
];

const ChatterDashboard = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [replyText, setReplyText] = useState('');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-foreground">Chatter</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search conversations..."
              className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">VIP</p>
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full flex items-center gap-3 p-4 border-b border-border hover:bg-secondary/50 transition-colors text-left ${
                selectedConversation === conv.id ? 'bg-secondary' : ''
              }`}
            >
              <div className="relative">
                <img src={conv.modelAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                {conv.unread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1">
                    {conv.userName}
                    {conv.isVip && <Star className="h-3 w-3 text-accent fill-accent" />}
                  </span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  as {conv.modelName}: {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="glass-card border-b px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img src={mockModels[0].avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    John D. → Sophia
                  </h3>
                  <span className="text-xs text-emerald-400">Subscriber • Active</span>
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
              {[
                { sender: 'user', text: 'Hey Sophia! How was your day?', time: '2:30 PM' },
                { sender: 'model', text: "Hey! My day was great, thanks for asking! 😊 I went to a new art gallery today. How about yours?", time: '2:31 PM' },
                { sender: 'user', text: "That sounds amazing! I love art galleries. What kind of art did they have?", time: '2:33 PM' },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${
                    msg.sender === 'user'
                      ? 'bg-secondary text-secondary-foreground rounded-2xl rounded-br-md'
                      : 'bg-primary/10 border border-primary/20 text-foreground rounded-2xl rounded-bl-md'
                  } px-4 py-3`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="glass-card border-t px-6 py-4 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Replying as <span className="text-primary font-medium">Sophia</span></p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply as Sophia..."
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-5">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start replying</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatterDashboard;
