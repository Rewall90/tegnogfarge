import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";
import { draftMode } from 'next/headers';
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import StagewiseToolbarWrapper from "@/components/dev/StagewiseToolbarWrapper";
import BaseJsonLd from "@/components/json-ld/BaseJsonLd";
import dynamic from 'next/dynamic';
import { GoogleAnalytics } from '@next/third-parties/google';

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
  metadataBase: new URL('https://tegnogfarge.no'),
  alternates: {
    canonical: '/',
  },
  title: "TegnOgFarge.no – Last ned & fargelegg gratis fargeleggingssider",
  description: "Fargelegg gratis – last ned eller tegn i nettleseren. Motiver for barn og voksne i PNG/PDF – print og kos deg nå!",
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
        <BaseJsonLd />
      </head>
      <body className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <StagewiseToolbarWrapper />
        {/* Kun last VisualEditing når vi er i draft mode */}
        {isDraftMode && <VisualEditing />}
        {/* Google Analytics - kun i produksjon */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
