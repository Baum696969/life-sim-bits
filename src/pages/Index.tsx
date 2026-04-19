import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Settings, DollarSign, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasSavedGame, loadGame, createNewPlayer, createNewGameState, clearSave } from '@/lib/gameUtils';
import GameScreen from '@/components/game/GameScreen';
import ChangelogModal from '@/components/game/ChangelogModal';
import SplashScreen from '@/components/game/SplashScreen';
import LifeArchivePanel from '@/components/game/LifeArchivePanel';
import { GameState } from '@/types/game';
import { Link } from 'react-router-dom';
import logo from '@/assets/gitlife-logo.png';
import { COUNTRIES, SKIN_TONES, getCountry, getSkinTone } from '@/lib/countries';
import { randomFirstName, randomLastName } from '@/lib/randomNames';

const Index = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [playerGender, setPlayerGender] = useState<'male' | 'female'>('male');
  const [skinToneId, setSkinToneId] = useState<string>('mediumLight');
  const [countryCode, setCountryCode] = useState<string>('DE');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setHasSave(hasSavedGame());
  }, []);

  const country = getCountry(countryCode);
  const skinTone = getSkinTone(skinToneId);

  const startNewGame = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const player = createNewPlayer(fullName, playerGender, {
      skinTone: skinToneId,
      country: countryCode,
      statBonus: country.bonus,
      tags: country.tags,
    });
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

  const randomizeFirst = () => setFirstName(randomFirstName(countryCode, playerGender));
  const randomizeLast = () => setLastName(randomLastName(countryCode));
  const randomizeBoth = () => {
    setFirstName(randomFirstName(countryCode, playerGender));
    setLastName(randomLastName(countryCode));
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (showGame && gameState) {
    return <GameScreen initialState={gameState} onExit={() => setShowGame(false)} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
        <motion.img
          src={logo}
          alt="GitLife - Dein Leben Simulator"
          className="mx-auto w-64 md:w-96 h-auto mb-2 md:mb-4 drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          width={400}
          height={400}
        />
        <p className="text-muted-foreground text-base md:text-xl mb-8 md:mb-12 font-mono px-2">
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
              {/* Names with random dice */}
              <div className="max-w-md mx-auto px-2 space-y-2">
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    placeholder="Vorname..."
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1 px-3 py-3 bg-card border-2 border-primary/50 rounded-lg text-foreground font-mono text-center focus:outline-none focus:border-primary transition-all text-base"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={randomizeFirst}
                    title="Zufälliger Vorname"
                    className="px-3 rounded-lg border-2 border-primary/50 bg-card text-primary hover:bg-primary/10 active:scale-95 transition-all"
                  >
                    <Dices className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    placeholder="Nachname..."
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                    className="flex-1 px-3 py-3 bg-card border-2 border-primary/50 rounded-lg text-foreground font-mono text-center focus:outline-none focus:border-primary transition-all text-base"
                  />
                  <button
                    type="button"
                    onClick={randomizeLast}
                    title="Zufälliger Nachname"
                    className="px-3 rounded-lg border-2 border-primary/50 bg-card text-primary hover:bg-primary/10 active:scale-95 transition-all"
                  >
                    <Dices className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={randomizeBoth}
                  className="text-xs text-muted-foreground hover:text-primary underline w-full"
                >
                  🎲 Beides zufällig (passend zu {country.flag} {country.name})
                </button>
              </div>

              {/* Gender Selection */}
              <div className="flex gap-3 justify-center px-2">
                <button
                  onClick={() => setPlayerGender('male')}
                  className={`flex-1 max-w-[140px] px-4 py-3 rounded-lg border-2 transition-all active:scale-95 ${
                    playerGender === 'male'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-muted-foreground/30 text-muted-foreground hover:border-blue-500/50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="text-2xl">👨{skinTone.emojiModifier}</span>
                  <p className="text-xs mt-1">Männlich</p>
                </button>
                <button
                  onClick={() => setPlayerGender('female')}
                  className={`flex-1 max-w-[140px] px-4 py-3 rounded-lg border-2 transition-all active:scale-95 ${
                    playerGender === 'female'
                      ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                      : 'border-muted-foreground/30 text-muted-foreground hover:border-pink-500/50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="text-2xl">👩{skinTone.emojiModifier}</span>
                  <p className="text-xs mt-1">Weiblich</p>
                </button>
              </div>

              {/* Skin tone */}
              <div className="px-2">
                <p className="text-xs text-muted-foreground mb-2 text-center">Hautfarbe</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSkinToneId(tone.id)}
                      title={tone.label}
                      className={`w-10 h-10 rounded-full border-2 transition-all active:scale-90 ${
                        skinToneId === tone.id ? 'border-primary scale-110 shadow-[0_0_15px_hsl(var(--primary)/0.5)]' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: tone.hex, WebkitTapHighlightColor: 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              {/* Birth country */}
              <div className="px-2 max-w-md mx-auto">
                <p className="text-xs text-muted-foreground mb-2 text-center">Geburtsland</p>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-card/50 rounded-lg border border-primary/20">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCountryCode(c.code)}
                      title={`${c.name} (${c.description})`}
                      className={`p-1.5 rounded-md border transition-all active:scale-90 ${
                        countryCode === c.code
                          ? 'border-primary bg-primary/20 scale-110'
                          : 'border-transparent hover:border-primary/40'
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center mt-2 text-primary font-mono">
                  {country.flag} {country.name} <span className="text-muted-foreground">— {country.description}</span>
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  onClick={startNewGame}
                  disabled={!firstName.trim() || !lastName.trim()}
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
                className="game-btn bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-xl w-72 max-w-full"
              >
                <Play className="mr-2 h-6 w-6" /> Neues Leben
              </Button>
              
              {hasSave && (
                <Button
                  onClick={continueGame}
                  variant="outline"
                  className="game-btn border-2 border-primary text-primary hover:bg-primary/10 px-10 py-7 text-xl w-72 max-w-full"
                >
                  <RotateCcw className="mr-2 h-6 w-6" /> Fortsetzen
                </Button>
              )}

              <div className="flex gap-3 mt-4 flex-wrap justify-center">
                <Link to="/casino">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <DollarSign className="mr-2 h-5 w-5" /> Casino
                  </Button>
                </Link>


                <ChangelogModal />
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
          className="mt-8 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center px-2"
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

        {/* Life Archive */}
        <LifeArchivePanel />
      </motion.div>
    </div>
  );
};

export default Index;
