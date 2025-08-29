import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { I18nProvider } from '@/lib/i18n';
import { PWAManager } from '@/components/pwa/pwa-manager';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Todo PWA',
    template: '%s | Todo PWA',
  },
  description: 'Offline-first Todo application built with Next.js',
  keywords: ['todo', 'pwa', 'offline', 'nextjs', 'productivity'],
  authors: [{ name: 'Todo PWA Team' }],
  creator: 'Todo PWA',
  publisher: 'Todo PWA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://todo-pwa.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Todo PWA',
    description: 'Offline-first Todo application built with Next.js',
    siteName: 'Todo PWA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Todo PWA',
    description: 'Offline-first Todo application built with Next.js',
    creator: '@todopwa',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todo PWA',
  },
  verification: {
    // Add verification codes here if needed
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang=\"en\" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name=\"application-name\" content=\"Todo PWA\" />
        <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />
        <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"default\" />
        <meta name=\"apple-mobile-web-app-title\" content=\"Todo PWA\" />
        <meta name=\"format-detection\" content=\"telephone=no\" />
        <meta name=\"mobile-web-app-capable\" content=\"yes\" />
        <meta name=\"msapplication-config\" content=\"/browserconfig.xml\" />
        <meta name=\"msapplication-TileColor\" content=\"#2563eb\" />
        <meta name=\"msapplication-tap-highlight\" content=\"no\" />
        
        {/* Apple touch icons */}
        <link rel=\"apple-touch-icon\" href=\"/icons/icon-192x192.png\" />
        <link rel=\"apple-touch-icon\" sizes=\"152x152\" href=\"/icons/icon-152x152.png\" />
        <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/icons/icon-192x192.png\" />
        <link rel=\"apple-touch-icon\" sizes=\"167x167\" href=\"/icons/icon-192x192.png\" />
        
        {/* Standard favicon */}
        <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/icons/icon-32x32.png\" />
        <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/icons/icon-16x16.png\" />
        
        {/* Manifest */}
        <link rel=\"manifest\" href=\"/manifest.webmanifest\" />
        
        {/* Safari pinned tab */}
        <link rel=\"mask-icon\" href=\"/icons/safari-pinned-tab.svg\" color=\"#2563eb\" />
        
        {/* Preload critical resources */}
        <link rel=\"preload\" href=\"/sw.js\" as=\"script\" />
        
        {/* Disable zoom on mobile */}
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover\" />
      </head>
      <body className={`${inter.className} antialiased safe-top safe-bottom`}>
        <I18nProvider>
          <ToastProvider>
            {children}
            <PWAManager />
          </ToastProvider>
        </I18nProvider>
        
        {/* PWA registration script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}"