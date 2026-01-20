import { Player } from '@/types/game';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, DollarSign, Newspaper, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sideJobs } from '@/lib/jobSystem';

interface StatusBarProps {
  player: Player;
  onToggleNewspaperJob: () => void;
  onToggleBabysitterJob: () => void;
  hasBabysitterJob: boolean;
}

const getSchoolGrade = (age: number, extraYears: number): string => {
  if (age < 6) return 'Vorschule';
  const yearsInSchool = age - 5;
  const totalSchoolYears = 10 + extraYears;
  
  if (yearsInSchool > totalSchoolYears) return '';
  
  if (yearsInSchool <= 4) return `Klasse ${yearsInSchool}`;
  if (yearsInSchool <= 10) return `Klasse ${yearsInSchool}`;
  if (yearsInSchool <= 12) return `Oberstufe ${yearsInSchool - 10}`;
  return '';
};

const StatusBar = ({ player, onToggleNewspaperJob, onToggleBabysitterJob, hasBabysitterJob }: StatusBarProps) => {
  const isStudent = player.age >= 6 && player.age <= 16 + player.extraSchoolYears;
  const schoolGrade = getSchoolGrade(player.age, player.extraSchoolYears);
  const canHaveNewspaperJob = player.age >= 13 && isStudent;
  const canHaveBabysitterJob = player.age >= 14 && isStudent;

  // Calculate yearly income
  let yearlyIncome = 0;
  if (player.job && !player.inPrison) {
    yearlyIncome += player.job.salary;
  }
  if (player.hasNewspaperJob) {
    yearlyIncome += 50;
  }
  if (hasBabysitterJob) {
    yearlyIncome += 80;
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-primary/30 p-2 md:p-3 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Status (Student/Job) */}
        <div className="flex items-center gap-2 min-w-0">
          {player.inPrison ? (
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm font-medium">Im Gefängnis</p>
                <p className="text-xs text-muted-foreground">
                  Noch {player.prisonYearsRemaining} Jahre
                </p>
              </div>
            </div>
          ) : isStudent ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">Schüler/in</p>
                <p className="text-xs text-muted-foreground">{schoolGrade}</p>
              </div>
            </div>
          ) : player.job ? (
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[120px] md:max-w-none">{player.job.title}</p>
                <p className="text-xs text-success">€{player.job.salary.toLocaleString()}/Jahr</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p className="text-sm">Arbeitslos</p>
            </div>
          )}
        </div>

        {/* Yearly Income */}
        {yearlyIncome > 0 && (
          <div className="flex items-center gap-2 text-success">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">€{yearlyIncome.toLocaleString()}/Jahr</span>
          </div>
        )}

        {/* Side Jobs (only for students) */}
        {isStudent && player.age >= 13 && (
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs text-muted-foreground hidden md:inline">Nebenjobs:</span>
            
            {canHaveNewspaperJob && (
              <Button
                variant={player.hasNewspaperJob ? "default" : "outline"}
                size="sm"
                onClick={onToggleNewspaperJob}
                className={`text-xs h-7 px-2 ${player.hasNewspaperJob ? 'bg-primary' : 'border-primary/50'}`}
              >
                <Newspaper className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Zeitung</span>
                <span className="sm:hidden">📰</span>
                {player.hasNewspaperJob && <span className="ml-1 text-success">+€50</span>}
              </Button>
            )}
            
            {canHaveBabysitterJob && (
              <Button
                variant={hasBabysitterJob ? "default" : "outline"}
                size="sm"
                onClick={onToggleBabysitterJob}
                className={`text-xs h-7 px-2 ${hasBabysitterJob ? 'bg-primary' : 'border-primary/50'}`}
              >
                <Baby className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Babysitter</span>
                <span className="sm:hidden">👶</span>
                {hasBabysitterJob && <span className="ml-1 text-success">+€80</span>}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatusBar;
