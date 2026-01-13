
'use client';
import { useState, useCallback } from 'react';
import { serverBosses, type ServerBoss } from '@/lib/server-bosses';
import { ServerBossCard } from '@/components/ServerBossCard';
import { SetServerTimeDialog } from '@/components/SetServerTimeDialog';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

export function ServerBossTimers() {
  const [editingBoss, setEditingBoss] = useState<ServerBoss | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  // State for the time dialog inputs
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [hour, setHour] = useState('8');
  const [minute, setMinute] = useState('30');
  const [period, setPeriod] = useState('PM');

  const handleOpenSetTimeDialog = useCallback((boss: ServerBoss) => {
    if (user && !user.isAnonymous) {
      setEditingBoss(boss);
      // Reset dialog state when opening
      setDayOfWeek('');
      setHour('8');
      setMinute('30');
      setPeriod('PM');
    } else {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to set server boss timers. Redirecting to login...',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [user, router, toast]);

  const handleCloseSetTimeDialog = useCallback(() => {
    setEditingBoss(null);
  }, []);

  const handleManualSetTime = useCallback(() => {
    if (!editingBoss || !firestore || !dayOfWeek) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a day.',
      });
      return;
    }

    const now = new Date();
    const gmt8Offset = 8 * 60 * 60 * 1000;
    const nowInGmt8 = new Date(now.getTime() + gmt8Offset);

    let hour24 = parseInt(hour, 10);
    if (period === 'PM' && hour24 < 12) {
      hour24 += 12;
    }
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
    const currentDayIndex = nowInGmt8.getUTCDay();
    
    let dayDifference = targetDayIndex - currentDayIndex;

    const respawnTime = new Date(nowInGmt8);
    respawnTime.setUTCHours(hour24, parseInt(minute, 10), 0, 0);

    // If day is same, but time has passed, schedule for next week
    if (dayDifference === 0 && respawnTime.getTime() < nowInGmt8.getTime()) {
      dayDifference = 7;
    } else if (dayDifference < 0) { // If target day is in the past this week
        dayDifference += 7;
    }
    
    const targetDate = new Date(nowInGmt8.getTime() + dayDifference * 24 * 60 * 60 * 1000);
    targetDate.setUTCHours(hour24, parseInt(minute, 10), 0, 0);

    const docRef = doc(firestore, 'timers', editingBoss.id);
    setDocumentNonBlocking(docRef, { bossId: editingBoss.id, scheduledRespawnTime: targetDate }, { merge: true });

    toast({
      title: 'Server Boss Timer Updated!',
      description: `${editingBoss.name} respawn time set for ${dayOfWeek} at ${hour}:${minute} ${period} (GMT+8).`,
    });
    
    handleCloseSetTimeDialog();
  }, [editingBoss, firestore, toast, handleCloseSetTimeDialog, dayOfWeek, hour, minute, period]);


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {serverBosses.map((boss) => (
          <ServerBossCard
            key={boss.id}
            boss={boss}
            onOpenSetTimeDialog={handleOpenSetTimeDialog}
          />
        ))}
      </div>
      {editingBoss && (
         <SetServerTimeDialog
          isOpen={!!editingBoss}
          onOpenChange={(isOpen) => !isOpen && handleCloseSetTimeDialog()}
          onSetTime={handleManualSetTime}
          boss={editingBoss}
          dayOfWeek={dayOfWeek}
          setDayOfWeek={setDayOfWeek}
          hour={hour}
          setHour={setHour}
          minute={minute}
          setMinute={setMinute}
          period={period}
          setPeriod={setPeriod}
        />
      )}
    </>
  );
}
