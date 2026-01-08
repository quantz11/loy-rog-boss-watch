import { Header } from '@/components/Header';
import { BossTimers } from '@/components/BossTimers';
import { Notifications } from '@/components/Notifications';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Notifications>
          <BossTimers />
        </Notifications>
      </main>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          ROG Folkvang Boss Watch | Timers for Legend of Ymir
          <div className="mt-2">Trademark of Quantz of ROG Clan</div>
        </div>
      </footer>
    </div>
  );
}
