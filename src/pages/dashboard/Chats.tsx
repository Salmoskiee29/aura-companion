import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { mockModels } from '@/data/models';
import { Button } from '@/components/ui/button';

export default function DashboardChats() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Your <span className="text-gradient-primary">Chats</span>
        </h1>
        <p className="text-muted-foreground mb-8">Continue your conversations.</p>

        <div className="space-y-3">
          {mockModels.slice(0, 3).map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/chat/${model.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <img src={model.avatar} alt={model.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{model.name}</p>
                  <p className="text-xs text-muted-foreground truncate">Tap to continue chatting...</p>
                </div>
                {model.online && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/70 shrink-0" />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/dashboard/models">
            <Button variant="outline" className="border-border text-foreground">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
