import { PlayerStats } from '@/types/game';
import { Brain, Heart, Dumbbell, Sparkles, Clover } from 'lucide-react';

interface StatsPanelProps {
  stats: PlayerStats;
}

const StatBar = ({ 
  label, 
  value, 
  icon: Icon, 
  colorClass 
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  colorClass: string;
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className="text-sm font-mono">{label}</span>
      </div>
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
    <div className="stat-bar h-3">
      <div 
        className={`stat-bar-fill ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <div className="bg-card rounded-lg p-4 card-glow">
      <h3 className="font-display text-lg text-primary mb-4">Stats</h3>
      
      <StatBar 
        label="IQ" 
        value={stats.iq} 
        icon={Brain} 
        colorClass="text-info" 
      />
      <StatBar 
        label="Gesundheit" 
        value={stats.health} 
        icon={Heart} 
        colorClass="text-health" 
      />
      <StatBar 
        label="Fitness" 
        value={stats.fitness} 
        icon={Dumbbell} 
        colorClass="text-fitness" 
      />
      <StatBar 
        label="Aussehen" 
        value={stats.looks} 
        icon={Sparkles} 
        colorClass="text-looks" 
      />
      <StatBar 
        label="Glück" 
        value={stats.luck} 
        icon={Clover} 
        colorClass="text-luck" 
      />
    </div>
  );
};

export default StatsPanel;
