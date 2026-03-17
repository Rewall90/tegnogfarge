import type { Metadata } from "next";
import "./globals.css";
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
        {/* Block Google Funding Choices popup by intercepting FC API */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.googlefc = window.googlefc || {};
              window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
              window.googlefc.ccpa = window.googlefc.ccpa || {};
              window.googlefc.controlledMessagingFunction = () => {};
              window.__tcfapi = () => {};
              window.__gpp = () => {};
            `,
          }}
        />
        {/* AdSense runs alongside Ezoic via Mediation — plain script avoids data-nscript warning */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2852837430993050"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
