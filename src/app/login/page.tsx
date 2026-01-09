
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem, Loader2 } from 'lucide-react';
import { useUser, useAuth, useFirestore, useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

// Hardcoded email for single-password authentication
const AUTH_EMAIL = 'user@folkvang.watch';
const MAX_LOGIN_ATTEMPTS = 3;

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, AUTH_EMAIL, password);
      setLoginAttempts(0); // Reset on success
      // onAuthStateChanged in the provider will handle the redirect
    } catch (error) {
      console.error("Login failed:", error);
      const newAttemptCount = loginAttempts + 1;
      setLoginAttempts(newAttemptCount);

      if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
        try {
          await addDoc(collection(firestore, 'login-attempts'), {
            userAgent: navigator.userAgent,
            timestamp: new Date(),
            emailAttempted: AUTH_EMAIL,
            language: navigator.language,
          });
          console.log('Logged suspicious activity to Firestore.');
        } catch (firestoreError) {
          console.error("Could not log suspicious activity:", firestoreError);
        }
        
        // Troll toast!
        toast({
          variant: 'destructive',
          title: 'Identity Verification Required',
          description: "To prove you are a clan member, please solve the following: lim(x→∞) Σ(n=1 to x) ∫(0 to π) sin(nθ)/n dθ. The numerical result is your password.",
          duration: 10000, // Make it last a bit longer
        });

        // Reset after logging
        setLoginAttempts(0);
      } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'The password you entered is incorrect. Please try again.',
        });
      }
      
      setIsLoading(false);
    }
  };

  // This effect will run when the authentication state changes
  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Gem className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">ROG Folkvang Boss Watch</CardTitle>
          <CardDescription>Enter the clan password to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing In...' : 'Enter'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
