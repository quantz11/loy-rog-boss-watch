'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading, error };
};
