export const appDownloadTranslations = {
  no: {
    header: 'Prøv appen vår!',
    subtitle: 'Scan QR-koden for å laste ned appen',
    testHeader: 'Hjelp oss teste!',
    testDescription: 'Vi utvikler appen sammen med deg',
    features: {
      becomeTester: 'Bli testbruker',
      giveFeedback: 'Gi tilbakemelding',
      influenceDevelopment: 'Påvirk utviklingen',
    },
    button: 'Besøk App Store',
    ariaLabel: 'Last ned Tegn og Farge appen fra App Store - Scan QR kode',
    qrAlt: 'QR kode for å laste ned Tegn og Farge app fra App Store - scan med mobilkamera for å åpne appen direkte',
  },
  sv: {
    header: 'Prova vår app!',
    subtitle: 'Skanna QR-koden för att ladda ner appen',
    testHeader: 'Hjälp oss testa!',
    testDescription: 'Vi utvecklar appen tillsammans med dig',
    features: {
      becomeTester: 'Bli testanvändare',
      giveFeedback: 'Ge feedback',
      influenceDevelopment: 'Påverka utvecklingen',
    },
    button: 'Besök App Store',
    ariaLabel: 'Ladda ner Tegn og Farge appen från App Store - Skanna QR kod',
    qrAlt: 'QR kod för att ladda ner Tegn og Farge app från App Store - skanna med mobilkamera för att öppna appen direkt',
  },
  de: {
    header: 'Probieren Sie unsere App!',
    subtitle: 'Scannen Sie den QR-Code, um die App herunterzuladen',
    testHeader: 'Helfen Sie uns beim Testen!',
    testDescription: 'Wir entwickeln die App gemeinsam mit Ihnen',
    features: {
      becomeTester: 'Testbenutzer werden',
      giveFeedback: 'Feedback geben',
      influenceDevelopment: 'Entwicklung beeinflussen',
    },
    button: 'App Store besuchen',
    ariaLabel: 'Laden Sie die Tegn og Farge App aus dem App Store herunter - Scannen Sie den QR-Code',
    qrAlt: 'QR-Code zum Herunterladen der Tegn og Farge App aus dem App Store - scannen Sie mit der Handykamera, um die App direkt zu öffnen',
  },
} as const;

export type AppDownloadLocale = keyof typeof appDownloadTranslations;
