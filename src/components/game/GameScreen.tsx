import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, GameEvent, EventOption, TimelineEvent } from '@/types/game';
import { seedEvents, getEventsForAge, selectRandomEvent } from '@/data/seedEvents';
import { agePlayer, applyEffects, createTimelineEvent, saveGame, formatMoney, formatEffects } from '@/lib/gameUtils';
import StatsPanel from './StatsPanel';
import EventPanel from './EventPanel';
import TimelinePanel from './TimelinePanel';
import MinigameModal from './MinigameModal';
import GameOverScreen from './GameOverScreen';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GameScreenProps {
  initialState: GameState;
  onExit: () => void;
}

const GameScreen = ({ initialState, onExit }: GameScreenProps) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [allEvents, setAllEvents] = useState<GameEvent[]>(seedEvents);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentMinigame, setCurrentMinigame] = useState<string | null>(null);

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true);

      if (data && !error) {
        const dbEvents: GameEvent[] = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          text: e.text,
          minAge: e.min_age,
          maxAge: e.max_age,
          category: e.category,
          weight: Number(e.weight),
          tags: e.tags || [],
          options: e.options || [],
        }));
        setAllEvents([...seedEvents, ...dbEvents]);
      }
    };
    loadEvents();
  }, []);

  // Select initial event
  useEffect(() => {
    if (!gameState.currentEvent && !gameState.gameOver) {
      selectNextEvent();
    }
  }, []);

  // Auto-save
  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  const selectNextEvent = () => {
    const eligibleEvents = getEventsForAge(allEvents, gameState.player.age);
    const event = selectRandomEvent(eligibleEvents);
    setGameState(prev => ({ ...prev, currentEvent: event }));
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleOptionSelect = (option: EventOption) => {
    setSelectedOption(option);

    if (option.minigame) {
      setCurrentMinigame(option.minigame);
      setShowMinigame(true);
    } else {
      applyOptionEffects(option);
    }
  };

  const applyOptionEffects = (option: EventOption, bonusEffects?: any) => {
    const effects = { ...option.effects, ...bonusEffects };
    const newPlayer = applyEffects(gameState.player, effects);

    const timelineEvent = createTimelineEvent(
      gameState.year,
      gameState.player.age,
      gameState.currentEvent?.title || 'Event',
      option.resultText,
      effects
    );

    setGameState(prev => ({
      ...prev,
      player: newPlayer,
      timeline: [timelineEvent, ...prev.timeline].slice(0, 50),
      gameOver: !newPlayer.isAlive,
    }));

    setShowResult(true);
  };

  const handleMinigameComplete = (result: { score: number; won: boolean; effects: any }) => {
    setShowMinigame(false);
    if (selectedOption) {
      const combinedEffects = {
        ...selectedOption.effects,
        ...result.effects,
      };
      applyOptionEffects({ ...selectedOption, effects: combinedEffects });
    }
  };

  const advanceYear = () => {
    const agedPlayer = agePlayer(gameState.player);
    
    setGameState(prev => ({
      ...prev,
      player: agedPlayer,
      year: prev.year + 1,
      gameOver: !agedPlayer.isAlive,
    }));

    if (agedPlayer.isAlive) {
      selectNextEvent();
    }
  };

  if (gameState.gameOver) {
    return <GameOverScreen player={gameState.player} timeline={gameState.timeline} onRestart={onExit} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit} className="text-muted-foreground">
            <Home className="mr-2 h-4 w-4" /> Menü
          </Button>
          <div className="text-center">
            <h2 className="font-display text-2xl text-primary">{gameState.player.name}</h2>
            <p className="text-muted-foreground">
              Alter: {gameState.player.age} | Jahr: {gameState.year}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              {formatMoney(gameState.player.money)}
            </span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stats */}
          <div className="lg:col-span-3">
            <StatsPanel stats={gameState.player.stats} />
          </div>

          {/* Event */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {gameState.currentEvent && (
                <motion.div
                  key={gameState.currentEvent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EventPanel
                    event={gameState.currentEvent}
                    onOptionSelect={handleOptionSelect}
                    selectedOption={selectedOption}
                    showResult={showResult}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center"
              >
                <Button
                  onClick={advanceYear}
                  className="game-btn bg-primary text-primary-foreground px-8 py-4 text-lg"
                >
                  Nächstes Jahr <ChevronRight className="ml-2" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3">
            <TimelinePanel timeline={gameState.timeline} />
          </div>
        </div>
      </div>

      {/* Minigame Modal */}
      <MinigameModal
        isOpen={showMinigame}
        minigame={currentMinigame}
        onComplete={handleMinigameComplete}
        onClose={() => setShowMinigame(false)}
        playerMoney={gameState.player.money}
      />
    </div>
  );
};

export default GameScreen;
