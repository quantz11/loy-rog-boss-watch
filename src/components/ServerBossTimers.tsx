
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

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const handleOpenSetTimeDialog = useCallback((boss: ServerBoss, currentRespawn: Date | null) => {
    if (user && !user.isAnonymous) {
      setEditingBoss(boss);
      
      const targetDate = currentRespawn ? currentRespawn : new Date();

      // Get time parts in Asia/Singapore timezone safely
      const dayStr = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Singapore', weekday: 'long' });
      const hourStr = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', hour12: true }).split(' ')[0];
      const minuteStr = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Singapore', minute: '2-digit' });
      const periodStr = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Singapore', hour: 'numeric', hour12: true }).split(' ')[1];
      
      setDayOfWeek(dayStr);
      setHour(hourStr);
      setMinute(minuteStr);
      setPeriod(periodStr || 'PM'); // Default to PM if period is not found

    } else {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to set server boss timers. Redirecting to login...',
      });
      setTimeout(() => {
        router.push('/login?redirect=/');
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
    
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);

    // Get current date object in GMT+8
    const nowSGT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const currentDayIndexSGT = nowSGT.getDay();
    
    // Calculate how many days to add
    let dayDifference = targetDayIndex - currentDayIndexSGT;
    
    // Convert input time to 24-hour format
    let hour24 = parseInt(hour, 10);
    if (period === 'PM' && hour24 < 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) { // Midnight case
      hour24 = 0;
    }
    const minuteInt = parseInt(minute, 10);

    // Create a temporary date object with the target time for today
    const tempTargetDate = new Date(nowSGT);
    tempTargetDate.setHours(hour24, minuteInt, 0, 0);
    
    // If the selected day is today, but the time has already passed, schedule for next week
    if (dayDifference === 0 && tempTargetDate < nowSGT) {
      dayDifference = 7;
    } 
    // If the selected day is in the past for this week, schedule for next week
    else if (dayDifference < 0) {
      dayDifference += 7;
    }
    
    // Create the final target date object
    const targetDate = new Date(nowSGT);
    // Set the date to the correct upcoming day
    targetDate.setDate(targetDate.getDate() + dayDifference);
    // Set the time for that day
    targetDate.setHours(hour24, minuteInt, 0, 0);

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
