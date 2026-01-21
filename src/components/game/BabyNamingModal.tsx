import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { boyNames, girlNames } from '@/types/pregnancy';
import { soundManager } from '@/lib/soundManager';

interface BabyNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  babies: { gender: 'male' | 'female'; suggestedName: string }[];
  onConfirm: (names: string[]) => void;
}

const BabyNamingModal = ({ isOpen, onClose, babies, onConfirm }: BabyNamingModalProps) => {
  const [names, setNames] = useState<string[]>(babies.map(b => b.suggestedName));

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
  };

  const handleRandomName = (index: number) => {
    soundManager.playClick();
    const gender = babies[index].gender;
    const nameList = gender === 'male' ? boyNames : girlNames;
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];
    handleNameChange(index, randomName);
  };

  const handleConfirm = () => {
    // Validate all names are filled
    const validNames = names.map((n, i) => n.trim() || babies[i].suggestedName);
    soundManager.playPositiveEffect();
    onConfirm(validNames);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-pink-500/30">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-pink-400 flex items-center gap-2">
            <Baby className="h-5 w-5" />
            {babies.length === 1 ? 'Dein Baby ist da!' : 'Deine Zwillinge sind da!'}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            Herzlichen Glückwunsch! Wähle {babies.length === 1 ? 'einen Namen' : 'Namen'} für {babies.length === 1 ? 'dein Baby' : 'deine Babys'}:
          </p>

          {babies.map((baby, index) => (
            <Card key={index} className="bg-background/50 border-pink-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{baby.gender === 'male' ? '👶🏻' : '👶🏻'}</span>
                    <Badge variant={baby.gender === 'male' ? 'default' : 'secondary'}>
                      {baby.gender === 'male' ? '♂️ Junge' : '♀️ Mädchen'}
                    </Badge>
                  </div>
                  <Heart className="h-4 w-4 text-pink-400" />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={names[index]}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Name eingeben..."
                    className="flex-1"
                    maxLength={20}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRandomName(index)}
                  >
                    🎲
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleConfirm}
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={names.some(n => !n.trim())}
          >
            <Baby className="h-4 w-4 mr-2" />
            {babies.length === 1 ? 'Baby benennen' : 'Babys benennen'}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default BabyNamingModal;
