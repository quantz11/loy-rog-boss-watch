
'use client';

import { useEffect, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { bosses } from '@/lib/bosses';
import { triggerNotification } from './Notifications';

const NOTIFICATION_THRESHOLD_SECONDS = 180; // 3 minutes

export function GlobalTimerManager() {
  const firestore = useFirestore();
  const timersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'timers') : null),
    [firestore]
  );
  
  const { data: timers } = useCollection<{ defeatedTime: Timestamp, bossId: string }>(timersCollectionRef);
  const notifiedBossesRef = useRef(new Set());

  useEffect(() => {
    const checkTimers = () => {
      if (!timers) return;

      const now = new Date().getTime();

      timers.forEach(timer => {
        const boss = bosses.find(b => b.id === timer.bossId);
        if (!boss) return;

        const defeatedAt = timer.defeatedTime.toDate();
        const respawnTime = new Date(defeatedAt.getTime() + boss.respawnHours * 3600 * 1000);
        
        const timeLeftSeconds = (respawnTime.getTime() - now) / 1000;
        
        const isPastThreshold = timeLeftSeconds <= 0;
        const bossIdentifier = `[${boss.type.charAt(0).toUpperCase() + boss.type.slice(1)}] ${boss.name} - ${boss.floor}F`;

        if (isPastThreshold) {
            // If the boss has respawned, remove it from the notified set
            // so it can be notified for its next spawn.
            if (notifiedBossesRef.current.has(bossIdentifier)) {
                notifiedBossesRef.current.delete(bossIdentifier);
            }
            return;
        }

        const shouldNotify = timeLeftSeconds > 0 && timeLeftSeconds <= NOTIFICATION_THRESHOLD_SECONDS;
        
        if (shouldNotify && !notifiedBossesRef.current.has(bossIdentifier)) {
          console.log(`Triggering notification for ${bossIdentifier}`);
          triggerNotification(`${bossIdentifier} is respawning soon!`, {
            body: `Respawn in approximately 3 minutes.`,
            icon: '/icons/icon-192x192.png',
            tag: bossIdentifier, // Use tag to prevent multiple notifications for the same boss
          });
          notifiedBossesRef.current.add(bossIdentifier);
        }
      });
    };

    const interval = setInterval(checkTimers, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [timers]);

  return null; // This component doesn't render anything
}
