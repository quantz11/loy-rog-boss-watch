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
import { initiateEmailSignIn, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Hardcoded email for single-password authentication
const AUTH_EMAIL = 'user@folkvang.watch';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateEmailSignIn(AUTH_EMAIL, password);
  };

  // This effect will run when the authentication state changes
  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);


  // Effect to handle sign-in errors from the auth listener
  useEffect(() => {
    if (user === null && !isUserLoading) {
      if (isLoading) {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'The password you entered is incorrect. Please try again.',
        });
      }
    }
  }, [user, isUserLoading, isLoading, toast]);


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
