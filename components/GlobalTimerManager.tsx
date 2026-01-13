
'use client';

import { useEffect, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { bosses, type Boss } from '@/lib/bosses';
import { serverBosses, type ServerBoss } from '@/lib/server-bosses';
import { triggerNotification } from './Notifications';

const FOLKVANG_NOTIFICATION_THRESHOLD_SECONDS = 180; // 3 minutes
const SERVER_BOSS_NOTIFICATION_THRESHOLD_SECONDS = 900; // 15 minutes

export function GlobalTimerManager() {
  const firestore = useFirestore();
  const timersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'timers') : null),
    [firestore]
  );
  
  const { data: timers } = useCollection<{ defeatedTime: Timestamp, scheduledRespawnTime: Timestamp, bossId: string }>(timersCollectionRef);
  const notifiedBossesRef = useRef(new Set());

  useEffect(() => {
    const checkTimers = () => {
      if (!timers) return;

      const now = new Date().getTime();

      // Check Folkvang Bosses
      timers.forEach(timer => {
        const boss = bosses.find(b => b.id === timer.bossId);
        if (!boss) return;

        const defeatedAt = timer.defeatedTime?.toDate();
        if (!defeatedAt) return;

        const respawnTime = new Date(defeatedAt.getTime() + boss.respawnHours * 3600 * 1000);
        
        const timeLeftSeconds = (respawnTime.getTime() - now) / 1000;
        
        const bossIdentifier = `[${boss.type.charAt(0).toUpperCase() + boss.type.slice(1)}] ${boss.name} - ${boss.floor}F`;

        if (timeLeftSeconds <= 0) {
            if (notifiedBossesRef.current.has(bossIdentifier)) {
                notifiedBossesRef.current.delete(bossIdentifier);
            }
            return;
        }

        const shouldNotify = timeLeftSeconds > 0 && timeLeftSeconds <= FOLKVANG_NOTIFICATION_THRESHOLD_SECONDS;
        
        if (shouldNotify && !notifiedBossesRef.current.has(bossIdentifier)) {
          console.log(`Triggering notification for ${bossIdentifier}`);
          triggerNotification(`${bossIdentifier} is respawning soon!`, {
            body: `Respawn in approximately 3 minutes.`,
            icon: '/loy-rog-boss-watch/icon-192x192.png',
            tag: bossIdentifier,
          });
          notifiedBossesRef.current.add(bossIdentifier);
        }
      });

      // Check Server Bosses
      timers.forEach(timer => {
        const serverBoss = serverBosses.find(b => b.id === timer.bossId);
        if (!serverBoss) return;
        
        // Server bosses use scheduledRespawnTime
        const respawnTime = timer.scheduledRespawnTime?.toDate();
        if (!respawnTime) return;

        const timeLeftSeconds = (respawnTime.getTime() - now) / 1000;
        const bossIdentifier = serverBoss.name;

         if (timeLeftSeconds <= 0) {
            if (notifiedBossesRef.current.has(bossIdentifier)) {
                notifiedBossesRef.current.delete(bossIdentifier);
            }
            return;
        }

        const shouldNotify = timeLeftSeconds > 0 && timeLeftSeconds <= SERVER_BOSS_NOTIFICATION_THRESHOLD_SECONDS;

        if (shouldNotify && !notifiedBossesRef.current.has(bossIdentifier)) {
          console.log(`Triggering notification for ${bossIdentifier}`);
          triggerNotification(`${bossIdentifier} is respawning soon!`, {
            body: `Respawn in approximately 15 minutes.`,
            icon: '/loy-rog-boss-watch/icon-192x192.png',
            tag: bossIdentifier,
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
