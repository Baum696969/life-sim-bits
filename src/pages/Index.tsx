import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Settings, Gamepad2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasSavedGame, loadGame, createNewPlayer, createNewGameState, clearSave } from '@/lib/gameUtils';
import GameScreen from '@/components/game/GameScreen';
import { GameState } from '@/types/game';
import { Link } from 'react-router-dom';
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    setHasSave(hasSavedGame());
  }, []);

  const startNewGame = () => {
    if (!playerName.trim()) return;
    const player = createNewPlayer(playerName);
    const state = createNewGameState(player);
    setGameState(state);
    setShowGame(true);
    setShowNameInput(false);
  };

  const continueGame = () => {
    const saved = loadGame();
    if (saved) {
      setGameState(saved);
      setShowGame(true);
    }
  };

  const handleNewGameClick = () => {
    clearSave();
    setShowNameInput(true);
  };

  if (showGame && gameState) {
    return <GameScreen initialState={gameState} onExit={() => setShowGame(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${Math.random() * 100 + 50}px`,
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.h1
          className="font-display text-6xl md:text-8xl font-black text-primary text-glow mb-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          GitLife
        </motion.h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-12 font-mono">
          Lebe dein virtuelles Leben. Jede Entscheidung zählt.
        </p>

        {/* Name Input */}
        <AnimatePresence mode="wait">
          {showNameInput ? (
            <motion.div
              key="name-input"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 mb-8"
            >
              <input
                type="text"
                placeholder="Dein Name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                className="w-full max-w-xs px-4 py-3 bg-card border-2 border-primary/50 rounded-lg text-foreground font-mono text-center focus:outline-none focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all"
                autoFocus
              />
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startNewGame}
                  disabled={!playerName.trim()}
                  className="game-btn bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" /> Starten
                </Button>
                <Button
                  onClick={() => setShowNameInput(false)}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 px-6 py-6"
                >
                  Zurück
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 items-center"
            >
              <Button
                onClick={handleNewGameClick}
                className="game-btn bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-xl w-64"
              >
                <Play className="mr-2 h-6 w-6" /> Neues Leben
              </Button>
              
              {hasSave && (
                <Button
                  onClick={continueGame}
                  variant="outline"
                  className="game-btn border-2 border-primary text-primary hover:bg-primary/10 px-10 py-7 text-xl w-64"
                >
                  <RotateCcw className="mr-2 h-6 w-6" /> Fortsetzen
                </Button>
              )}

              <div className="flex gap-3 mt-4">
                <Link to="/casino">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <DollarSign className="mr-2 h-5 w-5" /> Casino
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Settings className="mr-2 h-5 w-5" /> Einstellungen
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          {[
            { icon: '🎮', label: 'Minigames' },
            { icon: '🎰', label: 'Casino' },
            { icon: '📊', label: 'Stats' },
            { icon: '⚡', label: 'Events' },
          ].map((feature, i) => (
            <div key={i} className="p-4 rounded-lg bg-card/50 border border-primary/20">
              <span className="text-2xl">{feature.icon}</span>
              <p className="text-sm text-muted-foreground mt-1">{feature.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
