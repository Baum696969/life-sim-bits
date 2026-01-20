import { motion } from 'framer-motion';
import { GameEvent, EventOption } from '@/types/game';
import { formatEffects } from '@/lib/gameUtils';

interface EventPanelProps {
  event: GameEvent;
  onOptionSelect: (option: EventOption) => void;
  selectedOption: EventOption | null;
  showResult: boolean;
}

const EventPanel = ({ event, onOptionSelect, selectedOption, showResult }: EventPanelProps) => {
  return (
    <div className="bg-card rounded-lg p-6 card-glow">
      <div className="mb-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {event.category}
        </span>
      </div>
      
      <h2 className="font-display text-2xl text-primary mb-4">{event.title}</h2>
      <p className="text-foreground/90 mb-6 leading-relaxed">{event.text}</p>

      {!showResult ? (
        <div className="space-y-3">
          {event.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onOptionSelect(option)}
              className="event-option w-full text-left"
            >
              <span className="font-medium text-foreground">{option.label}</span>
              {option.minigame && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  🎮 Minigame
                </span>
              )}
            </motion.button>
          ))}
        </div>
      ) : selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-lg p-4"
        >
          <p className="text-foreground mb-3">{selectedOption.resultText}</p>
          <div className="flex flex-wrap gap-2">
            {formatEffects(selectedOption.effects).map((effect, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-sm font-mono ${
                  effect.startsWith('+') 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {effect}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EventPanel;
