export interface CookieDetail {
  name: string;
  duration: string;
  description: string;
  provider?: string;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies?: CookieDetail[];
}

export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  advertising: boolean;
}

export interface CookiePreferences {
  consentGiven: boolean;
  consentDate: string;
  categories: CookieConsent;
}

export interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsent: (category: keyof CookieConsent) => boolean;
  updateConsent: (categories: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Nødvendig',
    description: 'Nødvendige cookies er avgjørende for grunnleggende funksjoner på nettstedet, og nettstedet fungerer ikke på den tiltenkte måten uten dem. Disse cookies lagrer ikke personlig identifiserbare data.',
    required: true,
    cookies: [
      {
        name: 'next-auth.session-token',
        duration: 'Økt',
        description: 'Brukes for å opprettholde brukerens påloggingsstatus og autentisering.',
        provider: 'NextAuth.js'
      },
      {
        name: 'next-auth.csrf-token',
        duration: 'Økt',
        description: 'Sikkerhetscookie som beskytter mot Cross-Site Request Forgery angrep.',
        provider: 'NextAuth.js'
      }
    ]
  },
  {
    id: 'functional',
    name: 'Funksjonell',
    description: 'Funksjonelle cookies hjelper deg med å utføre visse funksjoner som å dele innholdet på nettstedet på sosiale medieplattformer, samle tilbakemeldinger og andre tredjepartsfunksjoner.',
    required: false,
    cookies: [
      {
        name: 'tegnogfarge-viewport-state',
        duration: 'Permanent',
        description: 'Lagrer zoom-nivå og posisjon på tegneområdet for å gi en bedre brukeropplevelse.',
        provider: 'TegnOgFarge'
      },
      {
        name: 'tegnogfarge-viewport-zoom',
        duration: '1 time',
        description: 'Midlertidig lagring av zoom-innstillinger for tegneområdet.',
        provider: 'TegnOgFarge'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analytiske cookies brukes til å forstå hvordan besøkende samhandler med nettstedet. Disse cookies hjelper deg med å gi informasjon om beregningene antall besøkende, fluktfrekvens, trafikkilde osv.',
    required: false,
    cookies: [
      {
        name: '_ga',
        duration: '1 år 1 måned 4 dager',
        description: 'Google Analytics setter denne informasjonskapselen for å lagre og telle sidevisninger.',
        provider: 'Google Analytics'
      },
      {
        name: '_ga_*',
        duration: '1 år 1 måned 4 dager',
        description: 'Google Analytics oppretter denne informasjonskapselen for å beregne data for besøkende, økter og kampanjer og spore bruk av siden for dens analyserapporter. Denne informasjonskapselen lagrer informasjon anonymt og tildeler et tilfeldig generert nummer for å gjenkjenne unike brukere.',
        provider: 'Google Analytics'
      }
    ]
  },
  {
    id: 'performance',
    name: 'Ytelse',
    description: 'Ytelsescookies cookies til å forstå og analysere de viktigste ytelsesindeksene til nettstedet som hjelper til med å gi en bedre brukeropplevelse for de besøkende.',
    required: false,
    cookies: []
  },
  {
    id: 'advertising',
    name: 'Annonse',
    description: 'Annonsecookies brukes til å levere besøkende med tilpassede annonser basert på sidene de besøkte før og analysere effektiviteten av annonsekampanjen.',
    required: false,
    cookies: []
  },
];