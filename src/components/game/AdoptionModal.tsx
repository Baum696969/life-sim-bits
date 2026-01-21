import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Heart, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { boyNames, girlNames } from '@/types/pregnancy';
import { soundManager } from '@/lib/soundManager';

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  onAdopt: (name: string, gender: 'male' | 'female', age: number) => void;
}

const adoptableChildren = [
  { age: 0, label: 'Baby (0 Jahre)', cost: 5000 },
  { age: 2, label: 'Kleinkind (2 Jahre)', cost: 4000 },
  { age: 5, label: 'Vorschulkind (5 Jahre)', cost: 3000 },
  { age: 8, label: 'Schulkind (8 Jahre)', cost: 2500 },
  { age: 12, label: 'Kind (12 Jahre)', cost: 2000 },
];

const AdoptionModal = ({ isOpen, onClose, playerMoney, onAdopt }: AdoptionModalProps) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [customName, setCustomName] = useState('');
  const [step, setStep] = useState<'select' | 'name'>('select');

  const selectedOption = adoptableChildren.find(c => c.age === selectedAge);

  const handleSelectAge = (age: number) => {
    soundManager.playClick();
    setSelectedAge(age);
  };

  const handleContinue = () => {
    if (selectedAge === null) return;
    soundManager.playClick();
    // Generate a random suggested name
    const names = selectedGender === 'male' ? boyNames : girlNames;
    setCustomName(names[Math.floor(Math.random() * names.length)]);
    setStep('name');
  };

  const handleRandomName = () => {
    soundManager.playClick();
    const names = selectedGender === 'male' ? boyNames : girlNames;
    setCustomName(names[Math.floor(Math.random() * names.length)]);
  };

  const handleAdopt = () => {
    if (!customName.trim() || selectedAge === null) return;
    soundManager.playPositiveEffect();
    onAdopt(customName.trim(), selectedGender, selectedAge);
    // Reset state
    setSelectedAge(null);
    setCustomName('');
    setStep('select');
    onClose();
  };

  const handleBack = () => {
    soundManager.playClick();
    setStep('select');
  };

  const canAfford = (cost: number) => playerMoney >= cost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-blue-400 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Kind adoptieren
          </DialogTitle>
        </DialogHeader>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 'select' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {step === 'select' ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Wähle das Alter des Kindes, das du adoptieren möchtest:
              </p>

              <div className="space-y-2">
                {adoptableChildren.map((child) => (
                  <Card 
                    key={child.age}
                    className={`cursor-pointer transition-all ${
                      selectedAge === child.age 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : canAfford(child.cost)
                          ? 'border-muted hover:border-blue-500/50'
                          : 'border-muted opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canAfford(child.cost) && handleSelectAge(child.age)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👶</span>
                        <span className="font-medium">{child.label}</span>
                      </div>
                      <Badge variant={canAfford(child.cost) ? 'secondary' : 'destructive'}>
                        €{child.cost.toLocaleString()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setSelectedGender('male')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedGender === 'male' 
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400' 
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">👦</span> Junge
                </button>
                <button
                  onClick={() => setSelectedGender('female')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedGender === 'female' 
                      ? 'border-pink-500 bg-pink-500/20 text-pink-400' 
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">👧</span> Mädchen
                </button>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={selectedAge === null}
              >
                Weiter
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Gib deinem neuen Kind einen Namen:
              </p>

              <Card className="bg-background/50 border-blue-500/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{selectedGender === 'male' ? '👦' : '👧'}</span>
                      <div>
                        <Badge variant={selectedGender === 'male' ? 'default' : 'secondary'}>
                          {selectedGender === 'male' ? '♂️ Junge' : '♀️ Mädchen'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedOption?.label}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">€{selectedOption?.cost.toLocaleString()}</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Name eingeben..."
                      className="flex-1"
                      maxLength={20}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRandomName}
                    >
                      🎲
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handleAdopt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!customName.trim()}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Adoptieren
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AdoptionModal;
