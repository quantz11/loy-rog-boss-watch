
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ScheduledNotification = {
  timeoutId: number;
  notificationTime: number;
};

type NotificationContextType = {
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => void;
  scheduleNotification: (bossName: string, respawnTime: Date) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_MINUTE_THRESHOLD = 3;

export const Notifications = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [scheduledNotifications, setScheduledNotifications] = useState<Record<string, ScheduledNotification>>({});

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(() => {
    if (!('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'This browser does not support desktop notifications.',
      });
      return;
    }
    Notification.requestPermission().then((perm) => {
      setPermission(perm);
      if (perm === 'granted') {
        toast({
          title: 'Notifications Enabled!',
          description: `You will now receive alerts ${NOTIFICATION_MINUTE_THRESHOLD} minutes before a boss respawns.`,
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Notifications Disabled',
            description: 'You have blocked notifications. You can enable them in your browser settings.',
        });
      }
    });
  }, [toast]);

  const scheduleNotification = useCallback((bossName: string, respawnTime: Date) => {
    if (Notification.permission !== 'granted') {
      return;
    }

    const notificationTime = respawnTime.getTime() - NOTIFICATION_MINUTE_THRESHOLD * 60 * 1000;
    const now = new Date().getTime();

    if (notificationTime <= now) {
      // Don't schedule notifications for the past
      return;
    }
    
    setScheduledNotifications(prev => {
        const existing = prev[bossName];
        // If a notification for this boss at this exact time already exists, do nothing.
        if (existing && existing.notificationTime === notificationTime) {
            return prev;
        }

        // Clear any existing timeout for this boss to avoid duplicates from old timers
        if (existing) {
            clearTimeout(existing.timeoutId);
        }

        const timeoutId = window.setTimeout(() => {
            new Notification('Boss Respawning Soon!', {
                body: `${bossName} is respawning in ${NOTIFICATION_MINUTE_THRESHOLD} minutes!`,
                icon: '/favicon.ico', 
            });
            // After notification fires, remove it from the state
            setScheduledNotifications(p => {
                const newScheduled = {...p};
                delete newScheduled[bossName];
                return newScheduled;
            })

        }, notificationTime - now);
        
        // Add the new notification to the state
        return {
            ...prev, 
            [bossName]: { timeoutId, notificationTime }
        };
    });

  }, []); // This useCallback has no dependencies on purpose to keep it stable. It uses functional updates for state.

  useEffect(() => {
    // This is a cleanup function for when the component unmounts.
    // It clears all scheduled timeouts to prevent memory leaks.
    return () => {
        Object.values(scheduledNotifications).forEach(({ timeoutId }) => clearTimeout(timeoutId));
    };
  }, [scheduledNotifications]);


  return (
    <NotificationContext.Provider value={{ permission, requestPermission, scheduleNotification }}>
      {permission === 'default' && (
         <div className="bg-secondary/50 border border-dashed border-secondary-foreground/20 p-4 rounded-lg mb-8 flex items-center justify-between">
            <p className="text-sm text-secondary-foreground">Enable browser notifications to get alerts before a boss respawns.</p>
            <Button onClick={requestPermission}>
                <Bell className="mr-2 h-4 w-4" /> Enable Notifications
            </Button>
         </div>
      )}
      {permission === 'denied' && (
         <div className="bg-destructive/10 border border-dashed border-destructive/50 p-4 rounded-lg mb-8 flex items-center justify-between">
            <p className="text-sm text-destructive-foreground/80">You have blocked notifications. To use this feature, please enable notifications for this site in your browser settings.</p>
             <BellOff className="h-5 w-5 text-destructive" />
         </div>
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a Notifications provider');
  }
  return context;
};
