
'use client';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Note: usePathname() returns the path WITHOUT the basePath.
const PUBLIC_PATHS = ['/', '/login/'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Standardize pathname to ensure trailing slash matching works correctly
  const currentPath = pathname?.endsWith('/') ? pathname : `${pathname}/`;
  const isPublicPath = PUBLIC_PATHS.some(path => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  });

  const isAuthenticated = user && !user.isAnonymous;

  useEffect(() => {
    if (isUserLoading || isPublicPath) {
      return; 
    }
    
    if (!isAuthenticated) {
      // router.replace is relative to basePath automatically in Next.js
      router.replace('/login/');
    }
  }, [isUserLoading, isAuthenticated, isPublicPath, currentPath, router]);


  // Rule 1: Public paths are always rendered immediately to prevent blank screens
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Rule 2: Protected paths show loading state
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

  // Rule 3: Authenticated users see the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Rule 4: Otherwise, return nothing while the useEffect handles redirection
  return null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker) {
      const isProd = process.env.NODE_ENV === 'production';
      const repoName = 'loy-rog-boss-watch';
      const swUrl = isProd ? `/${repoName}/firebase-messaging-sw.js` : '/firebase-messaging-sw.js';

      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
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
