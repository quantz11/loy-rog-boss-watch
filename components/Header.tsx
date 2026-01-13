
import { Gem } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3 text-decoration-none color-inherit">
          <div className="flex items-center gap-3">
            <Gem className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold tracking-tight text-foreground">
              ROG Boss Watch
            </h1>
          </div>
        </Link>
      </div>
    </header>
  );
}
