import { Header } from '@/components/Header';
import { FieldBossTimers } from '@/components/FieldBossTimers';
import { Notifications } from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FieldBossWatchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">Back to Main Page</Button>
          </Link>
        </div>
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold font-headline mb-2 text-primary">Field Boss Watch</h1>
            <p className="text-muted-foreground">Track unique field bosses across the world map.</p>
        </div>
        <Notifications>
          <FieldBossTimers />
        </Notifications>
      </main>
      <div className="container mx-auto p-4 md:p-8 pt-0">
        <Link href="/">
          <Button variant="outline">Back to Main Page</Button>
        </Link>
      </div>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          ROG Boss Watch | Timers for Legend of Ymir
          <div className="mt-2">Trademark of Quantz of ROG Clan</div>
        </div>
      </footer>
    </div>
  );
}
