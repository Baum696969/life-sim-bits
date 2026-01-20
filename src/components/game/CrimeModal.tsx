import { Player, CriminalRecord } from '@/types/game';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { crimeOptions, CrimeOption, attemptCrime } from '@/lib/crimeSystem';
import { AlertTriangle, DollarSign, Percent, Clock, Skull } from 'lucide-react';

export interface CrimeResult {
  success: boolean;
  reward: number;
  prisonYears: number;
  record: CriminalRecord;
  crime: CrimeOption;
}

interface CrimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onCrimeResult: (result: CrimeResult) => void;
}

const CrimeModal = ({ isOpen, onClose, player, onCrimeResult }: CrimeModalProps) => {
  const crimes = crimeOptions;

  const handleCommitCrime = (crime: CrimeOption) => {
    const result = attemptCrime(crime, player);
    onCrimeResult({ ...result, crime });
  };

  const getSuccessChanceForPlayer = (crime: CrimeOption): number => {
    let chance = crime.baseSuccessRate * 100;
    
    // IQ bonus
    chance += (player.stats.iq - 50) * 0.2;
    // Luck bonus
    chance += (player.stats.luck - 50) * 0.3;
    // Criminal experience bonus
    const successfulCrimes = player.criminalRecord.filter(r => !r.caught).length;
    chance += successfulCrimes * 2;
    // Penalty for past catches
    const catches = player.criminalRecord.filter(r => r.caught).length;
    chance -= catches * 5;
    
    return Math.max(5, Math.min(95, Math.round(chance)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-destructive/30">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-destructive flex items-center gap-2">
            <Skull className="h-6 w-6" />
            Kriminalität
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Warnung: Kriminalität ist riskant!</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Du kannst erwischt werden und ins Gefängnis kommen. Dein Job wird gekündigt und Vorstrafen beeinflussen deine Zukunft.
          </p>
        </div>

        {/* Criminal Record Summary */}
        {player.criminalRecord.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">Vorstrafenregister</p>
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>Vergehen: {player.criminalRecord.length}</span>
              <span>Erwischt: {player.criminalRecord.filter(r => r.caught).length}</span>
              <span className="text-success">Erfolge: {player.criminalRecord.filter(r => !r.caught).length}</span>
            </div>
          </div>
        )}

        {/* Crime Options */}
        <div className="space-y-3">
          {crimes.map((crime) => {
            const successChance = getSuccessChanceForPlayer(crime);
            
            return (
              <motion.div
                key={crime.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-destructive/30 bg-card hover:border-destructive/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-lg">
                      {crime.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{crime.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-success" />
                        <span className="text-success">€{crime.minReward} - €{crime.maxReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        <span className={successChance >= 50 ? 'text-success' : 'text-destructive'}>
                          {successChance}% Erfolg
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {crime.basePrisonYears}-{crime.maxPrisonYears} Jahre Gefängnis
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCommitCrime(crime)}
                    variant="destructive"
                    size="sm"
                    className="bg-destructive/80 hover:bg-destructive"
                  >
                    Ausführen
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrimeModal;
