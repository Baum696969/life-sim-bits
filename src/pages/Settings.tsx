import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, User, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminPanel from '@/components/admin/AdminPanel';

const Settings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

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

          {/* Admin Button */}
          <div className="bg-card rounded-lg p-4 card-glow border border-destructive/30">
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
          </div>

          {/* Credits */}
          <div className="text-center text-muted-foreground text-sm mt-8">
            <p>GitLife v1.0</p>
            <p className="mt-1">Ein BitLife-inspiriertes Lebenssimulationsspiel</p>
          </div>
        </motion.div>
      </div>

      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
};

export default Settings;
