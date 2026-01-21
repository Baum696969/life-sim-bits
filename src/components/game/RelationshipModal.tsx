import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, Users, Baby, CircleDot, HeartCrack, Sparkles, Home, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Partner, Child, RelationshipState, FamilyMember, FamilyActivity, personalityDescriptions, familyActivities } from '@/types/relationship';
import { generatePartnerOptions, canMarry, canHaveChildren, getAvailableActivities, doFamilyActivity } from '@/lib/relationshipSystem';
import { Player } from '@/types/game';
import { soundManager } from '@/lib/soundManager';
import { toast } from 'sonner';

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
  onFamilyActivity?: (memberId: string, activity: FamilyActivity) => void;
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
  onTryForChild,
  onFamilyActivity
}: RelationshipModalProps) => {
  const [view, setView] = useState<'main' | 'search'>('main');
  const [partnerOptions, setPartnerOptions] = useState<Partner[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null);

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

  const handleActivity = (member: FamilyMember, activity: FamilyActivity) => {
    if (player.money < activity.cost) {
      toast.error(`Nicht genug Geld! Du brauchst €${activity.cost}`);
      return;
    }
    soundManager.playClick();
    if (onFamilyActivity) {
      onFamilyActivity(member.id, activity);
    }
    toast.success(`${activity.emoji} ${activity.name} mit ${member.name}! +${activity.effects.relationshipBonus} Beziehung`);
    setSelectedFamilyMember(null);
  };

  const { partner, children, family } = relationshipState;
  const availableActivities = getAvailableActivities(player.age);

  const renderFamilyMember = (member: FamilyMember, roleLabel: string) => (
    <Card 
      key={member.id} 
      className={`bg-background/50 border-blue-500/30 ${!member.isAlive ? 'opacity-60' : 'cursor-pointer hover:border-blue-500/60'}`}
      onClick={() => member.isAlive && setSelectedFamilyMember(member)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {member.gender === 'female' 
                ? (member.role === 'mother' ? '👩' : '👧') 
                : (member.role === 'father' ? '👨' : '👦')
              }
            </span>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">
                {roleLabel} • {member.age} Jahre
                {!member.isAlive && <span className="ml-1 text-destructive">✝</span>}
              </p>
            </div>
          </div>
          {member.isAlive && (
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3 text-pink-400" />
              <Progress value={member.relationship} className="h-2 w-12" />
              <span className="text-xs text-muted-foreground">{member.relationship}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-primary/30 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Beziehungen & Familie
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="family" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="family" className="flex items-center gap-1">
              <Home className="h-4 w-4" /> Familie
            </TabsTrigger>
            <TabsTrigger value="partner" className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> Partner
            </TabsTrigger>
          </TabsList>

          {/* Family Tab */}
          <TabsContent value="family" className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedFamilyMember ? (
                <motion.div
                  key="activity-select"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Aktivität mit {selectedFamilyMember.name}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFamilyMember(null)}>
                      Zurück
                    </Button>
                  </div>
                  
                  <div className="grid gap-2">
                    {availableActivities.map(activity => (
                      <Card 
                        key={activity.id}
                        className="bg-background/50 border-primary/20 hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => handleActivity(selectedFamilyMember, activity)}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{activity.emoji}</span>
                            <div>
                              <p className="font-medium">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={activity.cost > 0 ? "secondary" : "outline"}>
                              {activity.cost > 0 ? `€${activity.cost}` : 'Gratis'}
                            </Badge>
                            <p className="text-xs text-success mt-1">+{activity.effects.relationshipBonus} ❤️</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="family-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {family ? (
                    <>
                      {/* Parents */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Eltern</h3>
                        <div className="grid gap-2">
                          {renderFamilyMember(family.mother, 'Mutter')}
                          {renderFamilyMember(family.father, 'Vater')}
                        </div>
                      </div>

                      {/* Siblings */}
                      {family.siblings.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Geschwister ({family.siblings.length})
                          </h3>
                          <div className="grid gap-2">
                            {family.siblings.map(sibling => 
                              renderFamilyMember(sibling, sibling.age > player.age ? 'Älteres Geschwister' : 'Jüngeres Geschwister')
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground text-center">
                        Klicke auf ein Familienmitglied für gemeinsame Aktivitäten
                      </p>
                    </>
                  ) : (
                    <Card className="bg-background/50 border-muted">
                      <CardContent className="p-4 text-center text-muted-foreground">
                        Keine Familiendaten verfügbar
                      </CardContent>
                    </Card>
                  )}

                  {/* Own Children */}
                  {children.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Baby className="h-4 w-4" /> Deine Kinder ({children.length})
                      </h3>
                      <div className="grid gap-2">
                        {children.map(child => (
                          <Card key={child.id} className="bg-background/50 border-blue-500/30">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{child.gender === 'male' ? '👦' : '👧'}</span>
                                <div>
                                  <span className="font-medium">{child.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {child.age} Jahre
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Beziehung:</span>
                                <Progress value={child.relationship} className="h-2 w-16" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Partner Tab */}
          <TabsContent value="partner" className="space-y-4">
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
                          {player.age >= 16 ? (
                            <Button onClick={handleSearchPartner} className="bg-pink-600 hover:bg-pink-700">
                              <Search className="h-4 w-4 mr-2" /> Partner suchen
                            </Button>
                          ) : (
                            <p className="text-xs text-muted-foreground">Du musst mindestens 16 sein</p>
                          )}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipModal;