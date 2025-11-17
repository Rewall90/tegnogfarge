export const contactTranslations = {
  no: {
    metadata: {
      title: 'Kontakt Oss - TegnOgFarge.no',
      description: 'Har du spørsmål eller forslag? Kontakt oss via vårt kontaktskjema. Vi ser frem til å høre fra deg!',
    },
    breadcrumb: {
      home: 'Hjem',
      contact: 'Kontakt Oss',
    },
    heading: 'Kontakt Oss',
    intro: 'Har du spørsmål, innspill eller noe du lurer på? Vi setter alltid pris på å høre fra deg. Enten du har forslag til nye fargeleggingsark, trenger hjelp med noe, eller har lyst til å bidra med ideer – ta kontakt!',
    list: {
      heading: 'Du kan nå oss hvis du for eksempel:',
      items: [
        'Har spørsmål om innholdet på nettsiden',
        'Vil dele forslag eller tilbakemeldinger',
        'Ser etter muligheter for samarbeid',
        'Trenger hjelp med noe teknisk',
      ],
    },
    form: {
      labels: {
        name: 'Navn',
        email: 'E-post',
        message: 'Melding',
      },
      placeholders: {
        name: 'Ditt navn her...',
        email: 'Din e-postadresse...',
        message: 'Skriv meldingen din her...',
      },
      button: {
        submit: 'Send Melding',
        sending: 'Sender...',
      },
      messages: {
        successTitle: 'Takk for din henvendelse!',
        captchaRequired: 'Vennligst fullfør CAPTCHA-verifiseringen.',
        captchaFailed: 'CAPTCHA-verifisering mislyktes. Vennligst prøv igjen.',
        serverError: 'Kunne ikke koble til serveren. Prøv igjen senere.',
        genericError: 'Noe gikk galt.',
      },
    },
  },
  sv: {
    metadata: {
      title: 'Kontakta Oss - TegnOgFarge.no',
      description: 'Har du frågor eller förslag? Kontakta oss via vårt kontaktformulär. Vi ser fram emot att höra från dig!',
    },
    breadcrumb: {
      home: 'Hem',
      contact: 'Kontakta Oss',
    },
    heading: 'Kontakta Oss',
    intro: 'Har du frågor, synpunkter eller något du undrar över? Vi uppskattar alltid att höra från dig. Oavsett om du har förslag på nya målarbilder, behöver hjälp med något eller vill bidra med idéer – kontakta oss!',
    list: {
      heading: 'Du kan nå oss om du till exempel:',
      items: [
        'Har frågor om innehållet på webbplatsen',
        'Vill dela förslag eller feedback',
        'Söker möjligheter för samarbete',
        'Behöver hjälp med något tekniskt',
      ],
    },
    form: {
      labels: {
        name: 'Namn',
        email: 'E-post',
        message: 'Meddelande',
      },
      placeholders: {
        name: 'Ditt namn här...',
        email: 'Din e-postadress...',
        message: 'Skriv ditt meddelande här...',
      },
      button: {
        submit: 'Skicka Meddelande',
        sending: 'Skickar...',
      },
      messages: {
        successTitle: 'Tack för ditt meddelande!',
        captchaRequired: 'Vänligen slutför CAPTCHA-verifieringen.',
        captchaFailed: 'CAPTCHA-verifiering misslyckades. Vänligen försök igen.',
        serverError: 'Kunde inte ansluta till servern. Försök igen senare.',
        genericError: 'Något gick fel.',
      },
    },
  },
} as const;

export type Locale = keyof typeof contactTranslations;

// Type for form translations to be passed to ContactForm component
export type ContactFormTranslations = typeof contactTranslations.no.form;
