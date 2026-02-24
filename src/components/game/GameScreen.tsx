import { useState, useEffect, useRef } from 'react';
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
import { PropertyState, createPropertyState, Property, availableProperties } from '@/types/property';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Volume2, VolumeX, Coins, Briefcase, Skull, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createRelationshipState, generateChild, ageChildren, ageFamily, doFamilyActivity, addSibling, resetYearlyActivityUsage, canDoActivity, recordActivityUsage, getRandomExcuse, generateInitialFriends, generateNewFriend } from '@/lib/relationshipSystem';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FriendActivity, friendActivities } from '@/types/relationship';
import StudentJobInterviewModal from './StudentJobInterviewModal';
import { getPrisonEvents } from '@/lib/crimeSystem';
import { saveLifeToArchive } from '@/lib/lifeArchive';

// Tags that mark unique-per-life events (can only trigger once)
const UNIQUE_EVENT_TAGS = ['milestone', 'club', 'driving'];

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
  const [showStudentJobInterview, setShowStudentJobInterview] = useState(false);
  const [pendingBabies, setPendingBabies] = useState<{ gender: 'male' | 'female'; suggestedName: string }[]>([]);
  const [relationshipState, setRelationshipState] = useState<RelationshipState>(() => 
    createRelationshipState(initialState.player.birthYear)
  );
  const [pregnancyState, setPregnancyState] = useState<PregnancyState>(createPregnancyState);
  const [propertyState, setPropertyState] = useState<PropertyState>(createPropertyState);
  const [usedEventIds] = useState<Set<string>>(() => new Set());
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

    // Prison overrides normal life events
    if (gameState.player.inPrison && gameState.player.prisonYearsRemaining > 0) {
      const prisonPool = getPrisonEvents();
      const prisonEvent = prisonPool[Math.floor(Math.random() * prisonPool.length)];
      const event: GameEvent = {
        id: `prison-${Date.now()}`,
        title: prisonEvent.title,
        text: prisonEvent.description,
        minAge: 0,
        maxAge: 200,
        category: 'prison',
        weight: 1,
        tags: ['prison'],
        options: [
          {
            id: 'continue',
            label: 'Weiter',
            effects: prisonEvent.effects,
            resultText: prisonEvent.description,
          },
        ],
      };

      soundManager.playEventAppear();
      setGameState(prev => ({ ...prev, currentEvent: event }));
      setSelectedOption(null);
      setShowResult(false);
      return;
    }

    let eligibleEvents = getEventsForAge(allEvents, gameState.player.age);

    // Filter out unique events already triggered this life
    eligibleEvents = eligibleEvents.filter(e => {
      const isUnique = e.tags?.some(t => UNIQUE_EVENT_TAGS.includes(t));
      return !isUnique || !usedEventIds.has(e.id);
    });

    // Consistency rule: promotion only if the player has a job
    if (!gameState.player.job) {
      eligibleEvents = eligibleEvents.filter(e => e.title !== 'Beförderung');
    }

    // Luck-based event selection: higher luck increases chance for positive events
    const playerLuck = gameState.player.stats.luck;
    const luckModifiedEvents = eligibleEvents.map(e => {
      // Check if the event has any option with positive effects
      const hasPositiveOption = e.options.some(opt => {
        const effects = opt.effects || {};
        const totalPositive = (effects.moneyDelta && effects.moneyDelta > 0 ? effects.moneyDelta : 0) +
          (effects.luckDelta && effects.luckDelta > 0 ? effects.luckDelta * 100 : 0) +
          (effects.healthDelta && effects.healthDelta > 0 ? effects.healthDelta * 50 : 0);
        return totalPositive > 0;
      });
      
      // Luck modifier: high luck (70+) increases weight of positive events
      // Low luck (30-) decreases weight of positive events
      let weightModifier = 1;
      if (hasPositiveOption && playerLuck >= 70) {
        weightModifier = 1 + (playerLuck - 50) / 100; // Up to 1.5x for luck 100
      } else if (hasPositiveOption && playerLuck <= 30) {
        weightModifier = 0.5 + playerLuck / 60; // Down to 0.5x for luck 0
      }
      
      return { ...e, weight: e.weight * weightModifier };
    });

    const event = selectRandomEvent(luckModifiedEvents);
    soundManager.playEventAppear();
    setGameState(prev => ({ ...prev, currentEvent: event }));
    setSelectedOption(null);
    setShowResult(false);
  };

  const resolvePropertyFromOption = (optionLabel: string): Property | null => {
    const l = optionLabel.toLowerCase();
    if (l.includes('mansion') || l.includes('herrenhaus')) return availableProperties.find(p => p.type === 'mansion') || null;
    if (l.includes('villa')) return availableProperties.find(p => p.type === 'villa') || null;
    if (l.includes('haus')) return availableProperties.find(p => p.type === 'house') || null;
    if (l.includes('wohnung') || l.includes('penthouse')) return availableProperties.find(p => p.type === 'apartment') || null;
    return null;
  };

  const handleOptionSelect = (option: EventOption) => {
    soundManager.playClick();
    setSelectedOption(option);

    // Track unique event as used
    const activeEvent = gameState.currentEvent;
    if (activeEvent?.tags?.some(t => UNIQUE_EVENT_TAGS.includes(t))) {
      usedEventIds.add(activeEvent.id);
    }
    const isLottoEvent = activeEvent?.tags?.includes('lotto') && option.label.includes('kaufen');
    const isAddSiblingEvent = activeEvent?.tags?.includes('add_sibling');

    // Hard block: prison state should never run normal events
    if (gameState.player.inPrison && gameState.player.prisonYearsRemaining > 0) {
      applyOptionEffects(option);
      return;
    }

    // Strict consistency: property buys should affect property state (not just money)
    const looksLikePropertyBuy =
      (activeEvent?.tags?.includes('property') || activeEvent?.tags?.includes('housing') || activeEvent?.tags?.includes('living') || activeEvent?.tags?.includes('investment')) &&
      option.label.toLowerCase().includes('kauf');

    if (looksLikePropertyBuy) {
      const p = resolvePropertyFromOption(option.label) || availableProperties.find(x => x.purchasePrice === Math.abs(option.effects.moneyDelta || 0)) || null;
      if (!p) {
        toast.error('Keine passende Immobilie gefunden.');
        return;
      }
      if (gameState.player.money < p.purchasePrice) {
        toast.error('Nicht genug Geld!');
        return;
      }

      // Buy via real property system; keep event effects except the moneyDelta to avoid double subtraction
      handleBuyProperty({ ...p, owned: true, isRented: false });
      const sanitizedOption: EventOption = {
        ...option,
        effects: { ...option.effects, moneyDelta: 0 },
      };
      applyOptionEffects(sanitizedOption);
      return;
    }

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
      
      // Handle adding new friend from events
      if (option.resultText && option.resultText.includes('[+1 Freund]')) {
        handleAddFriendFromEvent();
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

  const handleAddFriendFromEvent = () => {
    const newFriend = generateNewFriend(gameState.player.age);
    soundManager.playPositiveEffect();
    toast.success(`Du hast ${newFriend.name} kennengelernt! 👥`);
    setRelationshipState(prev => ({
      ...prev,
      friends: [...prev.friends, newFriend]
    }));
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
      saveLifeToArchive(newPlayer, [timelineEvent, ...gameState.timeline], gameState.currentEvent?.title || 'Unbekannt');
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
    
    // Add Kindergeld (€300 per child per year)
    const kindergeldAmount = relationshipState.children.length * 300;
    if (kindergeldAmount > 0) {
      agedPlayer = { ...agedPlayer, money: agedPlayer.money + kindergeldAmount };
      soundManager.playKindergeld();
      toast.success(`Kindergeld erhalten: €${kindergeldAmount}!`);
    }
    
    // Pay rent if renting
    if (propertyState.rentedProperty) {
      const yearlyRent = propertyState.rentedProperty.monthlyRent * 12;
      agedPlayer = { ...agedPlayer, money: agedPlayer.money - yearlyRent };
    }
    
    // Pay property maintenance (1% of property value per year)
    const maintenanceCost = propertyState.ownedProperties.reduce((sum, p) => sum + Math.floor(p.purchasePrice * 0.01), 0);
    if (maintenanceCost > 0) {
      agedPlayer = { ...agedPlayer, money: agedPlayer.money - maintenanceCost };
    }
    
    // Property appreciation
    setPropertyState(prev => ({
      ...prev,
      ownedProperties: prev.ownedProperties.map(p => ({
        ...p,
        purchasePrice: Math.floor(p.purchasePrice * (1 + (p.appreciation || 0) / 100))
      }))
    }));
    
    // Handle pregnancy progression
    if (pregnancyState.isPregnant) {
      const newMonth = pregnancyState.pregnancyMonth + 12; // One year passes
      if (newMonth >= 9) {
        // Baby is born!
        soundManager.playBabyBorn();
        const babies = pregnancyState.babyGenders.map((gender, i) => ({
          gender,
          suggestedName: getSuggestedNames(gender, 3)[0]
        }));
        setPendingBabies(babies);
        setShowBabyNamingModal(true);
      } else {
        setPregnancyState(prev => ({ ...prev, pregnancyMonth: newMonth }));
      }
    }
    
    // Age family members and children, reset yearly activity usage
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
      
      // Age friends
      const agedFriends = prev.friends.map(f => ({ ...f, age: f.age + 1 }));
      
      // Reset yearly activity usage for new year
      return resetYearlyActivityUsage({
        ...prev,
        partner: agedPartner,
        children: agedChildren,
        family: agedFamily,
        friends: agedFriends
      });
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
      saveLifeToArchive(agedPlayer, gameState.timeline, 'Natürlicher Tod');
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
    // Only one student job: newspaper.
    // If currently employed -> allow quitting instantly.
    if (gameState.player.hasNewspaperJob) {
      setGameState(prev => ({
        ...prev,
        player: { ...prev.player, hasNewspaperJob: false },
      }));
      toast.info('Du hast den Schülerjob gekündigt.');
      return;
    }

    // Otherwise: interview/quiz first
    setShowStudentJobInterview(true);
  };

  const handleStudentJobPassed = () => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, hasNewspaperJob: true },
    }));
    toast.success('Du hast den Schülerjob bekommen!');
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
    // Check birth control
    const playerOnPill = gameState.player.gender === 'female' && pregnancyState.playerOnBirthControl;
    const partnerOnPill = relationshipState.partner?.gender === 'female' && pregnancyState.partnerOnBirthControl;
    
    if (playerOnPill || partnerOnPill) {
      toast.info('Die Pille verhindert eine Schwangerschaft.');
      return;
    }
    
    const chance = Math.random();
    if (chance < 0.4) {
      // Start pregnancy instead of immediate birth
      const pregnancy = generatePregnancy();
      soundManager.playPregnancyStart();
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
  
  // Property handlers
  const handleBuyProperty = (property: Property) => {
    soundManager.playPropertyBuy();
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, money: prev.player.money - property.purchasePrice }
    }));
    setPropertyState(prev => ({
      ...prev,
      ownedProperties: [...prev.ownedProperties, property],
      currentHome: { ...property, owned: true }
    }));
  };

  const handleRentProperty = (property: Property) => {
    setPropertyState(prev => ({
      ...prev,
      rentedProperty: property,
      currentHome: { ...property, owned: false }
    }));
  };

  const handleSellProperty = (propertyId: string) => {
    const property = propertyState.ownedProperties.find(p => p.id === propertyId);
    if (property) {
      const salePrice = Math.floor(property.purchasePrice * 0.9);
      soundManager.playPropertySell();
      setGameState(prev => ({
        ...prev,
        player: { ...prev.player, money: prev.player.money + salePrice }
      }));
      setPropertyState(prev => ({
        ...prev,
        ownedProperties: prev.ownedProperties.filter(p => p.id !== propertyId),
        currentHome: prev.currentHome?.id === propertyId ? null : prev.currentHome
      }));
    }
  };

  const handleStopRenting = () => {
    setPropertyState(prev => ({
      ...prev,
      rentedProperty: null,
      currentHome: null
    }));
    toast.info('Mietvertrag gekündigt.');
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
    // Check yearly limit
    if (!canDoActivity(activity.id, activity.maxPerYear, relationshipState.yearlyActivityUsage)) {
      const excuse = getRandomExcuse(activity.excuses);
      toast.info(`"${excuse}"`);
      return;
    }
    
    // Check cost - parents pay until 18
    const parentsPay = gameState.player.age < 18 && relationshipState.family?.father.isAlive;
    const effectiveCost = parentsPay ? 0 : activity.cost;
    
    if (gameState.player.money < effectiveCost) {
      toast.error(`Nicht genug Geld! Du brauchst €${activity.cost}`);
      return;
    }
    
    // Deduct cost (or not if parents pay)
    if (effectiveCost > 0) {
      setGameState(prev => ({
        ...prev,
        player: { 
          ...prev.player, 
          money: prev.player.money - effectiveCost,
          stats: {
            ...prev.player.stats,
            health: Math.min(100, prev.player.stats.health + (activity.effects.healthDelta || 0))
          }
        }
      }));
    } else if (activity.effects.healthDelta) {
      setGameState(prev => ({
        ...prev,
        player: { 
          ...prev.player, 
          stats: {
            ...prev.player.stats,
            health: Math.min(100, prev.player.stats.health + activity.effects.healthDelta)
          }
        }
      }));
    }
    
    // Update family relationship and record usage
    setRelationshipState(prev => ({
      ...prev,
      family: prev.family ? doFamilyActivity(prev.family, memberId, activity) : null,
      yearlyActivityUsage: recordActivityUsage(activity.id, prev.yearlyActivityUsage)
    }));
    
    if (parentsPay && activity.cost > 0) {
      toast.success(`${activity.emoji} Eltern haben €${activity.cost} bezahlt!`);
    }
  };

  const handleFriendActivity = (friendId: string, activity: FriendActivity) => {
    // Check yearly limit
    if (!canDoActivity(activity.id, activity.maxPerYear, relationshipState.yearlyFriendActivityUsage)) {
      toast.info('Das habt ihr dieses Jahr schon oft genug gemacht!');
      return;
    }
    
    // Check cost - parents pay until 18 for some activities
    const parentsPay = gameState.player.age < 18 && relationshipState.family?.father.isAlive;
    const effectiveCost = parentsPay ? 0 : activity.cost;
    
    if (gameState.player.money < effectiveCost) {
      toast.error(`Nicht genug Geld! Du brauchst €${activity.cost}`);
      return;
    }
    
    // Deduct cost and apply effects
    setGameState(prev => ({
      ...prev,
      player: { 
        ...prev.player, 
        money: prev.player.money - effectiveCost,
        stats: {
          ...prev.player.stats,
          health: Math.min(100, prev.player.stats.health + (activity.effects.healthDelta || 0)),
          fitness: Math.min(100, prev.player.stats.fitness + (activity.effects.fitnessDelta || 0))
        }
      }
    }));
    
    // Update friend relationship and record usage
    setRelationshipState(prev => ({
      ...prev,
      friends: prev.friends.map(f => 
        f.id === friendId 
          ? { ...f, friendship: Math.min(100, f.friendship + activity.effects.friendshipBonus) }
          : f
      ),
      yearlyFriendActivityUsage: recordActivityUsage(activity.id, prev.yearlyFriendActivityUsage)
    }));
    
    const friend = relationshipState.friends.find(f => f.id === friendId);
    toast.success(`${activity.emoji} ${activity.name} mit ${friend?.name}! +${activity.effects.friendshipBonus} Freundschaft`);
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
    <div className="min-h-screen min-h-[100dvh] bg-background p-2 md:p-4 pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header - Compact on mobile */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" onClick={onExit} className="text-muted-foreground h-9 w-9 md:h-10 md:w-10">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSound} className="text-muted-foreground h-9 w-9 md:h-10 md:w-10">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={goToCasino} className="text-muted-foreground h-9 w-9 md:h-10 md:w-10" title="Casino">
              <Coins className="h-4 w-4" />
            </Button>
            {gameState.player.age > 16 + gameState.player.extraSchoolYears && !gameState.player.inPrison && (
              <Button 
                variant="ghost" size="icon" 
                onClick={() => setShowJobModal(true)} 
                className="text-muted-foreground h-9 w-9 md:h-10 md:w-10"
                title="Jobsuche"
              >
                <Briefcase className="h-4 w-4" />
              </Button>
            )}
            {canAccessCrime && (
              <Button 
                variant="ghost" size="icon" 
                onClick={() => setShowCrimeModal(true)} 
                className="text-destructive h-9 w-9 md:h-10 md:w-10"
                title="Kriminalität"
              >
                <Skull className="h-4 w-4" />
              </Button>
            )}
            {canAccessRelationship && (
              <Button 
                variant="ghost" size="icon" 
                onClick={() => setShowRelationshipModal(true)} 
                className="text-pink-500 h-9 w-9 md:h-10 md:w-10"
                title="Beziehungen"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-right min-w-0">
            <h2 className="font-display text-sm md:text-2xl text-primary truncate">{gameState.player.name}</h2>
            <p className="text-xs text-muted-foreground">
              {gameState.player.age}J | {formatMoney(gameState.player.money)}
            </p>
          </div>
        </div>

        {/* Main Layout - Mobile optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
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
                className="mt-3 md:mt-4 text-center"
              >
                <Button
                  onClick={advanceYear}
                  className="game-btn bg-primary text-primary-foreground px-6 md:px-8 py-4 md:py-4 text-base md:text-lg w-full md:w-auto min-h-[52px]"
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
        hasBabysitterJob={false}
        onOpenRelationships={() => setShowRelationshipModal(true)}
        onOpenCrime={() => setShowCrimeModal(true)}
        onOpenCasino={goToCasino}
        onOpenProperty={() => setShowPropertyModal(true)}
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

      <StudentJobInterviewModal
        isOpen={showStudentJobInterview}
        onClose={() => setShowStudentJobInterview(false)}
        onPassed={handleStudentJobPassed}
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
        onFriendActivity={handleFriendActivity}
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

      {/* Baby Naming Modal */}
      <BabyNamingModal
        isOpen={showBabyNamingModal}
        onClose={() => setShowBabyNamingModal(false)}
        babies={pendingBabies}
        onConfirm={handleBabyBorn}
      />

      {/* Adoption Modal */}
      <AdoptionModal
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
        playerMoney={gameState.player.money}
        onAdopt={handleAdoptChild}
      />

      {/* Property Modal */}
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        playerMoney={gameState.player.money}
        propertyState={propertyState}
        onBuyProperty={handleBuyProperty}
        onRentProperty={handleRentProperty}
        onSellProperty={handleSellProperty}
        onStopRenting={handleStopRenting}
      />
    </div>
  );
};

export default GameScreen;
