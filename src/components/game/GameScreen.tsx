import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, GameEvent, EventOption, Job } from '@/types/game';
import { getEventsForAge, selectRandomEvent } from '@/data/seedEvents';
import { seedEventsToDatabase } from '@/lib/seedDatabase';
import { agePlayer, applyEffects, createTimelineEvent, saveGame, formatMoney } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';
import { getAllJobs } from '@/lib/jobSystem';
import StatsPanel from './StatsPanel';
import EventPanel from './EventPanel';
import TimelinePanel from './TimelinePanel';
import MinigameModal from './MinigameModal';
import GameOverScreen from './GameOverScreen';
import StatusBar from './StatusBar';
import JobModal from './JobModal';
import CrimeModal, { CrimeResult } from './CrimeModal';
import RelationshipModal from './RelationshipModal';
import LottoModal from './LottoModal';
import BabyNamingModal from './BabyNamingModal';
import AdoptionModal from './AdoptionModal';
import PropertyModal from './PropertyModal';
import { RelationshipState, Partner, FamilyActivity, Child } from '@/types/relationship';
import { PregnancyState, createPregnancyState, generatePregnancy, getSuggestedNames } from '@/types/pregnancy';
import { PropertyState, createPropertyState, Property, calculateYearlyRent } from '@/types/property';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Volume2, VolumeX, Coins, Briefcase, Skull, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createRelationshipState, generateChild, ageChildren, ageFamily, doFamilyActivity, addSibling } from '@/lib/relationshipSystem';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GameScreenProps {
  initialState: GameState;
  onExit: () => void;
}

