import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smoon",
  description: "État de la lune en temps réel selon votre géolocalisation",
  manifest: "/manifest.json",
  themeColor: "#0a0a0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smoon",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && 
                      typeof navigator !== 'undefined' && 
                      'serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                      navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then(reg => {
                          console.log('Service Worker registered', reg);
                          // Vérifier les mises à jour
                          if (reg && typeof reg.addEventListener === 'function') {
                            reg.addEventListener('updatefound', () => {
                              const newWorker = reg.installing;
                              if (newWorker && typeof newWorker.addEventListener === 'function') {
                                newWorker.addEventListener('statechange', () => {
                                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('New service worker available');
                                  }
                                });
                              }
                            });
                          }
                        })
                        .catch(err => {
                          console.warn('Service Worker registration failed:', err);
                        });
                    });
                  }
                } catch (e) {
                  console.warn('Service Worker setup error:', e);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
