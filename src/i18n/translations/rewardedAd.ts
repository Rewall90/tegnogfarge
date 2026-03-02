export const rewardedAdTranslations = {
  no: {
    header: 'Se en kort annonse for å laste ned',
    body: 'Støtt oss ved å se en kort annonse. Tegningen din lastes ned rett etterpå.',
    accept: 'Vis annonse',
    cancel: 'Hopp over',
  },
  sv: {
    header: 'Se en kort annons för att ladda ner',
    body: 'Stöd oss genom att se en kort annons. Din bild laddas ner direkt efter.',
    accept: 'Visa annons',
    cancel: 'Hoppa över',
  },
  de: {
    header: 'Kurze Werbung ansehen zum Herunterladen',
    body: 'Unterstütze uns, indem du eine kurze Werbung anschaust. Dein Bild wird danach sofort heruntergeladen.',
    accept: 'Werbung ansehen',
    cancel: 'Überspringen',
  },
} as const;

export type RewardedAdTranslations = typeof rewardedAdTranslations;
