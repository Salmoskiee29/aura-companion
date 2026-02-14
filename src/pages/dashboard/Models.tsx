import { motion } from 'framer-motion';
import { mockModels } from '@/data/models';
import { ModelCard } from '@/components/models/ModelCard';

export default function DashboardModels() {
  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Meet Your <span className="text-gradient-primary">Companions</span>
        </h1>
        <p className="text-muted-foreground">Choose someone who matches your vibe.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl">
        {mockModels.map((model, i) => (
          <ModelCard key={model.id} model={model} index={i} />
        ))}
      </div>
    </div>
  );
}
