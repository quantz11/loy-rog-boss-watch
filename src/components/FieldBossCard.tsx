
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FieldBoss } from '@/lib/field-bosses';
import { useTimer } from '@/hooks/useTimer';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Hourglass, Settings, Timer, MapPin, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, Timestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useDoc } from '@/firebase';

function FieldBossCardSkeleton() {
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

type FieldBossCardProps = {
  boss: FieldBoss;
  onOpenSetTimeDialog: (boss: FieldBoss) => void;
};

export function FieldBossCard({ boss, onOpenSetTimeDialog }: FieldBossCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const timerDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'timers', boss.id) : null),
    [firestore, boss.id]
  );
  
  const { data: timerData, isLoading } = useDoc<{ defeatedTime: Timestamp }>(timerDocRef);

  const defeatedAt = timerData?.defeatedTime ? timerData.defeatedTime.toDate() : null;

  const respawnTime = useMemo(() => {
    if (!defeatedAt) return null;
    return new Date(defeatedAt.getTime() + boss.respawnHours * 3600 * 1000);
  }, [defeatedAt, boss.respawnHours]);

  const maxRespawnTime = useMemo(() => {
    if (!defeatedAt) return null;
    return new Date(defeatedAt.getTime() + (boss.respawnHours + boss.windowHours) * 3600 * 1000);
  }, [defeatedAt, boss.respawnHours, boss.windowHours]);

  const { hours, minutes, seconds, isUp: isMinReached, totalSeconds: minTotalSeconds } = useTimer(respawnTime);
  const { hours: maxHours, minutes: maxMinutes, seconds: maxSeconds, isUp: isMaxReached } = useTimer(maxRespawnTime);

  const isCountingToMin = !isMinReached;
  const isInWindow = isMinReached && !isMaxReached;
  const isExpired = isMaxReached;

  const isCloseToMin = !isMinReached && minTotalSeconds > 0 && minTotalSeconds < 300; // 5 minutes

  const handleDefeat = useCallback((time: Date) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'timers', boss.id);
    setDocumentNonBlocking(docRef, { bossId: boss.id, defeatedTime: time }, { merge: true });
    
    toast({
      title: 'Timer Started!',
      description: `${boss.name} will respawn in approx. 30-60 minutes.`,
    });
  },[firestore, boss.id, boss.name, toast]);

  if (isLoading) {
    return <FieldBossCardSkeleton />;
  }

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1',
        isExpired ? 'border-accent shadow-accent/20' : 'border-card',
        isInWindow && 'border-yellow-400 dark:border-yellow-500 shadow-yellow-500/20',
        isCloseToMin && 'animate-pulse border-yellow-400'
      )}
    >
      <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
        <boss.Icon className="w-10 h-10 text-primary shrink-0" />
        <div>
          <CardTitle className="font-headline text-lg leading-tight">
            {boss.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{boss.zone}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center py-6">
        {isExpired ? (
          <div className="text-center text-green-600 dark:text-green-400">
            <CheckCircle className="mx-auto h-12 w-12 mb-2" />
            <p className="text-xl font-bold uppercase">Respawned</p>
            <p className="text-sm text-muted-foreground">Max time reached</p>
          </div>
        ) : isInWindow ? (
          <div className="text-center text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="mx-auto h-12 w-12 mb-2 animate-bounce" />
            <p className="text-xl font-bold uppercase">Window Active</p>
            <p className="text-2xl font-mono font-bold">{maxMinutes}:{maxSeconds}</p>
            <p className="text-xs text-muted-foreground">to max spawn</p>
          </div>
        ) : isCountingToMin ? (
          <div className="text-center">
            <div className="relative mb-2 flex justify-center items-center">
              <Hourglass className="mx-auto h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-5xl font-bold font-mono tracking-tighter text-foreground">
              {minutes}:{seconds}
            </p>
            <p className="text-sm text-muted-foreground">until min spawn</p>
            {respawnTime && (
              <div className="text-xs text-muted-foreground/80 mt-2 flex items-center justify-center gap-1">
                <Timer className="h-3 w-3" />
                <span>
                  {respawnTime.toLocaleString('en-US', {
                    timeZone: 'Asia/Singapore',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}{' '}
                  (GMT+8)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground/40 italic py-4">
             No timer set
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button
          onClick={() => handleDefeat(new Date())}
          className="w-full"
          variant={(isInWindow || isExpired) ? 'default' : 'secondary'}
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
