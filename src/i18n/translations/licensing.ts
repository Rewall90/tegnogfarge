export const licensingTranslations = {
  no: {
    metadata: {
      title: 'Lisensieringspolicy - TegnOgFarge.no',
      description: 'Alt innhold på Tegn og Farge er beskyttet av opphavsrett. Les om hva du har lov til å gjøre med innholdet vårt, og hva som ikke er tillatt.',
    },
    breadcrumb: {
      home: 'Hjem',
      licensing: 'Lisensieringspolicy',
    },
    heading: 'Lisensieringspolicy',
    intro: 'Alt innhold på Tegn og Farge – som fargeleggingsark, bilder og tekst – er beskyttet av opphavsrett. Det betyr at det er vi som eier det, og at det kun er ment til personlig bruk eller bruk i skolesammenheng. Når du bruker innholdet vårt, sier du deg enig i reglene under:',
    sections: {
      allowed: {
        heading: '1. Hva du har lov til å gjøre',
        intro: 'Du kan laste ned, skrive ut og dele fargeleggingsarkene våre så lenge det er til privat eller skolebruk. Dette gjelder for eksempel:',
        items: [
          'Bruk i skoler av lærere og elever, både i klasserommet og hjemme',
          'Å dele med venner og familie',
          'Å legge ut bilder på sosiale medier, så lenge det ikke er for å tjene penger',
        ],
      },
      notAllowed: {
        heading: '2. Hva du ikke har lov til',
        intro: 'Du kan ikke bruke innholdet vårt til noe som handler om å tjene penger. Dette gjelder blant annet:',
        items: [
          'Å selge eller dele arkene våre videre, enten slik de er eller endret',
          'Å bruke innholdet vårt i bøker, produkter eller ting som folk betaler for',
          'Å bruke bildene våre i reklame eller prosjekter hvor noen tjener penger',
        ],
        note: 'Det er ikke lov å bruke innholdet vårt til kommersielle formål uten tillatelse. Det kan få konsekvenser.',
      },
      ownership: {
        heading: '3. Hvem som eier innholdet',
        content: 'Alt på Tegn og Farge er laget og eid av oss. Du kan ikke si at du har laget det selv, eller bruke det som ditt eget – verken originalen eller noe du har forandret på.',
      },
      specialRequests: {
        heading: '4. Spesielle ønsker?',
        text: 'Har du lyst til å bruke noe fra oss på en måte som ikke står her – for eksempel i et prosjekt eller noe kommersielt – må du',
        linkText: 'kontakte oss',
        suffix: '. Vi leser hver forespørsel og svarer så fort vi kan.',
      },
      changes: {
        heading: '5. Endringer i reglene',
        content: 'Vi kan endre på disse reglene når som helst. Sjekk gjerne innom her av og til for å se hva som gjelder.',
      },
      questions: {
        heading: 'Spørsmål?',
        text: 'Lurer du på noe om disse reglene?',
        linkText: 'Ta kontakt med oss',
        suffix: ' – vi hjelper deg gjerne!',
      },
    },
  },
  sv: {
    metadata: {
      title: 'Licenspolicy - TegnOgFarge.no',
      description: 'Allt innehåll på Tegn och Farge är skyddat av upphovsrätt. Läs om vad du får göra med vårt innehåll och vad som inte är tillåtet.',
    },
    breadcrumb: {
      home: 'Hem',
      licensing: 'Licenspolicy',
    },
    heading: 'Licenspolicy',
    intro: 'Allt innehåll på Tegn och Farge – som målarbilder, bilder och text – är skyddat av upphovsrätt. Det betyder att det är vi som äger det, och att det endast är avsett för personligt bruk eller skolbruk. När du använder vårt innehåll godkänner du reglerna nedan:',
    sections: {
      allowed: {
        heading: '1. Vad du får göra',
        intro: 'Du kan ladda ner, skriva ut och dela våra målarbilder så länge det är för privat eller skolbruk. Detta gäller till exempel:',
        items: [
          'Användning i skolor av lärare och elever, både i klassrummet och hemma',
          'Att dela med vänner och familj',
          'Att lägga ut bilder på sociala medier, så länge det inte är för att tjäna pengar',
        ],
      },
      notAllowed: {
        heading: '2. Vad du inte får göra',
        intro: 'Du kan inte använda vårt innehåll för något som handlar om att tjäna pengar. Detta gäller bland annat:',
        items: [
          'Att sälja eller dela våra bilder vidare, antingen som de är eller ändrade',
          'Att använda vårt innehåll i böcker, produkter eller saker som folk betalar för',
          'Att använda våra bilder i reklam eller projekt där någon tjänar pengar',
        ],
        note: 'Det är inte tillåtet att använda vårt innehåll för kommersiella ändamål utan tillstånd. Det kan få konsekvenser.',
      },
      ownership: {
        heading: '3. Vem som äger innehållet',
        content: 'Allt på Tegn och Farge är skapat och ägt av oss. Du kan inte påstå att du har skapat det själv, eller använda det som ditt eget – varken originalet eller något du har ändrat på.',
      },
      specialRequests: {
        heading: '4. Särskilda önskemål?',
        text: 'Vill du använda något från oss på ett sätt som inte står här – till exempel i ett projekt eller något kommersiellt – måste du',
        linkText: 'kontakta oss',
        suffix: '. Vi läser varje förfrågan och svarar så snart vi kan.',
      },
      changes: {
        heading: '5. Ändringar i reglerna',
        content: 'Vi kan ändra dessa regler när som helst. Kolla gärna in här då och då för att se vad som gäller.',
      },
      questions: {
        heading: 'Frågor?',
        text: 'Undrar du något om dessa regler?',
        linkText: 'Kontakta oss',
        suffix: ' – vi hjälper dig gärna!',
      },
    },
  },
} as const;

export type Locale = keyof typeof licensingTranslations;
