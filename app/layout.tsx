
'use client';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PUBLIC_PATHS = ['/', '/login/'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthenticated = user && !user.isAnonymous;

  useEffect(() => {
    // This effect handles redirection for protected routes.
    // It should NOT interfere with public routes.
    if (isUserLoading || isPublicPath) {
      return; 
    }
    
    if (!isAuthenticated) {
      router.replace('/login/');
    }
  }, [isUserLoading, isAuthenticated, isPublicPath, router]);


  // Immediately render public pages.
  if (isPublicPath) {
    return <>{children}</>;
  }

  // For protected pages, show a skeleton loader while checking auth.
  if (isUserLoading) {
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
    );
  }

  // If authenticated, show the protected page.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and on a protected page, render nothing while redirecting.
  return null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            console.log('Service Worker is active and ready:', registration);
            
            const isProd = process.env.NODE_ENV === 'production';
            const repoName = 'loy-rog-boss-watch';
            const swUrl = isProd ? `/${repoName}/firebase-messaging-sw.js` : '/firebase-messaging-sw.js';
        
            if (registration.scope.includes(repoName) || !isProd) {
                console.log('Service worker scope is correct.');
            } else {
                 console.warn('Service worker scope might be incorrect for production. Re-registering.');
                 navigator.serviceWorker.register(swUrl)
                    .then(reg => console.log('Re-registration successful:', reg.scope))
                    .catch(err => console.error('Re-registration failed:', err));
            }
        }).catch(err => {
            console.error('Service worker not ready:', err);
        });
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <title>ROG Boss Watch</title>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
