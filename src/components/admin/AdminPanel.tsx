import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Lock, Unlock, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GameEvent, EventOption } from '@/types/game';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Admin code hash check (simple for demo - in production use bcrypt via edge function)
const ADMIN_CODE = '6911';

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
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
      { label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '' }
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
    
    if (data) {
      setEvents(data);
    }
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
        ...opt
      })),
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) {
      toast({ title: 'Fehler', description: 'Event konnte nicht erstellt werden. Bitte einloggen.', variant: 'destructive' });
    } else {
      toast({ title: 'Erfolg', description: 'Event erstellt!' });
      loadEvents();
      setNewEvent({
        title: '',
        text: '',
        min_age: 0,
        max_age: 100,
        category: 'random',
        weight: 1.0,
        tags: '',
        options: [{ label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '' }]
      });
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

  const addOption = () => {
    setNewEvent({
      ...newEvent,
      options: [...newEvent.options, { label: '', effects: { moneyDelta: 0, iqDelta: 0, healthDelta: 0, fitnessDelta: 0, looksDelta: 0 }, resultText: '' }]
    });
  };

  const updateOption = (index: number, field: string, value: any) => {
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

  const removeOption = (index: number) => {
    if (newEvent.options.length > 1) {
      setNewEvent({
        ...newEvent,
        options: newEvent.options.filter((_, i) => i !== index)
      });
    }
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
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
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
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Create Event Form */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-display text-lg text-primary mb-4">Neues Event erstellen</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Titel</label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Event Titel"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Kategorie</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="random">Zufall</option>
                      <option value="school">Schule</option>
                      <option value="career">Karriere</option>
                      <option value="health">Gesundheit</option>
                      <option value="social">Sozial</option>
                      <option value="financial">Finanzen</option>
                      <option value="minigame">Minigame</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-muted-foreground">Text</label>
                  <textarea
                    value={newEvent.text}
                    onChange={(e) => setNewEvent({ ...newEvent, text: e.target.value })}
                    placeholder="Event Beschreibung..."
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Min Alter</label>
                    <Input
                      type="number"
                      value={newEvent.min_age}
                      onChange={(e) => setNewEvent({ ...newEvent, min_age: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Max Alter</label>
                    <Input
                      type="number"
                      value={newEvent.max_age}
                      onChange={(e) => setNewEvent({ ...newEvent, max_age: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Gewicht</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newEvent.weight}
                      onChange={(e) => setNewEvent({ ...newEvent, weight: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tags (komma-getrennt)</label>
                    <Input
                      value={newEvent.tags}
                      onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Optionen</label>
                    <Button size="sm" variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-1" /> Option
                    </Button>
                  </div>
                  
                  {newEvent.options.map((option, index) => (
                    <div key={index} className="bg-background/50 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                          placeholder="Button Text"
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                          disabled={newEvent.options.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={option.resultText}
                        onChange={(e) => updateOption(index, 'resultText', e.target.value)}
                        placeholder="Ergebnis Text"
                      />
                      <div className="grid grid-cols-5 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">€</label>
                          <Input
                            type="number"
                            value={option.effects.moneyDelta}
                            onChange={(e) => updateOption(index, 'effects.moneyDelta', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">IQ</label>
                          <Input
                            type="number"
                            value={option.effects.iqDelta}
                            onChange={(e) => updateOption(index, 'effects.iqDelta', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Health</label>
                          <Input
                            type="number"
                            value={option.effects.healthDelta}
                            onChange={(e) => updateOption(index, 'effects.healthDelta', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Fitness</label>
                          <Input
                            type="number"
                            value={option.effects.fitnessDelta}
                            onChange={(e) => updateOption(index, 'effects.fitnessDelta', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Looks</label>
                          <Input
                            type="number"
                            value={option.effects.looksDelta}
                            onChange={(e) => updateOption(index, 'effects.looksDelta', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleCreateEvent} className="w-full mt-4 bg-primary">
                  <Save className="mr-2 h-4 w-4" /> Event speichern
                </Button>
              </div>

              {/* Events List */}
              <div>
                <h3 className="font-display text-lg text-primary mb-4">Vorhandene Events ({events.length})</h3>
                
                {isLoading ? (
                  <p className="text-muted-foreground">Laden...</p>
                ) : events.length === 0 ? (
                  <p className="text-muted-foreground">Keine benutzerdefinierten Events vorhanden.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Alter {event.min_age}-{event.max_age} | {event.category}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
