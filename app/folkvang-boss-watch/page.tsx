
import { Header } from '@/components/Header';
import { BossTimers } from '@/components/BossTimers';
import { Notifications } from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FolkvangBossWatchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">Back to Main Page</Button>
          </Link>
        </div>
        <Notifications>
          <BossTimers />
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
