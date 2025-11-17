export const aboutTranslations = {
  no: {
    metadata: {
      title: 'Om Oss - TegnOgFarge.no',
      description: 'Lær mer om TegnOgFarge.no, vår misjon, og teamet bak siden. Finn ut hvorfor vi brenner for å tilby gratis fargeleggingsoppgaver for barn.',
    },
    breadcrumb: {
      home: 'Hjem',
      about: 'Om Oss',
    },
    heading: 'Om Oss',
    content: {
      intro: 'Hos Tegn & Farge har vi som mål å inspirere barnas fantasi og utvikle kreative ferdigheter gjennom morsomme og enkle fargeleggingsark. Vi mener at fargelegging er mer enn en hyggelig aktivitet – det styrker motorikk, fargegjenkjenning og konsentrasjon.',
      vision: 'Vi startet opp i 2025 fordi vi ønsket å lage et sted hvor barn kan fargelegge og virkelig være kreative. Vår visjon er å gi barna et rom til å skape – ikke bare å bruke.',
      mission: 'Vi lanserte Tegn & Farge med en klar idé: å tilby en digital arena der barna kan uttrykke seg fritt og samtidig ha det gøy med enkle og engasjerende motiver. Siden starten har vi jobbet med å levere morsomt og lærerikt innhold som engasjerer små hoder og hender.',
      goal: 'Vårt mål er å støtte kreativ utvikling hos barn i alle aldre med lettfølgelige og underholdende fargeleggingsark. Vi oppdaterer kontinuerlig med nye temaer og ideer som inspirerer til videre utforskning og nysgjerrighet.',
      closing: 'Med Tegn & Farge blir fargelegging både morsommere og mer lærerikt enn noen gang! Bli med oss på denne fargerike reisen – la kreativiteten blomstre!',
    },
    contact: {
      heading: 'Kontakt Oss',
      text: 'Har du spørsmål eller ønsker å komme i kontakt? Besøk vår',
      linkText: 'kontaktside',
    },
  },
  sv: {
    metadata: {
      title: 'Om Oss - TegnOgFarge.no',
      description: 'Lär dig mer om TegnOgFarge.no, vårt uppdrag och teamet bakom sidan. Ta reda på varför vi brinner för att erbjuda gratis färgläggningsuppgifter för barn.',
    },
    breadcrumb: {
      home: 'Hem',
      about: 'Om Oss',
    },
    heading: 'Om Oss',
    content: {
      intro: 'Hos Tegn & Farge strävar vi efter att inspirera barns fantasi och utveckla kreativa färdigheter genom roliga och enkla målarbilder. Vi tror att målning är mer än en trevlig aktivitet – den stärker motorik, färgigenkänning och koncentration.',
      vision: 'Vi startade 2025 eftersom vi ville skapa en plats där barn kan måla och verkligen vara kreativa. Vår vision är att ge barnen ett utrymme att skapa – inte bara att använda.',
      mission: 'Vi lanserade Tegn & Farge med en tydlig idé: att erbjuda en digital arena där barnen kan uttrycka sig fritt och samtidigt ha kul med enkla och engagerande motiv. Sedan starten har vi arbetat med att leverera roligt och lärorikt innehåll som engagerar små huvuden och händer.',
      goal: 'Vårt mål är att stödja kreativ utveckling hos barn i alla åldrar med lättföljda och underhållande målarbilder. Vi uppdaterar kontinuerligt med nya teman och idéer som inspirerar till vidare utforskning och nyfikenhet.',
      closing: 'Med Tegn & Farge blir målning både roligare och mer lärorikt än någonsin! Följ med oss på denna färgglada resa – låt kreativiteten blomstra!',
    },
    contact: {
      heading: 'Kontakta Oss',
      text: 'Har du frågor eller vill komma i kontakt? Besök vår',
      linkText: 'kontaktsida',
    },
  },
} as const;

export type Locale = keyof typeof aboutTranslations;
