import { Player } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvailableJobs, JobEligibility, getAllJobs } from '@/lib/jobSystem';
import { Briefcase, Check, X, AlertTriangle, Lock } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onApply: (jobId: string) => void;
  onQuit: () => void;
}

const JobModal = ({ isOpen, onClose, player, onApply, onQuit }: JobModalProps) => {
  const jobEligibilities = getAvailableJobs(player);
  
  // Sort: eligible first, then by salary
  const sortedJobs = [...jobEligibilities].sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.job.salary - a.job.salary;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Jobsuche
          </DialogTitle>
        </DialogHeader>

        {/* Current Job */}
        {player.job && (
          <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktueller Job</p>
                <p className="font-display text-lg text-primary">{player.job.title}</p>
                <p className="text-success">€{player.job.salary.toLocaleString()}/Jahr</p>
              </div>
              <Button
                variant="destructive"
                onClick={onQuit}
                className="bg-destructive/80 hover:bg-destructive"
              >
                Kündigen
              </Button>
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-3">
          {sortedJobs.map((eligibility) => (
            <JobCard
              key={eligibility.job.id}
              eligibility={eligibility}
              isCurrentJob={player.job?.id === eligibility.job.id}
              onApply={() => onApply(eligibility.job.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const JobCard = ({ 
  eligibility, 
  isCurrentJob, 
  onApply 
}: { 
  eligibility: JobEligibility; 
  isCurrentJob: boolean; 
  onApply: () => void;
}) => {
  const { job, eligible, missingRequirements, blockedByPrison } = eligibility;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-all ${
        isCurrentJob
          ? 'border-primary bg-primary/5'
          : eligible
            ? 'border-primary/30 bg-card hover:border-primary/50'
            : 'border-muted bg-muted/20 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg">{job.title}</h3>
            {isCurrentJob && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                Aktuell
              </span>
            )}
            {blockedByPrison && (
              <Lock className="h-4 w-4 text-destructive" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{job.description}</p>
          <p className="text-success font-medium mt-1">€{job.salary.toLocaleString()}/Jahr</p>
          
          {/* Requirements */}
          {!eligible && missingRequirements.length > 0 && (
            <div className="mt-2 space-y-1">
              {missingRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-destructive">
                  <X className="h-3 w-3" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {isCurrentJob ? (
            <Check className="h-6 w-6 text-primary" />
          ) : eligible ? (
            <Button
              onClick={onApply}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Bewerben
            </Button>
          ) : (
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobModal;
