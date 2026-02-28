
'use client';

import { useEffect, useState, Suspense } from 'react';
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
import { Gem, Loader2, Lock } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

// Credentials for the shared clan account
const AUTH_EMAIL = 'user@folkvang.watch';
const CLAN_PASSWORD = 'go2Quantz4ROG';
const MAX_LOGIN_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 10;

function LoginPageContent() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCoolingDown || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // First check if the input matches our clan password
      if (password !== CLAN_PASSWORD) {
        throw { code: 'auth/invalid-credential' } as AuthError;
      }

      // If matches, sign in with the internal shared account
      await signInWithEmailAndPassword(auth, AUTH_EMAIL, CLAN_PASSWORD);
      setLoginAttempts(0);
      router.replace(redirectPath || '/folkvang-boss-watch/');
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
          description: `Unauthorized access detected. Hint: Check the clan recruitment message. (Try again in ${COOLDOWN_SECONDS} seconds)`,
          duration: 10000,
        });

        setIsCoolingDown(true);
        setTimeout(() => {
          setIsCoolingDown(false);
          setLoginAttempts(0);
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
              title: 'Access Denied',
              description: 'Incorrect clan password. Please contact Quantz for the key.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'System Error',
          description: authError.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace(redirectPath || '/folkvang-boss-watch/');
    }
  }, [user, isUserLoading, router, redirectPath]);

  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-headline font-bold">Clan Access</CardTitle>
            <CardDescription className="text-base mt-2">Enter the key to unlock the ROG Watch system</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="px-8 py-6">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter clan password"
                  className="h-12 text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isCoolingDown}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 px-8 pb-10">
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl" disabled={isLoading || isCoolingDown}>
              {(isLoading || isCoolingDown) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Decrypting...' : isCoolingDown ? `Locked` : 'Unlock System'}
            </Button>
             <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full h-10">
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginPageContent />
    </Suspense>
  )
}
