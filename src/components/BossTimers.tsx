
'use client';
import { useState } from 'react';
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

export function BossTimers() {
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const interServerBosses = bosses.filter((b) => b.type === 'inter');
  const normalBosses = bosses.filter((b) => b.type === 'normal');

  const floors = Array.from(new Set(bosses.map((b) => b.floor))).sort(
    (a, b) => a - b
  );

  const handleOpenSetTimeDialog = (boss: Boss) => {
    setEditingBoss(boss);
  };

  const handleCloseSetTimeDialog = () => {
    setEditingBoss(null);
  };

  const handleManualSetTime = (time: Date) => {
    if (editingBoss && firestore) {
      const docRef = doc(firestore, 'timers', editingBoss.id);
      // Use non-blocking update
      setDocumentNonBlocking(docRef, { bossId: editingBoss.id, defeatedTime: time }, { merge: true });
      toast({
        title: 'Timer Updated!',
        description: `${editingBoss.name} - ${editingBoss.floor}F timer was set manually.`,
      });
    }
    handleCloseSetTimeDialog();
  };

  const renderFloorGroup = (floor: number, bossList: Boss[]) => {
    const floorBosses = bossList.filter((b) => b.floor === floor);
    if (floorBosses.length === 0) return null;

    return (
      <AccordionItem value={`floor-${floor}`} key={floor}>
        <AccordionTrigger>
          <h2 className="text-2xl font-headline font-semibold text-primary">
            Folkvang - {floor}F
          </h2>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {floorBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                onOpenSetTimeDialog={() => handleOpenSetTimeDialog(boss)}
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
      defaultValue={floors.map((f) => `floor-${f}`)}
    >
      {floors.map((floor) => renderFloorGroup(floor, bossList))}
    </Accordion>
  );

  return (
    <>
      <Tabs defaultValue="inter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="inter" className="text-base">
            Inter-Server (8h)
          </TabsTrigger>
          <TabsTrigger value="normal" className="text-base">
            Normal (2h)
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
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              handleCloseSetTimeDialog();
            }
          }}
          onSetTime={handleManualSetTime}
          bossName={`${editingBoss.name} - ${editingBoss.floor}F`}
        />
      )}
    </>
  );
}
