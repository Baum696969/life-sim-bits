import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Search, Users, Baby, CircleDot, HeartCrack, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Partner, Child, RelationshipState, personalityDescriptions } from '@/types/relationship';
import { generatePartnerOptions, canMarry, canHaveChildren } from '@/lib/relationshipSystem';
import { Player } from '@/types/game';
import { soundManager } from '@/lib/soundManager';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  relationshipState: RelationshipState;
  onFindPartner: (partner: Partner) => void;
  onBreakup: () => void;
  onMarry: () => void;
  onDivorce: () => void;
  onTryForChild: () => void;
}

const RelationshipModal = ({
  isOpen,
  onClose,
  player,
  relationshipState,
  onFindPartner,
  onBreakup,
  onMarry,
  onDivorce,
  onTryForChild
}: RelationshipModalProps) => {
  const [view, setView] = useState<'main' | 'search'>('main');
  const [partnerOptions, setPartnerOptions] = useState<Partner[]>([]);

  const handleSearchPartner = () => {
    soundManager.playClick();
    const options = generatePartnerOptions(player.age, player.stats.looks, 3);
    setPartnerOptions(options);
    setView('search');
  };

  const handleSelectPartner = (partner: Partner) => {
    soundManager.playMatch();
    onFindPartner(partner);
    setView('main');
    setPartnerOptions([]);
  };

  const { partner, children } = relationshipState;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-primary/30 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Beziehungen
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {view === 'main' ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Current Partner Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Aktueller Partner
                </h3>
                
                {partner ? (
                  <Card className="bg-background/50 border-pink-500/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-lg text-foreground">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {partner.age} Jahre alt • {personalityDescriptions[partner.personality]}
                          </p>
                        </div>
                        <Badge variant={partner.relationshipStatus === 'married' ? 'default' : 'secondary'}>
                          {partner.relationshipStatus === 'married' ? '💍 Verheiratet' : '💑 Zusammen'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Kompatibilität</span>
                          <span>{partner.compatibility}%</span>
                        </div>
                        <Progress value={partner.compatibility} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Aussehen: {partner.looks}/100</span>
                        <span>{partner.yearsTogethere} Jahre zusammen</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground italic">
                        "{partner.meetingStory}"
                      </p>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        {partner.relationshipStatus === 'dating' && (
                          <>
                            {canMarry(partner) && (
                              <Button 
                                size="sm" 
                                className="bg-pink-600 hover:bg-pink-700"
                                onClick={() => { soundManager.playClick(); onMarry(); }}
                              >
                                <CircleDot className="h-4 w-4 mr-1" /> Heiraten
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => { soundManager.playClick(); onBreakup(); }}
                            >
                              <HeartCrack className="h-4 w-4 mr-1" /> Trennen
                            </Button>
                          </>
                        )}
                        
                        {partner.relationshipStatus === 'married' && (
                          <>
                            {canHaveChildren(partner, player.age) && (
                              <Button 
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => { soundManager.playClick(); onTryForChild(); }}
                              >
                                <Baby className="h-4 w-4 mr-1" /> Kind versuchen
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => { soundManager.playClick(); onDivorce(); }}
                            >
                              <HeartCrack className="h-4 w-4 mr-1" /> Scheidung
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-background/50 border-muted">
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground mb-3">Du bist momentan Single</p>
                      {player.age >= 16 && (
                        <Button onClick={handleSearchPartner} className="bg-pink-600 hover:bg-pink-700">
                          <Search className="h-4 w-4 mr-2" /> Partner suchen
                        </Button>
                      )}
                      {player.age < 16 && (
                        <p className="text-xs text-muted-foreground">Du musst mindestens 16 sein</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Children Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Kinder ({children.length})
                </h3>
                
                {children.length > 0 ? (
                  <div className="grid gap-2">
                    {children.map(child => (
                      <Card key={child.id} className="bg-background/50 border-blue-500/30">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-medium">{child.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {child.gender === 'male' ? '👦' : '👧'} {child.age} Jahre
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Beziehung:</span>
                            <Progress value={child.relationship} className="h-2 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-background/50 border-muted">
                    <CardContent className="p-3 text-center text-muted-foreground text-sm">
                      Keine Kinder
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="bg-background/30 p-2 rounded">
                  <span>Hochzeiten: {relationshipState.totalMarriages}</span>
                </div>
                <div className="bg-background/30 p-2 rounded">
                  <span>Scheidungen: {relationshipState.totalDivorces}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Potentielle Partner gefunden</h3>
                <Button variant="ghost" size="sm" onClick={() => setView('main')}>
                  Zurück
                </Button>
              </div>
              
              <div className="space-y-3">
                {partnerOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-background/50 border-pink-500/20 hover:border-pink-500/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectPartner(option)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-display text-lg flex items-center gap-2">
                              {option.name}
                              {option.compatibility >= 80 && <Sparkles className="h-4 w-4 text-yellow-500" />}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {option.age} Jahre • {personalityDescriptions[option.personality]}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-pink-500">{option.compatibility}%</div>
                            <div className="text-xs text-muted-foreground">Kompatibilität</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Aussehen: {option.looks}/100</div>
                          <div className="text-muted-foreground italic">"{option.meetingStory}"</div>
                        </div>
                        
                        <Button className="w-full mt-3 bg-pink-600 hover:bg-pink-700" size="sm">
                          <Heart className="h-4 w-4 mr-2" /> Kennenlernen
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full" onClick={handleSearchPartner}>
                <Search className="h-4 w-4 mr-2" /> Neue Suche
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipModal;
