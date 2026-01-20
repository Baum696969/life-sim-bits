import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, GameEvent, EventOption } from '@/types/game';
import { seedEvents, getEventsForAge, selectRandomEvent } from '@/data/seedEvents';
import { agePlayer, applyEffects, createTimelineEvent, saveGame, formatMoney } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';
import StatsPanel from './StatsPanel';
import EventPanel from './EventPanel';
import TimelinePanel from './TimelinePanel';
import MinigameModal from './MinigameModal';
import GameOverScreen from './GameOverScreen';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Volume2, VolumeX, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface GameScreenProps {
  initialState: GameState;
  onExit: () => void;
}

const GameScreen = ({ initialState, onExit }: GameScreenProps) => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [allEvents, setAllEvents] = useState<GameEvent[]>(seedEvents);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentMinigame, setCurrentMinigame] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

  // Start ambient music on mount
  useEffect(() => {
    if (soundEnabled) {
      soundManager.startBackgroundMusic();
    }
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

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
    soundManager.playClick();
    setSelectedOption(option);

    if (option.minigame) {
      soundManager.playMinigameStart();
      setCurrentMinigame(option.minigame);
      setShowMinigame(true);
    } else {
      applyOptionEffects(option);
    }
  };

  const applyOptionEffects = (option: EventOption, bonusEffects?: any) => {
    const effects = { ...option.effects, ...bonusEffects };
    const newPlayer = applyEffects(gameState.player, effects);

    // Check if health dropped to 0 or below
    const isDead = newPlayer.stats.health <= 0 || !newPlayer.isAlive;

    // Play appropriate sound based on effects
    const totalDelta = (effects.moneyDelta || 0) + (effects.iqDelta || 0) + 
      (effects.healthDelta || 0) + (effects.fitnessDelta || 0) + (effects.looksDelta || 0);
    
    if (totalDelta > 0) {
      soundManager.playPositiveEffect();
      if (effects.moneyDelta && effects.moneyDelta > 0) {
        soundManager.playCoins();
      }
    } else if (totalDelta < 0) {
      soundManager.playNegativeEffect();
    }

    const timelineEvent = createTimelineEvent(
      gameState.year,
      gameState.player.age,
      gameState.currentEvent?.title || 'Event',
      option.resultText,
      effects
    );

    setGameState(prev => ({
      ...prev,
      player: { ...newPlayer, isAlive: !isDead },
      timeline: [timelineEvent, ...prev.timeline].slice(0, 50),
      gameOver: isDead,
    }));

    if (isDead) {
      soundManager.playGameOver();
    }

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
    soundManager.playNewYear();
    const agedPlayer = agePlayer(gameState.player);
    
    // Check if health is 0 or below
    const isDead = agedPlayer.stats.health <= 0 || !agedPlayer.isAlive;
    
    setGameState(prev => ({
      ...prev,
      player: { ...agedPlayer, isAlive: !isDead },
      year: prev.year + 1,
      gameOver: isDead,
    }));

    if (!isDead) {
      selectNextEvent();
    } else {
      soundManager.playGameOver();
    }
  };

  const goToCasino = () => {
    // Save current game state before navigating
    saveGame(gameState);
    navigate('/casino');
  };

  const toggleSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
    if (newEnabled) {
      soundManager.startBackgroundMusic();
    } else {
      soundManager.stopBackgroundMusic();
    }
  };

  if (gameState.gameOver) {
    return <GameOverScreen player={gameState.player} timeline={gameState.timeline} onRestart={onExit} />;
  }

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onExit} className="text-muted-foreground h-8 w-8 md:h-10 md:w-10">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSound} className="text-muted-foreground h-8 w-8 md:h-10 md:w-10">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={goToCasino} className="text-muted-foreground h-8 w-8 md:h-10 md:w-10" title="Casino">
              <Coins className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center">
            <h2 className="font-display text-lg md:text-2xl text-primary">{gameState.player.name}</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Alter: {gameState.player.age} | Jahr: {gameState.year}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg md:text-2xl font-bold text-primary">
              {formatMoney(gameState.player.money)}
            </span>
          </div>
        </div>

        {/* Main Layout - Mobile optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Stats - Collapsible on mobile */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <StatsPanel stats={gameState.player.stats} />
          </div>

          {/* Event - Primary focus */}
          <div className="lg:col-span-6 order-1 lg:order-2">
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
                  className="game-btn bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full md:w-auto"
                >
                  Nächstes Jahr <ChevronRight className="ml-2" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Timeline - Hidden on mobile, shown as overlay */}
          <div className="lg:col-span-3 order-3 hidden lg:block">
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
