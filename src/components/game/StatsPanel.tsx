import { PlayerStats } from '@/types/game';
import { Brain, Heart, Dumbbell, Sparkles, Clover, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatsPanelProps {
  stats: PlayerStats;
}

const StatBar = ({ 
  label, 
  value, 
  icon: Icon, 
  colorClass,
  compact = false
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  colorClass: string;
  compact?: boolean;
}) => (
  <div className={compact ? "mb-2" : "mb-4"}>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-3 w-3 md:h-4 md:w-4 ${colorClass}`} />
        <span className="text-xs md:text-sm font-mono">{label}</span>
      </div>
      <span className={`text-xs md:text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
    <div className={`stat-bar ${compact ? 'h-2' : 'h-3'}`}>
      <div 
        className={`stat-bar-fill ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatsPanel = ({ stats }: StatsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg p-3 md:p-4 card-glow">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between lg:pointer-events-none"
      >
        <h3 className="font-display text-base md:text-lg text-primary">Stats</h3>
        <span className="lg:hidden text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      
      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 md:mt-4"
          >
            <StatBar 
              label="IQ" 
              value={stats.iq} 
              icon={Brain} 
              colorClass="text-info"
              compact
            />
            <StatBar 
              label="Gesundheit" 
              value={stats.health} 
              icon={Heart} 
              colorClass="text-health"
              compact
            />
            <StatBar 
              label="Fitness" 
              value={stats.fitness} 
              icon={Dumbbell} 
              colorClass="text-fitness"
              compact
            />
            <StatBar 
              label="Aussehen" 
              value={stats.looks} 
              icon={Sparkles} 
              colorClass="text-looks"
              compact
            />
            <StatBar 
              label="Glück" 
              value={stats.luck} 
              icon={Clover} 
              colorClass="text-luck"
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsPanel;
