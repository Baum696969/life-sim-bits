import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Book, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  details: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.0',
    date: '21. Januar 2025',
    title: 'Praktikum & Kriminelle Minigames',
    highlights: [
      'Pflicht-Praktikum mit 3 Minispielen',
      'Verbrechen-Minigames',
      'Admin Panel in 3 Bereiche',
      'Erweitertes Freunde-System',
    ],
    details: [
      'Pflicht-Praktikum zwischen 14-16 Jahren',
      '🍔 Fast Food: Bestellungen aufnehmen und servieren',
      '📦 Lager: Pakete in richtige Zonen sortieren',
      '🏢 Büro: Aufgaben Schritt für Schritt erledigen',
      'Jedes Praktikum dauert 2 Minuten',
      '€150 Belohnung für erfolgreiches Praktikum',
      '🤏 Taschendiebstahl: Schnell-Tipp-Spiel',
      '🥷 Einbruch: Schleich-Spiel mit Wachen',
      'Admin Panel: 3 Bereiche (Events, Praktika, Kriminalität)',
      'Freunde haben jetzt Level (Bekannter → Bester Freund)',
      'Streit-System mit Cooldown',
      'Neue Freunde kennenlernen',
    ],
  },
  {
    version: '0.9',
    date: '21. Januar 2025',
    title: 'Admin Tools & Zeitgefühl',
    highlights: [
      'Neues Minigame: Zeitgefühl',
      'Minigame-Statistiken',
      'Sound-Tester im Admin',
      'Erweiterte Admin-Tools',
    ],
    details: [
      'Zeitgefühl: Stoppe genau nach X Sekunden ohne Uhr',
      '5 Level mit steigender Schwierigkeit',
      'Perfect-Streak Bonus-System',
      'Admin Panel: Statistik-Tab mit Spielzahlen',
      'Durchschnittliche Scores und Winrates',
      'Highscore und Lowscore pro Minigame',
      'Admin Panel: Sound-Tester für alle 30+ Effekte',
      'Minigame-Statistiken werden gespeichert',
    ],
  },
  {
    version: '0.8',
    date: '21. Januar 2025',
    title: 'Aktivitäten & Casino Update',
    highlights: [
      'Aktivitäten-Limit pro Jahr',
      'Aktivitäten mit Freunden',
      'Eltern zahlen bis 18',
      'Flappy Bird überarbeitet',
    ],
    details: [
      'Aktivitäten haben jetzt ein Limit pro Jahr (z.B. Spielplatz 1x)',
      'Ausreden werden angezeigt wenn Limit erreicht',
      'Neues Freunde-System mit eigenen Aktivitäten',
      'Gaming, Sport, Party, Konzert mit Freunden',
      'Eltern bezahlen Arzt- und Aktivitätskosten bis 18',
      'Nach 18 kann man ins Minus gehen',
      'Blackjack Dealer ist jetzt langsamer',
      'Casino: Zurück zum Spiel statt Hauptmenü',
      'Flappy Bird: Langsameres Fallen wie im Original',
      'Changelog wird automatisch aktualisiert',
    ],
  },
  {
    version: '0.7',
    date: '20. Januar 2025',
    title: 'Familien & Events Update',
    highlights: [
      'Flappy Bird mit 3 Leben',
      'Casino ab 16 Jahren',
      'Neue Events: Bier, Lotto, Familie',
    ],
    details: [
      'Flappy Bird: Start beim ersten Sprung, 3 Leben System',
      'Casino: Altersbeschränkung ab 16, größere Karten',
      'Flaschensammeln: 2x Flaschen in letzten 10 Sekunden',
      'Neues Event: Erstes Bier (Eltern/Freunde/Nein)',
      'Neues Event: Lotto spielen (1% auf €10.000)',
      'Neues Event: Familienausflüge und Kino',
    ],
  },
  {
    version: '0.6',
    date: '19. Januar 2025',
    title: 'Beziehungen & Tests',
    highlights: [
      'Beziehungssystem mit Partner & Kindern',
      'Timer für Schultests',
      'Verbesserte Sounds',
    ],
    details: [
      'Partner suchen, heiraten, scheiden lassen',
      'Kinder bekommen und aufziehen',
      'Mathe, Deutsch, Englisch Tests mit 10s Timer',
      'Countdown-Balken bei Tests',
      'Sound-Effekte für Timer',
      'Kompatibilitäts-System für Partner',
    ],
  },
  {
    version: '0.5',
    date: '18. Januar 2025',
    title: 'Jobs & Kriminalität',
    highlights: [
      'Vollständiges Job-System',
      'Kriminalität ab 18',
      'StatusBar mit Nebenjobs',
    ],
    details: [
      'Job-Bewerbungssystem mit Anforderungen',
      'Beförderungen und Kündigungen',
      'Kriminelle Aktivitäten: Taschendiebstahl, Bankraub, etc.',
      'Gefängnissystem mit Haftstrafen',
      'Nebenjobs: Zeitung austragen, Babysitten',
      'StatusBar zeigt aktuellen Job/Schule',
    ],
  },
  {
    version: '0.4',
    date: '17. Januar 2025',
    title: 'Minigames Expansion',
    highlights: [
      'Space Shooter Minigame',
      'Flaschensammeln Minigame',
      'Highscore-System',
    ],
    details: [
      'Space Shooter: Arcade-Shooter mit Wellen',
      'Flaschensammeln: €0,25 pro Flasche',
      'Lokale Highscore-Speicherung',
      'Sequence Game: Merkspiel',
      'Verbessertes Memory-Spiel',
    ],
  },
  {
    version: '0.3',
    date: '16. Januar 2025',
    title: 'Sound & Design',
    highlights: [
      'Vollständiges Sound-System',
      'Cyberpunk Matrix Design',
      'Event-Sounds',
    ],
    details: [
      'SoundManager mit Web Audio API',
      '20+ verschiedene Soundeffekte',
      'Hintergrundmusik',
      'Lautstärke-Steuerung',
      'Glassmorphism UI-Effekte',
      'Neon-Akzente und Animationen',
    ],
  },
  {
    version: '0.2',
    date: '15. Januar 2025',
    title: 'Database & Events',
    highlights: [
      'Datenbank-Integration',
      'Admin Panel',
      '60+ Events',
    ],
    details: [
      'Supabase Datenbank-Anbindung',
      'Admin Panel (Code: 6911)',
      'Event-Editor und Verwaltung',
      'Dynamische Event-Ladung',
      'Event-Kategorien: Schule, Job, Gesundheit, etc.',
    ],
  },
  {
    version: '0.1',
    date: '14. Januar 2025',
    title: 'Erste Version',
    highlights: [
      'Grundlegendes Spielsystem',
      'Stats-System',
      'Erste Minigames',
    ],
    details: [
      'Jahr-für-Jahr Spielfortschritt',
      'Stats: IQ, Gesundheit, Fitness, Aussehen, Glück',
      'Flappy Bird Minigame',
      'Snake Minigame',
      'Memory Minigame',
      'Puzzle Minigame',
      'Speichern und Laden',
    ],
  },
];

const ChangelogModal = () => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const toggleExpand = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
        >
          <Book className="mr-2 h-5 w-5" /> Updates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-primary/30 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Book className="h-6 w-6" />
            Update-Verlauf
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {changelog.map((entry, index) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-background/50 rounded-lg border border-primary/20 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => toggleExpand(entry.version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-primary border-primary/50">
                        v{entry.version}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                    {expandedVersion === entry.version ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <h3 className="font-display text-lg text-foreground mb-2">{entry.title}</h3>
                  
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entry.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedVersion === entry.version && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-primary/10">
                        <h4 className="text-xs font-medium text-primary mb-2">Alle Änderungen:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {entry.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-success mt-1">✓</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-primary/10">
          Aktuelle Version: v{changelog[0].version}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogModal;
