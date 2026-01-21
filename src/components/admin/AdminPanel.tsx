import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Unlock, Plus, Trash2, Save, X, ChevronDown, ChevronUp, Eye, EyeOff, Gamepad2, Play, BarChart3, Volume2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MinigameModal from '@/components/game/MinigameModal';
import { getAllMinigameStats, getAverageScore, getWinRate, formatLastPlayed, clearMinigameStats, recordMinigamePlay, getTotalPlays, getMostPlayedMinigame } from '@/lib/minigameStats';
import { soundManager } from '@/lib/soundManager';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_CODE = '6911';

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'minigames' | 'stats' | 'sounds'>('events');
  const [testingMinigame, setTestingMinigame] = useState<string | null>(null);
  const [testAge, setTestAge] = useState(25);
  const [lastTestResult, setLastTestResult] = useState<{ score: number; won: boolean; effects: any } | null>(null);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    text: '',
    min_age: 0,
    max_age: 100,
    category: 'random',
    weight: 1.0,
    tags: '',
    options: [
      { label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '', minigame: '' }
    ]
  });

  const handleCodeSubmit = async () => {
    if (codeInput === ADMIN_CODE) {
      setIsAuthenticated(true);
      loadEvents();
      toast({ title: 'Admin-Zugang gewährt', description: 'Willkommen, Administrator!' });
    } else {
      toast({ title: 'Falscher Code', description: 'Zugang verweigert.', variant: 'destructive' });
    }
    setCodeInput('');
  };

  const loadEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEvents(data);
    setIsLoading(false);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.text) {
      toast({ title: 'Fehler', description: 'Titel und Text sind erforderlich.', variant: 'destructive' });
      return;
    }

    const eventData = {
      title: newEvent.title,
      text: newEvent.text,
      min_age: newEvent.min_age,
      max_age: newEvent.max_age,
      category: newEvent.category,
      weight: newEvent.weight,
      tags: newEvent.tags.split(',').map(t => t.trim()).filter(t => t),
      options: newEvent.options.map(opt => ({
        id: Math.random().toString(36).substring(2, 15),
        ...opt,
        minigame: opt.minigame || undefined,
      })),
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) {
      toast({ title: 'Fehler', description: 'Event konnte nicht erstellt werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Erfolg', description: 'Event erstellt!' });
      loadEvents();
      resetNewEvent();
      setShowCreateForm(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    const { error } = await supabase
      .from('events')
      .update({
        title: editingEvent.title,
        text: editingEvent.text,
        min_age: editingEvent.min_age,
        max_age: editingEvent.max_age,
        category: editingEvent.category,
        weight: editingEvent.weight,
        tags: typeof editingEvent.tags === 'string' 
          ? editingEvent.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
          : editingEvent.tags,
        options: editingEvent.options,
        is_active: editingEvent.is_active,
      })
      .eq('id', editingEvent.id);

    if (error) {
      toast({ title: 'Fehler', description: 'Event konnte nicht aktualisiert werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Erfolg', description: 'Event aktualisiert!' });
      loadEvents();
      setEditingEvent(null);
      setExpandedEventId(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Fehler', description: 'Event konnte nicht gelöscht werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Gelöscht', description: 'Event wurde entfernt.' });
      loadEvents();
    }
  };

  const toggleEventActive = async (event: any) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !event.is_active })
      .eq('id', event.id);

    if (!error) {
      loadEvents();
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      text: '',
      min_age: 0,
      max_age: 100,
      category: 'random',
      weight: 1.0,
      tags: '',
      options: [{ label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '', minigame: '' }]
    });
  };

  const handleEventClick = (event: any) => {
    if (expandedEventId === event.id) {
      setExpandedEventId(null);
      setEditingEvent(null);
    } else {
      setExpandedEventId(event.id);
      setEditingEvent({
        ...event,
        tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags || '',
      });
    }
  };

  const updateEditingOption = (index: number, field: string, value: any) => {
    if (!editingEvent) return;
    const updatedOptions = [...editingEvent.options];
    if (field.startsWith('effects.')) {
      const effectKey = field.split('.')[1];
      updatedOptions[index] = {
        ...updatedOptions[index],
        effects: { ...updatedOptions[index].effects, [effectKey]: parseInt(value) || 0 }
      };
    } else {
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    }
    setEditingEvent({ ...editingEvent, options: updatedOptions });
  };

  const addEditingOption = () => {
    if (!editingEvent) return;
    setEditingEvent({
      ...editingEvent,
      options: [...editingEvent.options, { id: Math.random().toString(36).substring(2, 15), label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '', minigame: '' }]
    });
  };

  const removeEditingOption = (index: number) => {
    if (!editingEvent || editingEvent.options.length <= 1) return;
    setEditingEvent({
      ...editingEvent,
      options: editingEvent.options.filter((_: any, i: number) => i !== index)
    });
  };

  const addNewOption = () => {
    setNewEvent({
      ...newEvent,
      options: [...newEvent.options, { label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '', minigame: '' }]
    });
  };

  const updateNewOption = (index: number, field: string, value: any) => {
    const updatedOptions = [...newEvent.options];
    if (field.startsWith('effects.')) {
      const effectKey = field.split('.')[1];
      updatedOptions[index] = {
        ...updatedOptions[index],
        effects: { ...updatedOptions[index].effects, [effectKey]: parseInt(value) || 0 }
      };
    } else {
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    }
    setNewEvent({ ...newEvent, options: updatedOptions });
  };

  const removeNewOption = (index: number) => {
    if (newEvent.options.length > 1) {
      setNewEvent({
        ...newEvent,
        options: newEvent.options.filter((_, i) => i !== index)
      });
    }
  };

  const categoryLabels: Record<string, string> = {
    random: 'Zufall', school: 'Schule', career: 'Karriere', health: 'Gesundheit',
    social: 'Sozial', financial: 'Finanzen', minigame: 'Minigame', education: 'Bildung',
    relationship: 'Beziehung', crime: 'Kriminalität', prison: 'Gefängnis'
  };

  const minigameOptions = [
    { value: '', label: 'Kein Minigame' },
    { value: 'flappy', label: 'Flappy Bird' },
    { value: 'snake', label: 'Snake' },
    { value: 'memory', label: 'Memory' },
    { value: 'puzzle', label: 'Puzzle' },
    { value: 'math', label: 'Mathe-Test' },
    { value: 'sequence', label: 'Merkspiel' },
    { value: 'spaceshooter', label: 'Space Shooter' },
    { value: 'bottles', label: 'Flaschensammeln' },
    { value: 'english', label: 'Englisch-Test' },
    { value: 'german', label: 'Deutsch-Test' },
    { value: 'timesense', label: 'Zeitgefühl' },
    { value: 'pickpocket', label: 'Taschendiebstahl' },
    { value: 'stealth', label: 'Einbruch' },
    { value: 'fastfood', label: 'Fast Food Praktikum' },
    { value: 'warehouse', label: 'Lager Praktikum' },
    { value: 'office', label: 'Büro Praktikum' },
  ];

  // Minigames by category for testing
  const eventMinigames = [
    { id: 'flappy', name: 'Flappy Bird', emoji: '🐦', description: 'Springe durch Röhren ohne zu crashen' },
    { id: 'snake', name: 'Snake', emoji: '🐍', description: 'Sammle Punkte ohne dich selbst zu beißen' },
    { id: 'memory', name: 'Memory', emoji: '🧠', description: 'Finde passende Kartenpaare' },
    { id: 'puzzle', name: 'Puzzle', emoji: '🧩', description: '3x3 Schiebepuzzle lösen' },
    { id: 'math', name: 'Mathe-Test', emoji: '🔢', description: 'Beantworte Mathe-Fragen unter Zeitdruck' },
    { id: 'sequence', name: 'Merkspiel', emoji: '🎯', description: 'Merke dir die Reihenfolge der Symbole' },
    { id: 'spaceshooter', name: 'Space Shooter', emoji: '🚀', description: 'Schieße auf Feinde im Weltraum' },
    { id: 'bottles', name: 'Flaschensammeln', emoji: '🍾', description: 'Sammle Flaschen für €0,25 pro Stück' },
    { id: 'english', name: 'Englisch-Test', emoji: '🇬🇧', description: 'Übersetze Wörter ins Englische' },
    { id: 'german', name: 'Deutsch-Test', emoji: '📝', description: 'Grammatik und Rechtschreibung' },
    { id: 'timesense', name: 'Zeitgefühl', emoji: '⏱️', description: 'Stoppe genau nach X Sekunden ohne Uhr' },
  ];

  const internshipMinigames = [
    { id: 'fastfood', name: 'Fast Food Praktikum', emoji: '🍔', description: 'Nimm Bestellungen auf und serviere sie' },
    { id: 'warehouse', name: 'Lager Praktikum', emoji: '📦', description: 'Sortiere Pakete in die richtigen Zonen' },
    { id: 'office', name: 'Büro Praktikum', emoji: '🏢', description: 'Erledige Büroaufgaben Schritt für Schritt' },
  ];

  const crimeMinigames = [
    { id: 'pickpocket', name: 'Taschendiebstahl', emoji: '🤏', description: 'Tippe Wörter schnell für erfolgreichen Diebstahl' },
    { id: 'stealth', name: 'Einbruch', emoji: '🥷', description: 'Schleiche dich vorbei an Wachen und sammle Beute' },
  ];

  const allMinigames = [...eventMinigames, ...internshipMinigames, ...crimeMinigames];

  // Sound effects list for testing
  const soundEffects = [
    { id: 'click', name: 'Click', fn: () => soundManager.playClick() },
    { id: 'hover', name: 'Hover', fn: () => soundManager.playHover() },
    { id: 'buttonPress', name: 'Button Press', fn: () => soundManager.playButtonPress() },
    { id: 'toggle', name: 'Toggle', fn: () => soundManager.playToggle() },
    { id: 'positiveEffect', name: 'Positiver Effekt', fn: () => soundManager.playPositiveEffect() },
    { id: 'negativeEffect', name: 'Negativer Effekt', fn: () => soundManager.playNegativeEffect() },
    { id: 'levelUp', name: 'Level Up', fn: () => soundManager.playLevelUp() },
    { id: 'gameOver', name: 'Game Over', fn: () => soundManager.playGameOver() },
    { id: 'newYear', name: 'Neues Jahr', fn: () => soundManager.playNewYear() },
    { id: 'minigameStart', name: 'Minigame Start', fn: () => soundManager.playMinigameStart() },
    { id: 'minigameWin', name: 'Minigame Gewonnen', fn: () => soundManager.playMinigameWin() },
    { id: 'minigameLose', name: 'Minigame Verloren', fn: () => soundManager.playMinigameLose() },
    { id: 'coins', name: 'Münzen', fn: () => soundManager.playCoins() },
    { id: 'cardFlip', name: 'Karte umdrehen', fn: () => soundManager.playCardFlip() },
    { id: 'match', name: 'Match', fn: () => soundManager.playMatch() },
    { id: 'schoolBell', name: 'Schulglocke', fn: () => soundManager.playSchoolBell() },
    { id: 'jobPromotion', name: 'Job Beförderung', fn: () => soundManager.playJobPromotion() },
    { id: 'crimeSuccess', name: 'Verbrechen Erfolg', fn: () => soundManager.playCrimeSuccess() },
    { id: 'crimeFail', name: 'Verbrechen Fehlschlag', fn: () => soundManager.playCrimeFail() },
    { id: 'prisonDoor', name: 'Gefängnistür', fn: () => soundManager.playPrisonDoor() },
    { id: 'bottleCollect', name: 'Flasche sammeln', fn: () => soundManager.playBottleCollect() },
    { id: 'shoot', name: 'Schuss', fn: () => soundManager.playShoot() },
    { id: 'explosion', name: 'Explosion', fn: () => soundManager.playExplosion() },
    { id: 'hit', name: 'Treffer', fn: () => soundManager.playHit() },
    { id: 'healthUp', name: 'Gesundheit +', fn: () => soundManager.playHealthUp() },
    { id: 'healthDown', name: 'Gesundheit -', fn: () => soundManager.playHealthDown() },
    { id: 'ageUp', name: 'Älter werden', fn: () => soundManager.playAgeUp() },
    { id: 'correctAnswer', name: 'Richtige Antwort', fn: () => soundManager.playCorrectAnswer() },
    { id: 'wrongAnswer', name: 'Falsche Antwort', fn: () => soundManager.playWrongAnswer() },
    { id: 'eventAppear', name: 'Event erscheint', fn: () => soundManager.playEventAppear() },
    { id: 'lottoWin', name: 'Lotto Gewinn', fn: () => soundManager.playLottoWin() },
    { id: 'lottoLose', name: 'Lotto Verlust', fn: () => soundManager.playLottoLose() },
    { id: 'newSibling', name: 'Neues Geschwister', fn: () => soundManager.playNewSibling() },
    { id: 'optionSelect', name: 'Option wählen', fn: () => soundManager.playOptionSelect() },
    { id: 'babyBorn', name: 'Baby geboren', fn: () => soundManager.playBabyBorn() },
    { id: 'pregnancyStart', name: 'Schwangerschaft', fn: () => soundManager.playPregnancyStart() },
    { id: 'propertyBuy', name: 'Immobilie kaufen', fn: () => soundManager.playPropertyBuy() },
    { id: 'propertySell', name: 'Immobilie verkaufen', fn: () => soundManager.playPropertySell() },
    { id: 'kindergeld', name: 'Kindergeld', fn: () => soundManager.playKindergeld() },
  ];

  const handleMinigameTest = (minigameId: string) => {
    setTestingMinigame(minigameId);
    setLastTestResult(null);
  };

  const handleMinigameComplete = (result: { score: number; won: boolean; effects: any }) => {
    // Record stats for the minigame
    if (testingMinigame) {
      recordMinigamePlay(testingMinigame, result.score, result.won);
      setStatsRefresh(prev => prev + 1);
    }
    setLastTestResult(result);
    setTestingMinigame(null);
    toast({
      title: result.won ? '🎉 Gewonnen!' : '❌ Verloren',
      description: `Score: ${result.score} | Effekte: ${JSON.stringify(result.effects)}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-destructive/30">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-destructive flex items-center gap-2">
            <Shield className="h-6 w-6" /> Admin Panel
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-8">
              <Lock className="h-16 w-16 text-destructive" />
              <p className="text-muted-foreground">Admin-Code eingeben:</p>
              <Input
                type="password"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                className="max-w-xs text-center text-2xl tracking-widest"
                placeholder="****"
                maxLength={4}
              />
              <Button onClick={handleCodeSubmit} className="bg-destructive hover:bg-destructive/90">
                <Unlock className="mr-2 h-4 w-4" /> Entsperren
              </Button>
            </motion.div>
          ) : (
            <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'events' | 'minigames' | 'stats' | 'sounds')}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="events">📋 Events</TabsTrigger>
                  <TabsTrigger value="minigames">🎮 Testen</TabsTrigger>
                  <TabsTrigger value="stats">📊 Statistik</TabsTrigger>
                  <TabsTrigger value="sounds">🔊 Sounds</TabsTrigger>
                </TabsList>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-4">
                  {/* Create New Event Button */}
                  <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline" className="w-full border-primary/50">
                    <Plus className="mr-2 h-4 w-4" /> {showCreateForm ? 'Formular ausblenden' : 'Neues Event erstellen'}
                  </Button>

                  {/* Create Event Form (Collapsible) */}
                  <AnimatePresence>
                    {showCreateForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                        <h3 className="font-display text-lg text-primary mb-4">Neues Event</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Titel</label>
                            <Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event Titel" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Kategorie</label>
                            <select value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              {Object.entries(categoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-muted-foreground">Text</label>
                          <textarea value={newEvent.text} onChange={(e) => setNewEvent({ ...newEvent, text: e.target.value })} placeholder="Event Beschreibung..." className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Min Alter</label>
                            <Input type="number" value={newEvent.min_age} onChange={(e) => setNewEvent({ ...newEvent, min_age: parseInt(e.target.value) || 0 })} />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Max Alter</label>
                            <Input type="number" value={newEvent.max_age} onChange={(e) => setNewEvent({ ...newEvent, max_age: parseInt(e.target.value) || 100 })} />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Gewicht</label>
                            <Input type="number" step="0.1" value={newEvent.weight} onChange={(e) => setNewEvent({ ...newEvent, weight: parseFloat(e.target.value) || 1 })} />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Tags</label>
                            <Input value={newEvent.tags} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} placeholder="tag1, tag2" />
                          </div>
                        </div>
                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-muted-foreground">Optionen</label>
                            <Button size="sm" variant="outline" onClick={addNewOption}><Plus className="h-4 w-4" /></Button>
                          </div>
                          {newEvent.options.map((option, index) => (
                            <div key={index} className="bg-background/50 rounded-lg p-3 space-y-2">
                              <div className="flex gap-2">
                                <Input value={option.label} onChange={(e) => updateNewOption(index, 'label', e.target.value)} placeholder="Button Text" className="flex-1" />
                                <select value={option.minigame} onChange={(e) => updateNewOption(index, 'minigame', e.target.value)} className="h-10 px-2 rounded-md border border-input bg-background text-sm">
                                  {minigameOptions.map(mg => <option key={mg.value} value={mg.value}>{mg.label}</option>)}
                                </select>
                                <Button size="icon" variant="ghost" onClick={() => removeNewOption(index)} disabled={newEvent.options.length <= 1}><X className="h-4 w-4" /></Button>
                              </div>
                              <Input value={option.resultText} onChange={(e) => updateNewOption(index, 'resultText', e.target.value)} placeholder="Ergebnis Text" />
                              <div className="grid grid-cols-5 gap-2">
                                {['moneyDelta', 'iqDelta', 'healthDelta', 'fitnessDelta', 'looksDelta'].map(key => (
                                  <div key={key}>
                                    <label className="text-xs text-muted-foreground">{key.replace('Delta', '')}</label>
                                    <Input type="number" value={(option.effects as any)[key] || 0} onChange={(e) => updateNewOption(index, `effects.${key}`, e.target.value)} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={handleCreateEvent} className="w-full bg-primary"><Save className="mr-2 h-4 w-4" /> Event speichern</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Events List */}
                  <div>
                    <h3 className="font-display text-lg text-primary mb-3">Events ({events.length})</h3>
                    {isLoading ? (
                      <p className="text-muted-foreground">Laden...</p>
                    ) : events.length === 0 ? (
                      <p className="text-muted-foreground">Keine Events vorhanden.</p>
                    ) : (
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {events.map((event) => (
                          <div key={event.id} className="bg-muted/30 rounded-lg overflow-hidden">
                            {/* Compact Row */}
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50" onClick={() => handleEventClick(event)}>
                              <div className="flex items-center gap-3 flex-1">
                                <button onClick={(e) => { e.stopPropagation(); toggleEventActive(event); }} className={`p-1 rounded ${event.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {event.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <span className="font-medium">{event.title}</span>
                                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded">{categoryLabels[event.category] || event.category}</span>
                                <span className="text-xs text-muted-foreground">{event.min_age}-{event.max_age}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {expandedEventId === event.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </div>

                            {/* Expanded Editor */}
                            <AnimatePresence>
                              {expandedEventId === event.id && editingEvent && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                  <div className="p-4 border-t border-border space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm text-muted-foreground">Titel</label>
                                        <Input value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} />
                                      </div>
                                      <div>
                                        <label className="text-sm text-muted-foreground">Kategorie</label>
                                        <select value={editingEvent.category} onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                          {Object.entries(categoryLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm text-muted-foreground">Text</label>
                                      <textarea value={editingEvent.text} onChange={(e) => setEditingEvent({ ...editingEvent, text: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                      <div>
                                        <label className="text-sm text-muted-foreground">Min Alter</label>
                                        <Input type="number" value={editingEvent.min_age} onChange={(e) => setEditingEvent({ ...editingEvent, min_age: parseInt(e.target.value) || 0 })} />
                                      </div>
                                      <div>
                                        <label className="text-sm text-muted-foreground">Max Alter</label>
                                        <Input type="number" value={editingEvent.max_age} onChange={(e) => setEditingEvent({ ...editingEvent, max_age: parseInt(e.target.value) || 100 })} />
                                      </div>
                                      <div>
                                        <label className="text-sm text-muted-foreground">Gewicht</label>
                                        <Input type="number" step="0.1" value={editingEvent.weight} onChange={(e) => setEditingEvent({ ...editingEvent, weight: parseFloat(e.target.value) || 1 })} />
                                      </div>
                                      <div>
                                        <label className="text-sm text-muted-foreground">Tags</label>
                                        <Input value={editingEvent.tags} onChange={(e) => setEditingEvent({ ...editingEvent, tags: e.target.value })} />
                                      </div>
                                    </div>
                                    {/* Options Editor */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <label className="text-sm text-muted-foreground">Optionen</label>
                                        <Button size="sm" variant="outline" onClick={addEditingOption}><Plus className="h-4 w-4" /></Button>
                                      </div>
                                      {editingEvent.options?.map((option: any, index: number) => (
                                        <div key={index} className="bg-background/50 rounded-lg p-3 space-y-2">
                                          <div className="flex gap-2">
                                            <Input value={option.label} onChange={(e) => updateEditingOption(index, 'label', e.target.value)} placeholder="Button Text" className="flex-1" />
                                            <select value={option.minigame || ''} onChange={(e) => updateEditingOption(index, 'minigame', e.target.value)} className="h-10 px-2 rounded-md border border-input bg-background text-sm">
                                              {minigameOptions.map(mg => <option key={mg.value} value={mg.value}>{mg.label}</option>)}
                                            </select>
                                            <Button size="icon" variant="ghost" onClick={() => removeEditingOption(index)} disabled={editingEvent.options.length <= 1}><X className="h-4 w-4" /></Button>
                                          </div>
                                          <Input value={option.resultText} onChange={(e) => updateEditingOption(index, 'resultText', e.target.value)} placeholder="Ergebnis Text" />
                                          <div className="grid grid-cols-5 gap-2">
                                            {['moneyDelta', 'iqDelta', 'healthDelta', 'fitnessDelta', 'looksDelta'].map(key => (
                                              <div key={key}>
                                                <label className="text-xs text-muted-foreground">{key.replace('Delta', '')}</label>
                                                <Input type="number" value={option.effects?.[key] || 0} onChange={(e) => updateEditingOption(index, `effects.${key}`, e.target.value)} />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={handleUpdateEvent} className="flex-1 bg-primary"><Save className="mr-2 h-4 w-4" /> Speichern</Button>
                                      <Button onClick={() => { setExpandedEventId(null); setEditingEvent(null); }} variant="outline">Abbrechen</Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Minigames Tab */}
                <TabsContent value="minigames" className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Gamepad2 className="h-6 w-6 text-primary" />
                      <h3 className="font-display text-lg text-primary">Minigame Tester</h3>
                    </div>
                    
                    <div className="mb-4">
                      <label className="text-sm text-muted-foreground">Test-Alter (für altersabhängige Spiele)</label>
                      <Input 
                        type="number" 
                        value={testAge} 
                        onChange={(e) => setTestAge(parseInt(e.target.value) || 0)} 
                        className="max-w-[100px]"
                        min={0}
                        max={100}
                      />
                    </div>

                    {/* Last Test Result */}
                    {lastTestResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-3 rounded-lg ${lastTestResult.won ? 'bg-success/20 border border-success/50' : 'bg-destructive/20 border border-destructive/50'}`}
                      >
                        <p className="font-medium">Letztes Ergebnis:</p>
                        <p className="text-sm">Score: {lastTestResult.score} | {lastTestResult.won ? 'Gewonnen ✓' : 'Verloren ✗'}</p>
                        <p className="text-xs text-muted-foreground">Effekte: {JSON.stringify(lastTestResult.effects)}</p>
                      </motion.div>
                    )}

                    {/* Event Minigames Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="text-lg">🎮</span> Event Minigames ({eventMinigames.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {eventMinigames.map((game) => (
                          <motion.div
                            key={game.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-background/50 rounded-lg p-3 border border-primary/20 hover:border-primary/50 cursor-pointer transition-colors"
                            onClick={() => handleMinigameTest(game.id)}
                          >
                            <div className="text-2xl mb-1">{game.emoji}</div>
                            <h4 className="font-medium text-xs">{game.name}</h4>
                            <Button size="sm" variant="outline" className="mt-2 w-full text-xs h-7">
                              <Play className="h-3 w-3 mr-1" /> Test
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Internship Minigames Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="text-lg">💼</span> Praktikums Minigames ({internshipMinigames.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {internshipMinigames.map((game) => (
                          <motion.div
                            key={game.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500/60 cursor-pointer transition-colors"
                            onClick={() => handleMinigameTest(game.id)}
                          >
                            <div className="text-3xl mb-2">{game.emoji}</div>
                            <h4 className="font-medium text-sm">{game.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
                            <Button size="sm" variant="outline" className="mt-3 w-full border-yellow-500/50">
                              <Play className="h-3 w-3 mr-1" /> Praktikum starten
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Crime Minigames Section */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="text-lg">🚨</span> Kriminelle Minigames ({crimeMinigames.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {crimeMinigames.map((game) => (
                          <motion.div
                            key={game.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-destructive/10 rounded-lg p-4 border border-destructive/30 hover:border-destructive/60 cursor-pointer transition-colors"
                            onClick={() => handleMinigameTest(game.id)}
                          >
                            <div className="text-3xl mb-2">{game.emoji}</div>
                            <h4 className="font-medium text-sm">{game.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
                            <Button size="sm" variant="destructive" className="mt-3 w-full">
                              <Play className="h-3 w-3 mr-1" /> Verbrechen testen
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <h3 className="font-display text-lg text-primary">Minigame Statistiken</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setStatsRefresh(prev => prev + 1)}>
                          <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { clearMinigameStats(); setStatsRefresh(prev => prev + 1); }}>
                          <Trash2 className="h-4 w-4 mr-1" /> Zurücksetzen
                        </Button>
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-display text-primary">{getTotalPlays()}</p>
                        <p className="text-xs text-muted-foreground">Gesamt gespielt</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-display text-primary">{Object.keys(getAllMinigameStats()).length}</p>
                        <p className="text-xs text-muted-foreground">Verschiedene Spiele</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 text-center col-span-2">
                        {(() => {
                          const mostPlayed = getMostPlayedMinigame();
                          const game = mostPlayed ? allMinigames.find(g => g.id === mostPlayed.id) : null;
                          return (
                            <>
                              <p className="text-lg font-display text-primary">{game ? `${game.emoji} ${game.name}` : '-'}</p>
                              <p className="text-xs text-muted-foreground">Meist gespielt {mostPlayed ? `(${mostPlayed.count}x)` : ''}</p>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Per-game stats */}
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {allMinigames.map((game) => {
                        const stats = getAllMinigameStats()[game.id];
                        if (!stats) return (
                          <div key={game.id} className="bg-background/30 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{game.emoji}</span>
                              <span className="font-medium">{game.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Noch nicht gespielt</span>
                          </div>
                        );
                        return (
                          <div key={game.id} className="bg-background/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{game.emoji}</span>
                                <span className="font-medium">{game.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{formatLastPlayed(stats.lastPlayed)}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-center text-sm">
                              <div>
                                <p className="font-medium text-primary">{stats.playCount}</p>
                                <p className="text-xs text-muted-foreground">Gespielt</p>
                              </div>
                              <div>
                                <p className="font-medium text-success">{stats.wins}</p>
                                <p className="text-xs text-muted-foreground">Siege</p>
                              </div>
                              <div>
                                <p className="font-medium text-destructive">{stats.losses}</p>
                                <p className="text-xs text-muted-foreground">Niederlagen</p>
                              </div>
                              <div>
                                <p className="font-medium">{getWinRate(game.id)}%</p>
                                <p className="text-xs text-muted-foreground">Winrate</p>
                              </div>
                              <div>
                                <p className="font-medium">{getAverageScore(game.id)}</p>
                                <p className="text-xs text-muted-foreground">Ø Score</p>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
                              <span>Highscore: {stats.highScore}</span>
                              <span>Lowscore: {stats.lowScore === Infinity ? '-' : stats.lowScore}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Sound Tester Tab */}
                <TabsContent value="sounds" className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Volume2 className="h-6 w-6 text-primary" />
                      <h3 className="font-display text-lg text-primary">Sound-Effekte Tester</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Klicke auf einen Sound, um ihn abzuspielen. {soundManager.isEnabled() ? '🔊 Sounds sind aktiviert' : '🔇 Sounds sind deaktiviert'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {soundEffects.map((sound) => (
                        <Button
                          key={sound.id}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => {
                            sound.fn();
                            toast({ title: `🔊 ${sound.name}`, description: 'Sound abgespielt' });
                          }}
                        >
                          <Volume2 className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{sound.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minigame Modal for Testing */}
        <MinigameModal
          isOpen={!!testingMinigame}
          minigame={testingMinigame}
          onComplete={handleMinigameComplete}
          onClose={() => setTestingMinigame(null)}
          playerMoney={10000}
          playerAge={testAge}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
