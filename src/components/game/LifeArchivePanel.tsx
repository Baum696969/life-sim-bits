import { motion, AnimatePresence } from 'framer-motion';
import { getLifeArchive, getEducationLabel, clearLifeArchive } from '@/lib/lifeArchive';
import { LifeRecord } from '@/types/game';
import { formatMoney } from '@/lib/gameUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skull, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const LifeArchivePanel = () => {
  const [expanded, setExpanded] = useState(false);
  const archive = getLifeArchive();

  if (archive.length === 0) return null;

  const handleClear = () => {
    clearLifeArchive();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto mt-6"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 border border-primary/20 rounded-lg text-sm"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Skull className="h-4 w-4" />
          Vergangene Leben ({archive.length})
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-60 mt-2">
              <div className="space-y-2 px-1">
                {archive.map((life: LifeRecord) => (
                  <div
                    key={life.id}
                    className="bg-card/40 border border-primary/10 rounded-lg p-3 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-sm text-primary truncate">
                        {life.playerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        † {life.ageAtDeath}J
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{formatMoney(life.finalMoney)}</span>
                      <span>{getEducationLabel(life.education)}</span>
                      {life.job && <span>{life.job}</span>}
                    </div>
                    <p className="text-xs text-destructive/70 mt-1 truncate">
                      {life.causeOfDeath}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full mt-2 text-xs text-destructive/60 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Archiv löschen
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LifeArchivePanel;
