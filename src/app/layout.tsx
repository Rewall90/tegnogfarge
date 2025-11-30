import type { Metadata } from "next";
import "./globals.css";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { EzoicScripts } from "@/components/ads/EzoicScripts";

export const metadata: Metadata = {
  metadataBase: new URL('https://tegnogfarge.no'),
  alternates: {
    canonical: 'https://tegnogfarge.no/',
  },
  title: "TegnOgFarge.no – Last ned & fargelegg gratis fargeleggingssider",
  description: "Fargelegg gratis – last ned eller tegn i nettleseren. Motiver for barn og voksne i PNG/PDF – print og kos deg nå!",
  other: {
    'privacy-policy': 'https://tegnogfarge.no/personvernerklaering',
    'cookie-consent': 'implemented',
    'gdpr-compliant': 'true',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        {/* Ezoic privacy scripts must load first per Ezoic requirements */}
        <EzoicScripts />
        {/* AdSense runs alongside Ezoic via Mediation for dual monetization */}
        <AdSenseScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
