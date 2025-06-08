import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { draftMode } from 'next/headers';
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import StagewiseToolbarWrapper from "@/components/dev/StagewiseToolbarWrapper";
import BaseJsonLd from "@/components/json-ld/BaseJsonLd";
import dynamic from 'next/dynamic';

// Dynamisk import av VisualEditing
const VisualEditing = dynamic(
  () => import('@/components/sanity/VisualEditing').then((mod) => mod.VisualEditing),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="nb">
      <head>
        <link 
          rel="icon" 
          href="/favicon/tegnogfarge-favicon.svg" 
          type="image/svg+xml"
        />
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <StagewiseToolbarWrapper />
        <BaseJsonLd />
        {/* Kun last VisualEditing når vi er i draft mode */}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
