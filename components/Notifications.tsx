
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTokenAndSave } from '@/firebase/messaging';
import { useFirebase, useFirebaseApp } from '@/firebase';
import { GlobalTimerManager } from '@/components/GlobalTimerManager';

type NotificationContextType = {
  permission: NotificationPermission | 'unsupported' | 'loading';
  requestPermission: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const triggerNotification = (title: string, options: NotificationOptions) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  } else {
    console.log('Notification permission not granted or feature not supported.');
  }
};


export const Notifications = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const firebaseApp = useFirebaseApp();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'loading'>('loading');
  
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported');
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (permission === 'loading' || !firestore || !user || !firebaseApp) return;
    setPermission('loading');

    try {
        const result = await Notification.requestPermission();
        setPermission(result);

      if (result === 'granted') {
        await getTokenAndSave(firebaseApp, firestore, user.uid);
        toast({
          title: 'Notifications Enabled!',
          description: 'You can now receive push notifications for boss respawns.',
        });
      } else {
         toast({
            variant: 'destructive',
            title: 'Notifications Blocked',
            description: 'You have blocked notifications. To use this feature, please enable them in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      setPermission(Notification.permission); // Reset to actual permission
      toast({
        variant: 'destructive',
        title: 'Could Not Enable Notifications',
        description: 'An error occurred. Please try again.',
      });
    }

  }, [firebaseApp, firestore, user, permission, toast]);
  

  return (
    <NotificationContext.Provider value={{ permission, requestPermission }}>
        {permission === 'default' && (
         <div className="bg-secondary/50 border border-dashed border-secondary-foreground/20 p-4 rounded-lg mb-8 flex items-center justify-between">
            <p className="text-sm text-secondary-foreground">Enable push notifications to get alerts for boss respawns.</p>
            <Button onClick={requestPermission} disabled={permission === 'loading'}>
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
       {permission === 'granted' && (
        <>
            <GlobalTimerManager />
            <div className="bg-green-600/10 border border-dashed border-green-600/50 p-4 rounded-lg mb-8 flex items-center justify-between">
                <p className="text-sm text-green-200/80">Notifications are enabled. You'll get an alert 3 minutes before a boss respawns.</p>
            </div>
        </>
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
