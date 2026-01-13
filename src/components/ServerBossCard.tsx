
'use client';

import { useMemo } from 'react';
import type { ServerBoss } from '@/lib/server-bosses';
import { useTimer } from '@/hooks/useTimer';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Hourglass, Settings, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, Timestamp } from 'firebase/firestore';
import { useDoc } from '@/firebase';

function ServerBossCardSkeleton() {
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

type ServerBossCardProps = {
  boss: ServerBoss;
  onOpenSetTimeDialog: (boss: ServerBoss, currentRespawn: Date | null) => void;
};

export function ServerBossCard({ boss, onOpenSetTimeDialog }: ServerBossCardProps) {
  const firestore = useFirestore();

  const timerDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'timers', boss.id) : null),
    [firestore, boss.id]
  );
  
  const { data: timerData, isLoading } = useDoc<{ defeatedTime: Timestamp, scheduledRespawnTime: Timestamp }>(timerDocRef);

  const respawnTime = useMemo(() => {
    // Priority 1: Use the manually scheduled respawn time if it exists
    if (timerData?.scheduledRespawnTime) {
      return timerData.scheduledRespawnTime.toDate();
    }
    // Priority 2: Calculate from defeated time
    if (timerData?.defeatedTime) {
      const defeatedAt = timerData.defeatedTime.toDate();
      return new Date(defeatedAt.getTime() + boss.respawnHours * 3600 * 1000);
    }
    // No timer set
    return null;
  }, [timerData, boss.respawnHours]);

  const { days, hours, minutes, seconds, isUp, totalSeconds } = useTimer(respawnTime);
  const isCloseToRespawn = !isUp && totalSeconds > 0 && totalSeconds < 300; // 5 minutes

  if (isLoading) {
    return <ServerBossCardSkeleton />;
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
          {boss.name}
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
            {parseInt(days, 10) > 0 ? (
                <p className="text-4xl font-bold font-mono tracking-tighter text-foreground">
                    {days}d {hours}:{minutes}:{seconds}
                </p>
            ) : (
                <p className="text-5xl font-bold font-mono tracking-tighter text-foreground">
                    {hours}:{minutes}:{seconds}
                </p>
            )}
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
          onClick={() => onOpenSetTimeDialog(boss, respawnTime)}
          className="w-full"
          variant="outline"
        >
          <Settings className="mr-2 h-4 w-4" />
          Set Respawn Time
        </Button>
      </CardFooter>
    </Card>
  );
}
