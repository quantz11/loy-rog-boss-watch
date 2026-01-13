
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Gem } from 'lucide-react';
import { ServerBossTimers } from '@/components/ServerBossTimers';


export default function HomePage() {
  const router = useRouter();
  
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold font-headline mb-2">ROG Boss Watch</h1>
          <p className="text-lg text-muted-foreground">Timers for Legend of Ymir</p>
        </header>
        
        <main className="w-full max-w-7xl mx-auto">
          <div className="w-full max-w-md mx-auto mb-16">
            <Card className="hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Gem className="h-8 w-8 text-primary" />
                    Folkvang Boss Watch
                  </CardTitle>
                  <CardDescription>Password-protected timers for ROG clan members.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push('/login?redirect=/folkvang-boss-watch/')}>
                    Enter Folkvang Watch
                  </Button>
                </CardContent>
              </Card>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold text-primary">
                Server Boss Timers
              </h2>
              <p className="text-muted-foreground">
                Public timers for server-wide bosses. Viewable by all.
              </p>
            </div>
            <ServerBossTimers />
          </div>
        </main>

        <footer className="py-8 mt-12">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            Trademark of Quantz of ROG Clan
          </div>
        </footer>
      </div>
    </>
  );
}
