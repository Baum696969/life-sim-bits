import { motion } from 'framer-motion';
import { Player, TimelineEvent } from '@/types/game';
import { formatMoney } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';
import { clearSave } from '@/lib/gameUtils';

interface GameOverScreenProps {
  player: Player;
  timeline: TimelineEvent[];
  onRestart: () => void;
}

const GameOverScreen = ({ player, timeline, onRestart }: GameOverScreenProps) => {
  const handleRestart = () => {
    clearSave();
    onRestart();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-card rounded-lg p-8 card-glow text-center"
      >
        <div className="mb-6">
          <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="font-display text-4xl text-destructive mb-2">Game Over</h1>
          <p className="text-muted-foreground">
            {player.name} ist im Alter von {player.age} Jahren gestorben.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Alter</p>
            <p className="text-2xl font-bold text-primary">{player.age}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Vermögen</p>
            <p className="text-2xl font-bold text-money">{formatMoney(player.money)}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-display text-lg text-primary mb-3">Letzte Ereignisse</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {timeline.slice(0, 5).map((event) => (
              <div key={event.id} className="text-sm text-muted-foreground">
                Alter {event.age}: {event.title}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleRestart}
          className="game-btn bg-primary text-primary-foreground px-8 py-4"
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Neues Leben
        </Button>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
