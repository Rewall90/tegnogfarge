import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";
import { draftMode } from 'next/headers';
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import StagewiseToolbarWrapper from "@/components/dev/StagewiseToolbarWrapper";
import { WebsiteJsonLd } from "@/components/json-ld/WebsiteJsonLd";
import dynamic from 'next/dynamic';

// Dynamisk import av VisualEditing
const VisualEditing = dynamic(
  () => import('@/components/sanity/VisualEditing').then((mod) => mod.VisualEditing),
  { ssr: false }
);

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "TegnOgFarge.no - Gratis Fargeleggingssider",
  description: "Last ned og print gratis fargeleggingssider for barn og voksne. Finn kreative tegninger og motiverende aktiviteter for alle aldre.",
  icons: {
    icon: [
      {
        url: '/favicon/tegnogfarge-favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: {
      url: '/favicon/favicon.min.svg',
      type: 'image/svg+xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sjekk om vi er i draft mode
  const { isEnabled: isDraftMode } = draftMode();
  
  return (
    <html lang="nb" className={`${inter.variable} ${quicksand.variable}`}>
      <head>
        <link 
          rel="icon" 
          href="/favicon/tegnogfarge-favicon.svg" 
          type="image/svg+xml"
        />
        <WebsiteJsonLd />
      </head>
      <body className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <StagewiseToolbarWrapper />
        {/* Kun last VisualEditing når vi er i draft mode */}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
