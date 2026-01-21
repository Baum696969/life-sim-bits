import { Player } from '@/types/game';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, DollarSign, Newspaper, Baby, Lock, Heart, Dices, Skull, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface StatusBarProps {
  player: Player;
  onToggleNewspaperJob: () => void;
  onToggleBabysitterJob: () => void;
  hasBabysitterJob: boolean;
  onOpenRelationships?: () => void;
  onOpenCrime?: () => void;
  onOpenCasino?: () => void;
  onOpenProperty?: () => void;
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

const getLifePhase = (age: number): { label: string; emoji: string; color: string } => {
  if (age <= 3) return { label: 'Baby', emoji: '👶', color: 'text-pink-400' };
  if (age <= 5) return { label: 'Kleinkind', emoji: '💒', color: 'text-pink-300' };
  if (age <= 12) return { label: 'Kind', emoji: '💑', color: 'text-blue-400' };
  if (age <= 17) return { label: 'Teenager', emoji: '🧑', color: 'text-purple-400' };
  if (age <= 25) return { label: 'Junger Erwachsener', emoji: '🧑‍🎓', color: 'text-green-400' };
  if (age <= 40) return { label: 'Erwachsener', emoji: '🧔', color: 'text-yellow-400' };
  if (age <= 60) return { label: 'Mittleres Alter', emoji: '🧑‍💼', color: 'text-orange-400' };
  if (age <= 75) return { label: 'Senior', emoji: '🧓', color: 'text-gray-400' };
  return { label: 'Hohes Alter', emoji: '👴', color: 'text-gray-300' };
};

interface FeatureButtonProps {
  label: string;
  icon: React.ReactNode;
  requiredAge: number;
  currentAge: number;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline';
  activeClass?: string;
  isMobile?: boolean;
}

const FeatureButton = ({ label, icon, requiredAge, currentAge, onClick, variant = 'outline', activeClass, isMobile }: FeatureButtonProps) => {
  const isLocked = currentAge < requiredAge;
  
  // Mobile: Icon-only circular buttons
  if (isMobile) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={isLocked ? undefined : onClick}
              disabled={isLocked}
              className={`
                relative h-11 w-11 rounded-full flex items-center justify-center
                border transition-all active:scale-95
                ${isLocked 
                  ? 'opacity-40 bg-muted/50 border-muted cursor-not-allowed' 
                  : activeClass || 'bg-muted/50 border-primary/30 hover:bg-primary/20'}
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {icon}
              {isLocked && (
                <Lock className="h-2.5 w-2.5 absolute -bottom-0.5 -right-0.5 text-muted-foreground bg-background rounded-full p-0.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>{label} {isLocked && `(ab ${requiredAge})`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Desktop: Full buttons
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={variant}
              size="sm"
              onClick={isLocked ? undefined : onClick}
              disabled={isLocked}
              className={`text-xs h-8 px-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : activeClass || 'border-primary/50 hover:bg-primary/20'}`}
            >
              {icon}
              <span className="ml-1">{label}</span>
              {isLocked && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
            </Button>
          </div>
        </TooltipTrigger>
        {isLocked && (
          <TooltipContent>
            <p>Ab {requiredAge} Jahren verfügbar</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const StatusBar = ({ 
  player, 
  onToggleNewspaperJob, 
  onToggleBabysitterJob, 
  hasBabysitterJob,
  onOpenRelationships,
  onOpenCrime,
  onOpenCasino,
  onOpenProperty
}: StatusBarProps) => {
  const isMobile = useIsMobile();
  const isStudent = player.age >= 6 && player.age <= 16 + player.extraSchoolYears;
  const schoolGrade = getSchoolGrade(player.age, player.extraSchoolYears);
  const canHaveNewspaperJob = player.age >= 13 && isStudent;
  const canHaveBabysitterJob = player.age >= 14 && isStudent;
  const lifePhase = getLifePhase(player.age);

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

  // Mobile Layout
  if (isMobile) {
    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-md border-t border-primary/30 z-40 safe-area-bottom"
      >
        {/* Top row: Life phase + Status */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-primary/10">
          {/* Life Phase */}
          <div className={`flex items-center gap-2 ${lifePhase.color}`}>
            <span className="text-2xl">{lifePhase.emoji}</span>
            <div>
              <p className="text-sm font-semibold leading-tight">{lifePhase.label}</p>
              <p className="text-xs text-muted-foreground">{player.age} Jahre</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="text-right">
            {player.inPrison ? (
              <div className="text-destructive">
                <p className="text-sm font-medium">🔒 Gefängnis</p>
                <p className="text-xs">{player.prisonYearsRemaining}J übrig</p>
              </div>
            ) : isStudent ? (
              <div>
                <p className="text-sm font-medium text-blue-400">📚 Schüler</p>
                <p className="text-xs text-muted-foreground">{schoolGrade}</p>
              </div>
            ) : player.job ? (
              <div>
                <p className="text-sm font-medium text-primary truncate max-w-[120px]">{player.job.title}</p>
                <p className="text-xs text-success">€{player.job.salary.toLocaleString()}/J</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Arbeitslos</p>
            )}
          </div>
        </div>

        {/* Bottom row: Feature buttons - horizontal scroll */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <FeatureButton
              label="Familie"
              icon={<Users className="h-4 w-4" />}
              requiredAge={0}
              currentAge={player.age}
              onClick={onOpenRelationships}
              activeClass="bg-pink-500/20 border-pink-500/50"
              isMobile
            />

            <FeatureButton
              label="Partner"
              icon={<Heart className="h-4 w-4" />}
              requiredAge={16}
              currentAge={player.age}
              onClick={onOpenRelationships}
              activeClass="bg-pink-500/20 border-pink-500/50"
              isMobile
            />

            <FeatureButton
              label="Verbrechen"
              icon={<Skull className="h-4 w-4" />}
              requiredAge={14}
              currentAge={player.age}
              onClick={onOpenCrime}
              activeClass="bg-red-500/20 border-red-500/50"
              isMobile
            />

            <FeatureButton
              label="Casino"
              icon={<Dices className="h-4 w-4" />}
              requiredAge={16}
              currentAge={player.age}
              onClick={onOpenCasino}
              activeClass="bg-yellow-500/20 border-yellow-500/50"
              isMobile
            />

            <FeatureButton
              label="Immobilien"
              icon={<Home className="h-4 w-4" />}
              requiredAge={18}
              currentAge={player.age}
              onClick={onOpenProperty}
              activeClass="bg-amber-500/20 border-amber-500/50"
              isMobile
            />

            {/* Side Jobs */}
            {isStudent && (
              <>
                <button
                  onClick={player.age >= 13 ? onToggleNewspaperJob : undefined}
                  disabled={player.age < 13}
                  className={`
                    h-11 w-11 rounded-full flex items-center justify-center border transition-all active:scale-95
                    ${player.age < 13 
                      ? 'opacity-40 bg-muted/50 border-muted cursor-not-allowed'
                      : player.hasNewspaperJob 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/50 border-primary/30'}
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Newspaper className="h-4 w-4" />
                </button>

                <button
                  onClick={player.age >= 14 ? onToggleBabysitterJob : undefined}
                  disabled={player.age < 14}
                  className={`
                    h-11 w-11 rounded-full flex items-center justify-center border transition-all active:scale-95
                    ${player.age < 14 
                      ? 'opacity-40 bg-muted/50 border-muted cursor-not-allowed'
                      : hasBabysitterJob 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/50 border-primary/30'}
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Baby className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Income indicator */}
            {yearlyIncome > 0 && (
              <div className="flex items-center gap-1 px-3 py-2 bg-success/20 rounded-full text-success shrink-0">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">€{yearlyIncome.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop Layout (original)
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-primary/30 p-2 md:p-3 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Life Phase Badge */}
        <div className={`flex items-center gap-2 ${lifePhase.color}`}>
          <span className="text-xl">{lifePhase.emoji}</span>
          <div>
            <p className="text-sm font-medium">{lifePhase.label}</p>
            <p className="text-xs text-muted-foreground">{player.age} Jahre</p>
          </div>
        </div>

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
                <p className="text-sm font-medium truncate max-w-[100px] md:max-w-none">{player.job.title}</p>
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
          <div className="flex items-center gap-1 text-success">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">€{yearlyIncome.toLocaleString()}/J</span>
          </div>
        )}

        {/* Feature Buttons with Age Locks */}
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          <FeatureButton
            label="Familie"
            icon={<Users className="h-3 w-3" />}
            requiredAge={0}
            currentAge={player.age}
            onClick={onOpenRelationships}
            activeClass="border-pink-500/50 hover:bg-pink-500/20"
          />

          <FeatureButton
            label="Partner"
            icon={<Heart className="h-3 w-3" />}
            requiredAge={16}
            currentAge={player.age}
            onClick={onOpenRelationships}
            activeClass="border-pink-500/50 hover:bg-pink-500/20"
          />

          <FeatureButton
            label="Verbrechen"
            icon={<Skull className="h-3 w-3" />}
            requiredAge={14}
            currentAge={player.age}
            onClick={onOpenCrime}
            activeClass="border-red-500/50 hover:bg-red-500/20"
          />

          <FeatureButton
            label="Casino"
            icon={<Dices className="h-3 w-3" />}
            requiredAge={16}
            currentAge={player.age}
            onClick={onOpenCasino}
            activeClass="border-yellow-500/50 hover:bg-yellow-500/20"
          />

          <FeatureButton
            label="Immobilien"
            icon={<Home className="h-3 w-3" />}
            requiredAge={18}
            currentAge={player.age}
            onClick={onOpenProperty}
            activeClass="border-amber-500/50 hover:bg-amber-500/20"
          />

          {/* Side Jobs for Students */}
          {isStudent && (
            <>
              <FeatureButton
                label="Zeitung"
                icon={<Newspaper className="h-3 w-3" />}
                requiredAge={13}
                currentAge={player.age}
                onClick={onToggleNewspaperJob}
                activeClass={player.hasNewspaperJob ? 'bg-primary text-primary-foreground' : 'border-primary/50'}
              />
              
              <FeatureButton
                label="Babysitter"
                icon={<Baby className="h-3 w-3" />}
                requiredAge={14}
                currentAge={player.age}
                onClick={onToggleBabysitterJob}
                activeClass={hasBabysitterJob ? 'bg-primary text-primary-foreground' : 'border-primary/50'}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBar;
