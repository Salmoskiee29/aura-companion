import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockModels } from '@/data/models';
import { ModelCard } from '@/components/models/ModelCard';

const Models = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-foreground">Lumière</span>
            </div>
          </div>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Meet Your <span className="text-gradient-primary">Companions</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Choose someone who matches your vibe. Each companion is unique.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {mockModels.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Models;
