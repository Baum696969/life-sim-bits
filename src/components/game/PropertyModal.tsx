import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Building, ShoppingCart, DollarSign, TrendingUp, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property, PropertyState, availableProperties, propertyTypeLabels, propertyTypeEmojis } from '@/types/property';
import { soundManager } from '@/lib/soundManager';
import { toast } from 'sonner';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  propertyState: PropertyState;
  onBuyProperty: (property: Property) => void;
  onRentProperty: (property: Property) => void;
  onSellProperty: (propertyId: string) => void;
  onStopRenting: () => void;
}

const PropertyModal = ({
  isOpen,
  onClose,
  playerMoney,
  propertyState,
  onBuyProperty,
  onRentProperty,
  onSellProperty,
  onStopRenting
}: PropertyModalProps) => {
  const [selectedTab, setSelectedTab] = useState('browse');
  const [selectedType, setSelectedType] = useState<'all' | 'apartment' | 'house' | 'villa' | 'mansion'>('all');

  const filteredProperties = availableProperties.filter(p => {
    // Don't show properties already owned
    if (propertyState.ownedProperties.some(op => op.id === p.id)) return false;
    // Filter by type
    if (selectedType !== 'all' && p.type !== selectedType) return false;
    return true;
  });

  const handleBuy = (property: Property) => {
    if (playerMoney < property.purchasePrice) {
      toast.error('Nicht genug Geld!');
      return;
    }
    soundManager.playCoins();
    onBuyProperty(property);
    toast.success(`${property.name} gekauft!`);
  };

  const handleRent = (property: Property) => {
    soundManager.playClick();
    onRentProperty(property);
    toast.success(`${property.name} gemietet!`);
  };

  const handleSell = (property: Property) => {
    soundManager.playCoins();
    onSellProperty(property.id);
    toast.success(`${property.name} verkauft!`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `€${(price / 1000).toFixed(0)}K`;
    return `€${price}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-amber-500/30 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber-400 flex items-center gap-2">
            <Home className="h-5 w-5" />
            Immobilien
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" /> Kaufen/Mieten
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex items-center gap-1">
              <Key className="h-4 w-4" /> Meine Immobilien
            </TabsTrigger>
          </TabsList>

          {/* Browse Properties */}
          <TabsContent value="browse" className="space-y-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedType === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType('all')}
              >
                Alle
              </Badge>
              {(['apartment', 'house', 'villa', 'mansion'] as const).map(type => (
                <Badge 
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type)}
                >
                  {propertyTypeEmojis[type]} {propertyTypeLabels[type]}
                </Badge>
              ))}
            </div>

            {/* Current Housing Status */}
            <Card className="bg-background/30 border-muted">
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Aktuell:</strong> {
                    propertyState.currentHome 
                      ? `${propertyState.currentHome.name} (${propertyState.currentHome.owned ? 'Eigentum' : 'Miete'})`
                      : propertyState.rentedProperty
                        ? `${propertyState.rentedProperty.name} (Miete: €${propertyState.rentedProperty.monthlyRent}/Monat)`
                        : 'Bei den Eltern'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Property List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredProperties.map(property => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-background/50 border-amber-500/20 hover:border-amber-500/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{propertyTypeEmojis[property.type]}</span>
                            <div>
                              <p className="font-medium text-sm">{property.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {propertyTypeLabels[property.type]}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(property.purchasePrice)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              €{property.monthlyRent}/M
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              +{property.appreciation}%/Jahr
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs bg-amber-600 hover:bg-amber-700"
                            disabled={playerMoney < property.purchasePrice}
                            onClick={() => handleBuy(property)}
                          >
                            Kaufen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleRent(property)}
                          >
                            Mieten
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Owned Properties */}
          <TabsContent value="owned" className="space-y-4">
            {propertyState.ownedProperties.length === 0 && !propertyState.rentedProperty ? (
              <Card className="bg-background/50 border-muted">
                <CardContent className="p-4 text-center text-muted-foreground">
                  Du besitzt noch keine Immobilien.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Rented Property */}
                {propertyState.rentedProperty && (
                  <Card className="bg-background/50 border-blue-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{propertyTypeEmojis[propertyState.rentedProperty.type]}</span>
                          <div>
                            <p className="font-medium">{propertyState.rentedProperty.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Miete: €{propertyState.rentedProperty.monthlyRent}/Monat
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Gemietet</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={onStopRenting}
                      >
                        Kündigen
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Owned Properties */}
                {propertyState.ownedProperties.map(property => (
                  <Card key={property.id} className="bg-background/50 border-amber-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{propertyTypeEmojis[property.type]}</span>
                          <div>
                            <p className="font-medium">{property.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Wert: {formatPrice(property.purchasePrice)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">Eigentum</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleSell(property)}
                      >
                        Verkaufen ({formatPrice(Math.floor(property.purchasePrice * 0.9))})
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Total Value */}
                {propertyState.ownedProperties.length > 0 && (
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-3 text-center">
                      <p className="text-sm text-muted-foreground">Gesamtwert Immobilien</p>
                      <p className="text-xl font-bold text-amber-400">
                        {formatPrice(propertyState.ownedProperties.reduce((sum, p) => sum + p.purchasePrice, 0))}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
