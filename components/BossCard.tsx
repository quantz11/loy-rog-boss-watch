
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Boss } from '@/lib/bosses';
import { useTimer } from '@/hooks/useTimer';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Hourglass, Settings, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useDoc } from '@/firebase';
import { useNotifications } from './Notifications';

function BossCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center py-8">
        <Skeleton className="h-20 w-4/5" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

type BossCardProps = {
  boss: Boss;
  onOpenSetTimeDialog: (boss: Boss) => void;
};

export function BossCard({ boss, onOpenSetTimeDialog }: BossCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { scheduleNotification } = useNotifications();


  const timerDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'timers', boss.id) : null),
    [firestore, boss.id]
  );
  
  const { data: timerData, isLoading } = useDoc<{ defeatedTime: Timestamp }>(timerDocRef);

  const defeatedAt = timerData?.defeatedTime ? timerData.defeatedTime.toDate() : null;

  const respawnTime = useMemo(() => {
    if (!defeatedAt) return null;
    return new Date(defeatedAt.getTime() + boss.respawnHours * 3600 * 1000)
  }, [defeatedAt, boss.respawnHours]);

  const { hours, minutes, seconds, isUp, totalSeconds } = useTimer(respawnTime);
  const isCloseToRespawn = !isUp && totalSeconds > 0 && totalSeconds < 300; // 5 minutes

  useEffect(() => {
    if (respawnTime && !isUp) {
      scheduleNotification(`${boss.name} - ${boss.floor}F`, respawnTime);
    }
  }, [respawnTime?.getTime(), isUp]);


  const handleDefeat = useCallback((time: Date) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'timers', boss.id);
    setDocumentNonBlocking(docRef, { bossId: boss.id, defeatedTime: time }, { merge: true });
    
    const newRespawnTime = new Date(time.getTime() + boss.respawnHours * 3600 * 1000);
    scheduleNotification(`${boss.name} - ${boss.floor}F`, newRespawnTime);

    toast({
      title: 'Timer Started!',
      description: `${boss.name} - ${boss.floor}F will respawn in ${boss.respawnHours} hours.`,
    });
  },[firestore, boss.id, boss.name, boss.floor, boss.respawnHours, scheduleNotification, toast]);

  if (isLoading) {
    return <BossCardSkeleton />;
  }

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1',
        isUp ? 'border-accent shadow-accent/20' : 'border-card',
        isCloseToRespawn &&
          'animate-pulse border-yellow-400 dark:border-yellow-500 shadow-yellow-500/10'
      )}
    >
      <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
        <boss.Icon className="w-10 h-10 text-primary shrink-0" />
        <CardTitle className="font-headline text-lg">
          {boss.name} - {boss.floor}F
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center py-6">
        {isUp ? (
          <div className="text-center text-green-600 dark:text-green-400">
            <CheckCircle className="mx-auto h-12 w-12 mb-2" />
            <p className="text-xl font-bold uppercase">Respawned</p>
            <p className="text-sm text-muted-foreground">
              Ready to be defeated
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative mb-2 flex justify-center items-center">
              <Hourglass className="mx-auto h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-5xl font-bold font-mono tracking-tighter text-foreground">
              {hours}:{minutes}:{seconds}
            </p>
            <p className="text-sm text-muted-foreground">until respawn</p>
            {respawnTime && (
              <div className="text-xs text-muted-foreground/80 mt-2 flex items-center justify-center gap-1">
                <Timer className="h-3 w-3" />
                <span>
                  {respawnTime.toLocaleString('en-US', {
                    timeZone: 'Asia/Singapore',
                    weekday: 'short',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}{' '}
                  (GMT+8)
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button
          onClick={() => handleDefeat(new Date())}
          className="w-full"
          variant={isUp ? 'default' : 'secondary'}
        >
          <Clock className="mr-2 h-4 w-4" />
          Mark Defeated
        </Button>
        <Button
          onClick={() => onOpenSetTimeDialog(boss)}
          className="w-full sm:w-auto"
          variant="outline"
          size="icon"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Set manual time</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
