'use client';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's no authenticated (non-anonymous) user
    if (!isUserLoading && (!user || user.isAnonymous)) {
      // Redirect to login page if they are not already on it
      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
    
    // If user is logged in and tries to access /login, redirect to home
    if (!isUserLoading && user && !user.isAnonymous && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading, or if we are about to redirect, show a loading screen
  if (isUserLoading || (!user && pathname !== '/login')) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto flex items-center justify-between p-4">
              <Skeleton className="h-8 w-80" />
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
           <div className="flex justify-center mb-8">
             <Skeleton className="h-12 w-96" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
           </div>
        </main>
      </div>
    )
  }
  
  // If user is logged in, or is on the login page, render the children
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const isProd = process.env.NODE_ENV === 'production';
      const repoName = 'loy-rog-boss-watch';
      const swPath = isProd ? `/${repoName}/firebase-messaging-sw.js` : '/firebase-messaging-sw.js';

      navigator.serviceWorker.register(swPath)
        .then(function(registration) {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        }).catch(function(err) {
          console.log('Service Worker registration failed: ', err);
        });
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <title>ROG Folkvang Boss Watch</title>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthGate>
            {children}
          </AuthGate>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
