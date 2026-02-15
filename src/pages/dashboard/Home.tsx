import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Sparkles, MessageCircle, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const quickActions = [
  { to: '/dashboard/models', icon: Users, label: 'Browse Models', desc: 'Find your perfect companion' },
  { to: '/dashboard/create-character', icon: Sparkles, label: 'Create Character', desc: 'Generate your own AI model' },
  { to: '/dashboard/my-character', icon: UserCircle, label: 'My Character', desc: 'View your saved character' },
  { to: '/dashboard/chats', icon: MessageCircle, label: 'Chats', desc: 'Continue conversations' },
];

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Welcome back, <span className="text-gradient-primary">{user?.displayName || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mb-8">What would you like to do today?</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={action.to}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
