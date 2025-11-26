import type { Metadata } from "next";
import "./globals.css";
import { AdSenseScript } from "@/components/ads/AdSenseScript";

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
        <AdSenseScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
