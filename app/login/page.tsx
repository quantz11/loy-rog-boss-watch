
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
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

// Hardcoded email for single-password authentication
const AUTH_EMAIL = 'user@folkvang.watch';
const MAX_LOGIN_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 10;

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // State to track if component is mounted on the client
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCoolingDown || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, AUTH_EMAIL, password);
      setLoginAttempts(0); // Reset on success
      router.replace('/folkvang-boss-watch'); // Redirect on success
    } catch (error) {
      const authError = error as AuthError;
      
      const showTrollToastAndCooldown = async () => {
        try {
          if (firestore) {
            await addDoc(collection(firestore, 'login-attempts'), {
              userAgent: navigator.userAgent,
              timestamp: new Date(),
              emailAttempted: AUTH_EMAIL,
              language: navigator.language,
            });
          }
        } catch (firestoreError) {
          console.error("Could not log suspicious activity:", firestoreError);
        }
        
        toast({
          variant: 'destructive',
          title: 'Identity Verification Required',
          description: `To prove you are a clan member, please solve the following: lim(x→∞) Σ(n=1 to x) ∫(0 to π) sin(nθ)/n dθ. The numerical result is your password. (Try again in ${COOLDOWN_SECONDS} seconds)`,
          duration: 10000,
        });

        setIsCoolingDown(true);
        setTimeout(() => {
          setIsCoolingDown(false);
          setLoginAttempts(0); // Reset attempts after cooldown
        }, COOLDOWN_SECONDS * 1000);
      };

      if (authError.code === 'auth/too-many-requests') {
          await showTrollToastAndCooldown();
      } else if (authError.code === 'auth/invalid-credential') {
        const newAttemptCount = loginAttempts + 1;
        setLoginAttempts(newAttemptCount);

        if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
          await showTrollToastAndCooldown();
        } else {
          toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'The password you entered is incorrect. Please try again.',
          });
        }
      } else {
        // Handle other unexpected Firebase auth errors
        toast({
          variant: 'destructive',
          title: 'An Unexpected Error Occurred',
          description: authError.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/folkvang-boss-watch');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Gem className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">ROG Boss Watch</CardTitle>
          <CardDescription>Enter the clan password to continue</CardDescription>
        </CardHeader>
        {isClient ? (
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
                    disabled={isLoading || isCoolingDown}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isLoading || isCoolingDown}>
                {(isLoading || isCoolingDown) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Signing In...' : isCoolingDown ? `On Cooldown...` : 'Enter'}
              </Button>
               <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Main
                </Button>
              </Link>
            </CardFooter>
          </form>
        ) : (
          <div className="p-6 pt-0">
             <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>
        )}
      </Card>
    </div>
  );
}
