'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Gem, MapPin } from 'lucide-react';
import { ServerBossTimers } from '@/components/ServerBossTimers';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-extrabold font-headline mb-4 tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ROG Boss Watch
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          The ultimate utility for tracking world bosses and unique monsters in Legend of Ymir.
        </p>
      </header>
      
      <main className="w-full max-w-7xl mx-auto space-y-24">
        {/* Main Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Folkvang Boss Watch Card */}
          <Card className="group relative overflow-hidden bg-card/40 border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-2xl hover:shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-4 p-10 relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Gem className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight mb-2">
                  Folkvang Watch
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground/80 leading-relaxed">
                  Elite floor bosses and inter-server guardians. Password-protected for ROG clan members.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10 pt-0 relative z-10">
              <Button 
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                onClick={() => router.push('/login?redirect=/folkvang-boss-watch/')}
              >
                Enter Folkvang Watch
              </Button>
            </CardContent>
          </Card>

          {/* Field Boss Watch Card */}
          <Card className="group relative overflow-hidden bg-card/40 border-accent/20 hover:border-accent/50 transition-all duration-500 shadow-2xl hover:shadow-accent/10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-4 p-10 relative z-10">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <MapPin className="h-10 w-10 text-accent" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight mb-2">
                  Field Boss Watch
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground/80 leading-relaxed">
                  World map unique bosses. Tracking and respawn alerts.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10 pt-0 relative z-10">
              <Button 
                variant="secondary"
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg shadow-accent/10 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                onClick={() => router.push('/login?redirect=/field-boss-watch/')}
              >
                Enter Field Watch
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Public Server Timers */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-headline font-bold text-foreground tracking-tight">
              Server Boss Timers
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Publicly accessible timers for server-wide raid bosses. Viewable by all players.
            </p>
          </div>
          <div className="bg-card/20 p-8 rounded-3xl border border-border/50">
            <ServerBossTimers />
          </div>
        </div>
      </main>

      <footer className="py-16 mt-32 border-t border-border/50 w-full max-w-5xl">
        <div className="container mx-auto text-center space-y-4">
          <p className="font-semibold text-lg text-foreground/80">ROG Boss Watch</p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>Legend of Ymir Utility</span>
            <span className="text-border">|</span>
            <span>v1.2.0</span>
          </div>
          <p className="text-xs opacity-50 italic">Trademark of Quantz of ROG Clan</p>
        </div>
      </footer>
    </div>
  );
}
