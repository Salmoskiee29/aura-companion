import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserCircle, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavedCharacter {
  id: string;
  imageUrl: string;
  createdAt: string;
  isActive: boolean;
  selections: Record<string, string>;
}

export default function MyCharacter() {
  const [character, setCharacter] = useState<SavedCharacter | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lumiere_active_character');
    if (saved) setCharacter(JSON.parse(saved));
  }, []);

  if (!character) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <UserCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">No Character Yet</h1>
          <p className="text-muted-foreground mb-6">Create your own AI companion to get started.</p>
          <Link to="/dashboard/create-character">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Character
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">
          My <span className="text-gradient-primary">Character</span>
        </h1>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="aspect-[3/4] max-w-sm mx-auto m-6 rounded-xl overflow-hidden border border-border bg-secondary">
            <img src={character.imageUrl} alt="My character" className="w-full h-full object-cover" />
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Details */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(character.selections).map(([key, val]) => (
                <span key={key} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {val}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {new Date(character.createdAt).toLocaleDateString()}
            </div>

            <div className="flex gap-3 pt-2">
              <Link to="/dashboard/create-character" className="flex-1">
                <Button variant="outline" className="w-full border-border text-foreground">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace Character
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
