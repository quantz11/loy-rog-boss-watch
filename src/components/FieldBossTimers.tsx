
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fieldBosses, type FieldBoss } from '@/lib/field-bosses';
import { FieldBossCard } from '@/components/FieldBossCard';
import { SetTimeDialog } from './SetTimeDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const allZones = Array.from(new Set(fieldBosses.map((b) => b.zone))).sort();

export function FieldBossTimers() {
  const [editingBoss, setEditingBoss] = useState<FieldBoss | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const [favoriteZones, setFavoriteZones] = useState<string[]>([]);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);

  const sortedZones = useMemo(() => {
    return [...allZones].sort((a, b) => {
      const aIsFavorite = favoriteZones.includes(a);
      const bIsFavorite = favoriteZones.includes(b);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.localeCompare(b);
    });
  }, [favoriteZones]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteFieldZones');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteZones(parsedFavorites);
        setActiveAccordionItems(parsedFavorites.map((z: string) => `zone-${z}`));
      } else {
        setActiveAccordionItems(allZones.map(z => `zone-${z}`));
      }
    } catch (error) {
      console.error('Could not load favorites', error);
      setActiveAccordionItems(allZones.map(z => `zone-${z}`));
    }
  }, []);

  const toggleFavorite = (zone: string) => {
    let updatedFavorites: string[];
    if (favoriteZones.includes(zone)) {
      updatedFavorites = favoriteZones.filter((z) => z !== zone);
    } else {
      updatedFavorites = [...favoriteZones, zone];
    }
    setFavoriteZones(updatedFavorites);
    try {
      localStorage.setItem('favoriteFieldZones', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Could not save favorites', error);
    }
  };

  const handleOpenSetTimeDialog = useCallback((boss: FieldBoss) => {
    setEditingBoss(boss);
  }, []);

  const handleCloseSetTimeDialog = useCallback(() => {
    setEditingBoss(null);
  }, []);

  const handleManualSetTime = useCallback((time: Date) => {
    if (editingBoss && firestore) {
      const docRef = doc(firestore, 'timers', editingBoss.id);
      setDocumentNonBlocking(docRef, { bossId: editingBoss.id, defeatedTime: time }, { merge: true });
      
      toast({
        title: 'Timer Updated!',
        description: `${editingBoss.name} (CH ${editingBoss.channel}) timer was set manually.`,
      });
    }
    handleCloseSetTimeDialog();
  }, [editingBoss, firestore, toast, handleCloseSetTimeDialog]);

  return (
    <div className="space-y-8">
      <Accordion
        type="multiple"
        className="w-full space-y-4"
        value={activeAccordionItems}
        onValueChange={setActiveAccordionItems}
      >
        {sortedZones.map((zone) => {
          const zoneBosses = fieldBosses.filter((b) => b.zone === zone);
          const isFavorite = favoriteZones.includes(zone);

          return (
            <AccordionItem value={`zone-${zone}`} key={zone} className="border-none">
              <div className="flex items-center w-full bg-card/40 rounded-t-xl px-4 border border-b-0 border-primary/10">
                <AccordionTrigger className="flex-grow hover:no-underline py-4">
                  <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    {zone}
                    <span className="text-xs font-normal text-muted-foreground bg-primary/5 px-2 py-0.5 rounded-full">
                      {zoneBosses.length / 2} Unique Bosses
                    </span>
                  </h2>
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 hover:bg-transparent flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(zone);
                  }}
                >
                  <Star
                    className={cn(
                      'h-5 w-5 text-yellow-500 transition-all',
                      isFavorite ? 'fill-current' : 'fill-transparent'
                    )}
                  />
                  <span className="sr-only">Toggle Favorite</span>
                </Button>
              </div>
              <AccordionContent className="bg-card/20 p-6 rounded-b-xl border border-primary/10 border-t-0">
                <Accordion type="multiple" defaultValue={[`zone-${zone}-ch1`, `zone-${zone}-ch2`]} className="space-y-4">
                   {/* Channel 1 */}
                   <AccordionItem value={`zone-${zone}-ch1`} className="border-none bg-background/30 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-background/40">
                         <span className="font-bold text-accent text-sm">CHANNEL 1</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                            {zoneBosses.filter(b => b.channel === 1).map((boss) => (
                              <FieldBossCard
                                key={boss.id}
                                boss={boss}
                                onOpenSetTimeDialog={handleOpenSetTimeDialog}
                              />
                            ))}
                         </div>
                      </AccordionContent>
                   </AccordionItem>

                   {/* Channel 2 */}
                   <AccordionItem value={`zone-${zone}-ch2`} className="border-none bg-background/30 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-background/40">
                         <span className="font-bold text-accent text-sm">CHANNEL 2</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                            {zoneBosses.filter(b => b.channel === 2).map((boss) => (
                              <FieldBossCard
                                key={boss.id}
                                boss={boss}
                                onOpenSetTimeDialog={handleOpenSetTimeDialog}
                              />
                            ))}
                         </div>
                      </AccordionContent>
                   </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {editingBoss && (
        <SetTimeDialog
          isOpen={!!editingBoss}
          onOpenChange={(isOpen) => !isOpen && handleCloseSetTimeDialog()}
          onSetTime={handleManualSetTime}
          boss={editingBoss as any}
        />
      )}
    </div>
  );
}
