export const contactTranslations = {
  no: {
    metadata: {
      title: 'Kontakt Oss - TegnOgFarge.no',
      description: 'Har du spørsmål eller forslag? Kontakt oss via vårt kontaktskjema. Vi ser frem til å høre fra deg!',
    },
    breadcrumb: {
      home: 'Hjem',
      contact: 'Kontakt Oss',
      ariaLabel: 'Brødsmulesti',
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
      ariaLabel: 'Brödsmulor',
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
  de: {
    metadata: {
      title: 'Kontaktieren Sie Uns - TegnOgFarge.no',
      description: 'Haben Sie Fragen oder Anregungen? Kontaktieren Sie uns über unser Kontaktformular. Wir freuen uns auf Ihre Nachricht!',
    },
    breadcrumb: {
      home: 'Startseite',
      contact: 'Kontaktieren Sie Uns',
      ariaLabel: 'Breadcrumb-Navigation',
    },
    heading: 'Kontaktieren Sie Uns',
    intro: 'Haben Sie Fragen, Anregungen oder etwas, das Sie wissen möchten? Wir freuen uns immer, von Ihnen zu hören. Ob Sie Vorschläge für neue Ausmalbilder haben, Hilfe benötigen oder Ideen einbringen möchten – nehmen Sie Kontakt auf!',
    list: {
      heading: 'Sie können uns erreichen, wenn Sie zum Beispiel:',
      items: [
        'Fragen zum Inhalt der Website haben',
        'Vorschläge oder Feedback teilen möchten',
        'Kooperationsmöglichkeiten suchen',
        'Technische Hilfe benötigen',
      ],
    },
    form: {
      labels: {
        name: 'Name',
        email: 'E-Mail',
        message: 'Nachricht',
      },
      placeholders: {
        name: 'Ihr Name hier...',
        email: 'Ihre E-Mail-Adresse...',
        message: 'Schreiben Sie hier Ihre Nachricht...',
      },
      button: {
        submit: 'Nachricht Senden',
        sending: 'Wird gesendet...',
      },
      messages: {
        successTitle: 'Vielen Dank für Ihre Nachricht!',
        captchaRequired: 'Bitte schließen Sie die CAPTCHA-Verifizierung ab.',
        captchaFailed: 'CAPTCHA-Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        serverError: 'Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es später erneut.',
        genericError: 'Etwas ist schiefgelaufen.',
      },
    },
  },
} as const;

export type Locale = keyof typeof contactTranslations;

// Type for form translations to be passed to ContactForm component
export type ContactFormTranslations = typeof contactTranslations.no.form;
