
'use client';
import { getMessaging, getToken } from "firebase/messaging";
import { collection, doc, setDoc, Firestore } from "firebase/firestore";
import { FirebaseApp } from "firebase/app";

// IMPORTANT: The value for VAPID_KEY is a placeholder.
// In this specific development environment, it is automatically
// replaced with the correct key during the application's build process.
// You do not need to manually change it.
const VAPID_KEY = "YOUR_VAPID_KEY_HERE";

/**
 * Requests permission for notifications and retrieves the FCM token.
 * If permission is granted, it saves the token to Firestore.
 */
export async function getTokenAndSave(app: FirebaseApp, firestore: Firestore, userId: string): Promise<string | null> {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser.');
    return null;
  }
  
  const messaging = getMessaging(app);

  try {
    // Wait for the service worker to be ready.
    // This ensures the worker is active before we try to get a token.
    await navigator.serviceWorker.ready;
    
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // Save the token to Firestore
      const tokenRef = doc(collection(firestore, 'fcmTokens'), currentToken);
      await setDoc(tokenRef, {
        uid: userId,
        token: currentToken,
        createdAt: new Date(),
      }, { merge: true });
      return currentToken;
    } else {
      // Show permission request UI
      console.log('No registration token available. Request permission to generate one.');
      // The browser should prompt the user for permission automatically.
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    throw err;
  }
}
