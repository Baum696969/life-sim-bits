import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, User, Volume2, VolumeX, BarChart3, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminPanel from '@/components/admin/AdminPanel';
import { getAllMinigameStats, MinigameStatsRecord } from '@/lib/minigameStats';

const Settings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [stats, setStats] = useState<MinigameStatsRecord | null>(null);

  useEffect(() => {
    setStats(getAllMinigameStats());
  }, []);

  const handleVersionTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 8) {
      setShowAdminButton(true);
    }
  };

  const totalPlays = stats ? Object.values(stats).reduce((sum, s) => sum + s.playCount, 0) : 0;
  const totalWins = stats ? Object.values(stats).reduce((sum, s) => sum + s.wins, 0) : 0;
  const winRate = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
          </Link>
          <h1 className="font-display text-3xl text-primary">Einstellungen</h1>
          <div className="w-24" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sound */}
          <div className="bg-card rounded-lg p-4 card-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Sound-Effekte</p>
                  <p className="text-sm text-muted-foreground">Spielsounds aktivieren</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-card rounded-lg p-4 card-glow">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Spielstand</p>
                <p className="text-sm text-muted-foreground">
                  Dein Fortschritt wird automatisch im Browser gespeichert.
                </p>
              </div>
            </div>
          </div>

          {/* Minigame Statistics */}
          <div className="bg-card rounded-lg p-4 card-glow">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Minigame-Statistiken</p>
                <p className="text-sm text-muted-foreground">Deine Spielergebnisse</p>
              </div>
            </div>
            
            {stats && totalPlays > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-primary">{totalPlays}</p>
                    <p className="text-xs text-muted-foreground">Gespielt</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-500">{totalWins}</p>
                    <p className="text-xs text-muted-foreground">Gewonnen</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-info">{winRate}%</p>
                    <p className="text-xs text-muted-foreground">Winrate</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-muted-foreground font-medium">Top Spiele:</p>
                  {Object.entries(stats)
                    .filter(([_, s]) => s.playCount > 0)
                    .sort((a, b) => b[1].playCount - a[1].playCount)
                    .slice(0, 3)
                    .map(([name, s]) => (
                      <div key={name} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.playCount}x • {s.playCount > 0 ? Math.round((s.wins / s.playCount) * 100) : 0}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Minigames gespielt.
              </p>
            )}
          </div>

          {/* Admin Button - Hidden until 8 taps */}
          {showAdminButton && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-lg p-4 card-glow border border-destructive/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Admin-Bereich</p>
                    <p className="text-sm text-muted-foreground">Events verwalten (Code erforderlich)</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setShowAdmin(true)}
                >
                  Öffnen
                </Button>
              </div>
            </motion.div>
          )}

          {/* Credits */}
          <div className="text-center text-muted-foreground text-sm mt-8">
            <p 
              onClick={handleVersionTap}
              className="cursor-pointer select-none hover:text-primary transition-colors"
            >
              GitLife v1.0 {tapCount > 0 && tapCount < 8 && `(${8 - tapCount})`}
            </p>
            <p className="mt-1">Ein BitLife-inspiriertes Lebenssimulationsspiel</p>
          </div>
        </motion.div>
      </div>

      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
};

export default Settings;
