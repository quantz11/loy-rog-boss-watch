
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bosses, type Boss } from '@/lib/bosses';
import { BossCard } from '@/components/BossCard';
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

const allFloors = Array.from(new Set(bosses.map((b) => b.floor))).sort(
  (a, b) => a - b
);

export function BossTimers() {
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const [favoriteFloors, setFavoriteFloors] = useState<number[]>([]);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);

  const sortedFloors = useMemo(() => {
    return [...allFloors].sort(
        (a, b) => {
        const aIsFavorite = favoriteFloors.includes(a);
        const bIsFavorite = favoriteFloors.includes(b);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return a - b;
        }
    );
  }, [favoriteFloors]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteFloors');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteFloors(parsedFavorites);
        // Initially, open favorite floors
        setActiveAccordionItems(parsedFavorites.map((f: number) => `floor-${f}`));
      } else {
        // If no favorites, open all by default
        setActiveAccordionItems(allFloors.map(f => `floor-${f}`));
      }
    } catch (error) {
      console.error('Could not load favorites from local storage', error);
      setActiveAccordionItems(allFloors.map(f => `floor-${f}`));
    }
  }, []);
  
  useEffect(() => {
    const favoriteItems = sortedFloors.filter(f => favoriteFloors.includes(f)).map(f => `floor-${f}`);
    
    // If there are favorites, only open those by default on first load.
    // Otherwise, keep all open.
    if(favoriteFloors.length > 0) {
        setActiveAccordionItems(favoriteItems);
    } else {
        setActiveAccordionItems(allFloors.map(f => `floor-${f}`));
    }
  
  }, [favoriteFloors, sortedFloors]);

  const toggleFavorite = (floor: number) => {
    let updatedFavorites: number[];
    if (favoriteFloors.includes(floor)) {
      updatedFavorites = favoriteFloors.filter((f) => f !== floor);
    } else {
      updatedFavorites = [...favoriteFloors, floor];
    }
    setFavoriteFloors(updatedFavorites);
    try {
      localStorage.setItem('favoriteFloors', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Could not save favorites to local storage', error);
    }
  };

  const interServerBosses = bosses.filter((b) => b.type === 'inter');
  const normalBosses = bosses.filter((b) => b.type === 'normal');

  const handleOpenSetTimeDialog = useCallback((boss: Boss) => {
    setEditingBoss(boss);
  }, []);

  const handleCloseSetTimeDialog = useCallback(() => {
    setEditingBoss(null);
  }, []);

  const handleSetTimeDialogVisibility = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      handleCloseSetTimeDialog();
    }
  }, [handleCloseSetTimeDialog]);

  const handleManualSetTime = useCallback((time: Date) => {
    if (editingBoss && firestore) {
      const docRef = doc(firestore, 'timers', editingBoss.id);
      setDocumentNonBlocking(docRef, { bossId: editingBoss.id, defeatedTime: time }, { merge: true });
      
      const bossIdentifier = `[${editingBoss.type.charAt(0).toUpperCase() + editingBoss.type.slice(1)}] ${editingBoss.name} - ${editingBoss.floor}F`;

      toast({
        title: 'Timer Updated!',
        description: `${bossIdentifier} timer was set manually.`,
      });
    }
    handleCloseSetTimeDialog();
  }, [editingBoss, firestore, toast, handleCloseSetTimeDialog]);

  const renderFloorGroup = (floor: number, bossList: Boss[]) => {
    const floorBosses = bossList.filter((b) => b.floor === floor);
    if (floorBosses.length === 0) return null;

    const isFavorite = favoriteFloors.includes(floor);

    return (
      <AccordionItem value={`floor-${floor}`} key={floor}>
        <div className="flex items-center w-full">
          <AccordionTrigger className="flex-grow">
            <h2 className="text-2xl font-headline font-semibold text-primary">
              Folkvang - {floor}F
            </h2>
          </AccordionTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 hover:bg-transparent flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion from toggling if inside trigger
              toggleFavorite(floor);
            }}
          >
            <Star
              className={cn(
                'h-6 w-6 text-yellow-500 transition-all',
                isFavorite ? 'fill-current' : 'fill-transparent'
              )}
            />
            <span className="sr-only">Toggle Favorite</span>
          </Button>
        </div>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {floorBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                onOpenSetTimeDialog={handleOpenSetTimeDialog}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const createAccordionForBossType = (bossList: Boss[], type: string) => (
    <Accordion
      type="multiple"
      className="w-full space-y-4"
      value={activeAccordionItems}
      onValueChange={setActiveAccordionItems}
    >
      {sortedFloors.map((floor) => renderFloorGroup(floor, bossList))}
    </Accordion>
  );

  return (
    <>
      <Tabs defaultValue="inter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="inter" className="text-base">
            Inter-Server (2h)
          </TabsTrigger>
          <TabsTrigger value="normal" className="text-base">
            Normal (8h)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inter" className="mt-6">
          {createAccordionForBossType(interServerBosses, 'inter')}
        </TabsContent>
        <TabsContent value="normal" className="mt-6">
          {createAccordionForBossType(normalBosses, 'normal')}
        </TabsContent>
      </Tabs>

      {editingBoss && (
        <SetTimeDialog
          isOpen={!!editingBoss}
          onOpenChange={handleSetTimeDialogVisibility}
          onSetTime={handleManualSetTime}
          boss={editingBoss}
        />
      )}
    </>
  );
}