const GameScreen = ({ initialState, onExit }: GameScreenProps) => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [allEvents, setAllEvents] = useState<GameEvent[]>([]);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentMinigame, setCurrentMinigame] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  
  // Job, Crime, Relationship, and Lotto modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCrimeModal, setShowCrimeModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showLottoModal, setShowLottoModal] = useState(false);
  const [showBabyNamingModal, setShowBabyNamingModal] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [hasBabysitterJob, setHasBabysitterJob] = useState(false);
  const [pendingBabies, setPendingBabies] = useState<{ gender: 'male' | 'female'; suggestedName: string }[]>([]);
  const [relationshipState, setRelationshipState] = useState<RelationshipState>(() => 
    createRelationshipState(initialState.player.birthYear)
  );
  const [pregnancyState, setPregnancyState] = useState<PregnancyState>(createPregnancyState);
  const [propertyState, setPropertyState] = useState<PropertyState>(createPropertyState);

  // Start ambient music on mount
  useEffect(() => {
    if (soundEnabled) {
      soundManager.startBackgroundMusic();
    }
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

  // Seed and load events from database
  useEffect(() => {
    const initEvents = async () => {
      // First seed events if needed
      await seedEventsToDatabase();
      
      // Then load all active events from DB
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
        setAllEvents(dbEvents);
      }
    };
    initEvents();
  }, []);

  // Select initial event when events are loaded
  useEffect(() => {
    if (allEvents.length > 0 && !gameState.currentEvent && !gameState.gameOver) {
      selectNextEvent();
    }
  }, [allEvents]);

  // Auto-save
  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  const selectNextEvent = () => {
    if (allEvents.length === 0) return; // Don't select if no events loaded
    
    const eligibleEvents = getEventsForAge(allEvents, gameState.player.age);
    const event = selectRandomEvent(eligibleEvents);
    soundManager.playEventAppear();
    setGameState(prev => ({ ...prev, currentEvent: event }));
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleOptionSelect = (option: EventOption) => {
    soundManager.playClick();
    setSelectedOption(option);

    // Check for special event tags
    const currentEvent = gameState.currentEvent;
    const isLottoEvent = currentEvent?.tags?.includes('lotto') && option.label.includes('kaufen');
    const isAddSiblingEvent = currentEvent?.tags?.includes('add_sibling');

    if (option.minigame) {
      soundManager.playMinigameStart();
      setCurrentMinigame(option.minigame);
      setShowMinigame(true);
    } else if (isLottoEvent && gameState.player.age >= 18) {
      // Open Lotto modal for adult players
      setShowLottoModal(true);
    } else {
      applyOptionEffects(option);
      
      // Handle adding new sibling
      if (isAddSiblingEvent && option.label.includes('freu')) {
        handleAddSibling();
      }
    }
  };

  const handleAddSibling = () => {
    if (relationshipState.family) {
      soundManager.playNewSibling();
      const newFamily = addSibling(relationshipState.family);
      const newSibling = newFamily.siblings[newFamily.siblings.length - 1];
      toast.success(`Dein neues Geschwisterchen ${newSibling.name} ist geboren! 👶`);
      setRelationshipState(prev => ({
        ...prev,
        family: newFamily
      }));
    }
  };

  const handleLottoResult = (won: boolean, amount: number) => {
    setShowLottoModal(false);
    
    // Apply the lotto result
    if (won) {
      toast.success(`JACKPOT! Du hast €10.000 gewonnen! 🎉🎰`);
    } else {
      toast.info('Leider kein Gewinn. Vielleicht nächstes Mal!');
    }
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: prev.player.money + amount
      }
    }));
    
    // Continue with the event result
    if (selectedOption) {
      setShowResult(true);
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
    let agedPlayer = agePlayer(gameState.player);
    
    // Add side job income
    if (hasBabysitterJob) {
      agedPlayer = { ...agedPlayer, money: agedPlayer.money + 80 };
    }
    
    // Age family members and children
    setRelationshipState(prev => {
      const agedChildren = ageChildren(prev.children);
      const agedFamily = prev.family ? ageFamily(prev.family) : null;
      
      // Check for parent death notifications
      if (prev.family && agedFamily) {
        if (prev.family.mother.isAlive && !agedFamily.mother.isAlive) {
          toast.error(`Deine Mutter ${prev.family.mother.name} ist verstorben. 😢`);
        }
        if (prev.family.father.isAlive && !agedFamily.father.isAlive) {
          toast.error(`Dein Vater ${prev.family.father.name} ist verstorben. 😢`);
        }
      }
      
      // Age partner
      let agedPartner = prev.partner;
      if (agedPartner) {
        agedPartner = {
          ...agedPartner,
          age: agedPartner.age + 1,
          yearsTogethere: agedPartner.yearsTogethere + 1
        };
      }
      
      return {
        ...prev,
        partner: agedPartner,
        children: agedChildren,
        family: agedFamily
      };
    });
    
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

  // Job handlers
  const handleApplyForJob = (jobId: string) => {
    const allJobs = getAllJobs();
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    // Random chance based on stats
    const successChance = 0.5 + (gameState.player.stats.iq - 50) * 0.005 + (gameState.player.stats.looks - 50) * 0.003;
    const success = Math.random() < successChance;

    if (success) {
      soundManager.playJobPromotion();
      const newJob: Job = {
        id: job.id,
        title: job.title,
        salary: job.salary,
        requiredIQ: job.requirements.minIQ || 0,
        requiredEducation: job.requirements.minEducation || 'none',
      };
      setGameState(prev => ({
        ...prev,
        player: { ...prev.player, job: newJob },
      }));
      toast.success(`Glückwunsch! Du wurdest als ${job.title} eingestellt!`);
    } else {
      soundManager.playNegativeEffect();
      toast.error(`Leider wurde deine Bewerbung als ${job.title} abgelehnt.`);
    }
    setShowJobModal(false);
  };

  const handleQuitJob = () => {
    if (gameState.player.job) {
      soundManager.playClick();
      toast.info(`Du hast deinen Job als ${gameState.player.job.title} gekündigt.`);
      setGameState(prev => ({
        ...prev,
        player: { ...prev.player, job: undefined },
      }));
    }
    setShowJobModal(false);
  };

  const handleToggleNewspaperJob = () => {
    soundManager.playClick();
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, hasNewspaperJob: !prev.player.hasNewspaperJob },
    }));
  };

  const handleToggleBabysitterJob = () => {
    soundManager.playClick();
    setHasBabysitterJob(prev => !prev);
  };

  // Crime handler
  const handleCrimeResult = (result: CrimeResult) => {
    setShowCrimeModal(false);
    
    if (result.success) {
      soundManager.playCrimeSuccess();
      toast.success(`${result.crime.name} erfolgreich! Du hast €${result.reward.toLocaleString()} erbeutet!`);
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + result.reward,
          criminalRecord: [...prev.player.criminalRecord, result.record],
        },
      }));
    } else {
      soundManager.playCrimeFail();
      toast.error(`Du wurdest erwischt! ${result.prisonYears} Jahre Gefängnis!`);
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inPrison: true,
          prisonYearsRemaining: result.prisonYears,
          job: undefined, // Lose job when going to prison
          criminalRecord: [...prev.player.criminalRecord, result.record],
        },
      }));
    }
  };

  // Check if player can access crime (18+)
  const canAccessCrime = gameState.player.age >= 18 && !gameState.player.inPrison;
  const canAccessRelationship = gameState.player.age >= 16;

  // Relationship handlers
  const handleFindPartner = (partner: Partner) => {
    setRelationshipState(prev => ({ ...prev, partner }));
    toast.success(`Du bist jetzt mit ${partner.name} zusammen! 💕`);
  };

  const handleBreakup = () => {
    if (relationshipState.partner) {
      toast.info(`Du hast dich von ${relationshipState.partner.name} getrennt.`);
      setRelationshipState(prev => ({
        ...prev,
        partner: null,
        exPartners: prev.partner ? [...prev.exPartners, prev.partner] : prev.exPartners
      }));
    }
  };

  const handleMarry = () => {
    if (relationshipState.partner) {
      soundManager.playPositiveEffect();
      toast.success(`Du hast ${relationshipState.partner.name} geheiratet! 💍`);
      setRelationshipState(prev => ({
        ...prev,
        partner: prev.partner ? { ...prev.partner, relationshipStatus: 'married' } : null,
        totalMarriages: prev.totalMarriages + 1
      }));
    }
  };

  const handleDivorce = () => {
    if (relationshipState.partner) {
      soundManager.playNegativeEffect();
      toast.error(`Du hast dich von ${relationshipState.partner.name} scheiden lassen.`);
      setRelationshipState(prev => ({
        ...prev,
        partner: null,
        exPartners: prev.partner ? [...prev.exPartners, { ...prev.partner, relationshipStatus: 'divorced' }] : prev.exPartners,
        totalDivorces: prev.totalDivorces + 1
      }));
    }
  };

  const handleTryForChild = () => {
    const chance = Math.random();
    if (chance < 0.4) {
      // Start pregnancy instead of immediate birth
      const pregnancy = generatePregnancy();
      soundManager.playPositiveEffect();
      setPregnancyState(prev => ({
        ...prev,
        isPregnant: true,
        pregnancyMonth: 0,
        expectedBabies: pregnancy.count,
        babyGenders: pregnancy.genders
      }));
      toast.success(pregnancy.count === 2 ? 'Zwillinge unterwegs! 👶👶' : 'Ein Baby ist unterwegs! 🤰');
    } else {
      toast.info('Dieses Jahr hat es leider nicht geklappt.');
    }
  };

  const handleAdoptChild = (name: string, gender: 'male' | 'female', age: number) => {
    const adoptionCosts = [5000, 4000, 3000, 2500, 2000];
    const cost = adoptionCosts.find((_, i) => [0, 2, 5, 8, 12][i] === age) || 3000;
    
    const child: Child = {
      id: `child-${Date.now()}`,
      name,
      gender,
      age,
      birthYear: gameState.year - age,
      relationship: 70
    };
    
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, money: prev.player.money - cost }
    }));
    
    setRelationshipState(prev => ({
      ...prev,
      children: [...prev.children, child]
    }));
    
    soundManager.playPositiveEffect();
    toast.success(`${name} wurde adoptiert! 🏠`);
  };

  const handleBabyBorn = (names: string[]) => {
    const newChildren: Child[] = pendingBabies.map((baby, i) => ({
      id: `child-${Date.now()}-${i}`,
      name: names[i],
      gender: baby.gender,
      age: 0,
      birthYear: gameState.year,
      relationship: 90
    }));
    
    setRelationshipState(prev => ({
      ...prev,
      children: [...prev.children, ...newChildren]
    }));
    
    setPregnancyState(createPregnancyState());
    setPendingBabies([]);
    setShowBabyNamingModal(false);
    
    soundManager.playPositiveEffect();
    toast.success(newChildren.length === 2 ? 'Deine Zwillinge sind geboren! 👶👶' : 'Dein Baby ist geboren! 👶');
  };

  const handleFamilyActivity = (memberId: string, activity: FamilyActivity) => {
    if (gameState.player.money < activity.cost) {
      toast.error(`Nicht genug Geld! Du brauchst €${activity.cost}`);
      return;
    }
    
    // Deduct cost
    setGameState(prev => ({
      ...prev,
      player: { 
        ...prev.player, 
        money: prev.player.money - activity.cost,
        stats: {
          ...prev.player.stats,
          health: Math.min(100, prev.player.stats.health + (activity.effects.healthDelta || 0))
        }
      }
    }));
    
    // Update family relationship
    setRelationshipState(prev => ({
      ...prev,
      family: prev.family ? doFamilyActivity(prev.family, memberId, activity) : null
    }));
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
    <div className="min-h-screen bg-background p-2 md:p-4 pb-20">
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
            {/* Job Button - only show after school */}
            {gameState.player.age > 16 + gameState.player.extraSchoolYears && !gameState.player.inPrison && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowJobModal(true)} 
                className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                title="Jobsuche"
              >
                <Briefcase className="h-4 w-4" />
              </Button>
            )}
            {/* Crime Button - 18+ only */}
            {canAccessCrime && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowCrimeModal(true)} 
                className="text-destructive h-8 w-8 md:h-10 md:w-10"
                title="Kriminalität"
              >
                <Skull className="h-4 w-4" />
              </Button>
            )}
            {/* Relationship Button - 16+ */}
            {canAccessRelationship && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowRelationshipModal(true)} 
                className="text-pink-500 h-8 w-8 md:h-10 md:w-10"
                title="Beziehungen"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
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

      {/* StatusBar at bottom */}
      <StatusBar
        player={gameState.player}
        onToggleNewspaperJob={handleToggleNewspaperJob}
        onToggleBabysitterJob={handleToggleBabysitterJob}
        hasBabysitterJob={hasBabysitterJob}
        onOpenRelationships={() => setShowRelationshipModal(true)}
        onOpenCrime={() => setShowCrimeModal(true)}
        onOpenCasino={goToCasino}
      />

      {/* Minigame Modal */}
      <MinigameModal
        isOpen={showMinigame}
        minigame={currentMinigame}
        onComplete={handleMinigameComplete}
        onClose={() => setShowMinigame(false)}
        playerMoney={gameState.player.money}
        playerAge={gameState.player.age}
      />

      {/* Job Modal */}
      <JobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        player={gameState.player}
        onApply={handleApplyForJob}
        onQuit={handleQuitJob}
      />

      {/* Crime Modal */}
      <CrimeModal
        isOpen={showCrimeModal}
        onClose={() => setShowCrimeModal(false)}
        player={gameState.player}
        onCrimeResult={handleCrimeResult}
      />

      {/* Relationship Modal */}
      <RelationshipModal
        isOpen={showRelationshipModal}
        onClose={() => setShowRelationshipModal(false)}
        player={gameState.player}
        relationshipState={relationshipState}
        pregnancyState={pregnancyState}
        onFindPartner={handleFindPartner}
        onBreakup={handleBreakup}
        onMarry={handleMarry}
        onDivorce={handleDivorce}
        onTryForChild={handleTryForChild}
        onFamilyActivity={handleFamilyActivity}
        onToggleBirthControl={() => setPregnancyState(prev => ({ ...prev, playerOnBirthControl: !prev.playerOnBirthControl }))}
        onAskPartnerBirthControl={() => {
          const willChange = Math.random() > 0.3;
          if (willChange) {
            setPregnancyState(prev => ({ ...prev, partnerOnBirthControl: !prev.partnerOnBirthControl }));
            toast.success(pregnancyState.partnerOnBirthControl ? 'Partner nimmt keine Pille mehr.' : 'Partner nimmt jetzt die Pille.');
          } else {
            toast.info('Partner möchte nichts ändern.');
          }
        }}
        onOpenAdoption={() => setShowAdoptionModal(true)}
      />

      {/* Lotto Modal */}
      <LottoModal
        isOpen={showLottoModal}
        onClose={() => setShowLottoModal(false)}
        onResult={handleLottoResult}
        playerMoney={gameState.player.money}
      />
    </div>
  );
};

export default GameScreen;
