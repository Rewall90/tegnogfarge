export const authorTranslations = {
  no: {
    metadata: {
      title: 'Om Skribenten - TegnOgFarge.no',
      description: 'Bli kjent med skribenten og illustratøren bak TegnOgFarge.no. Lær om lidenskapen for kreativitet og tegning som driver nettstedet.',
    },
    breadcrumb: {
      home: 'Hjem',
      author: 'Om Skribenten',
    },
    heading: 'Om Skribenten',
    content: {
      intro: 'Velkommen til siden om meg, skribenten og illustratøren som står bak alle tegningene du finner på TegnOgFarge.no. Jeg er utrolig glad for å kunne dele min lidenskap for kunst og kreativitet med dere.',
      backgroundHeading: 'Min Bakgrunn',
      background: 'Helt siden jeg var liten, har tegning vært min måte å uttrykke meg på. Jeg har tilbrakt utallige timer med blyant og papir, og senere med digitale tegneverktøy, for å skape verdener og karakterer fra fantasien.',
      philosophyHeading: 'Min Filosofi',
      philosophy: 'Jeg tror at alle har en kunstner inni seg som bare venter på å slippe ut. Fargelegging er en fantastisk måte å utforske denne siden av seg selv på, uansett alder eller ferdighetsnivå. Det handler ikke om å skape et perfekt mesterverk, men om å ha det gøy, slappe av og la kreativiteten flyte.',
      love: 'Alle tegningene på denne siden er laget med kjærlighet og et ønske om å inspirere. Jeg håper de gir deg like mye glede å fargelegge som de ga meg å lage.',
      thanks: 'Takk for at du tok deg tid til å bli litt bedre kjent med meg. God fargelegging!',
      licensing: 'For mer informasjon om hvordan du kan bruke bildene, se vår',
      licensingLink: 'lisensieringspolicy',
    },
  },
  sv: {
    metadata: {
      title: 'Om Författaren - TegnOgFarge.no',
      description: 'Lär känna författaren och illustratören bakom TegnOgFarge.no. Lär dig om passionen för kreativitet och teckning som driver webbplatsen.',
    },
    breadcrumb: {
      home: 'Hem',
      author: 'Om Författaren',
    },
    heading: 'Om Författaren',
    content: {
      intro: 'Välkommen till sidan om mig, författaren och illustratören som står bakom alla teckningar du hittar på TegnOgFarge.no. Jag är otroligt glad över att kunna dela min passion för konst och kreativitet med er.',
      backgroundHeading: 'Min Bakgrund',
      background: 'Ända sedan jag var liten har teckning varit mitt sätt att uttrycka mig. Jag har tillbringat otaliga timmar med penna och papper, och senare med digitala ritverktyg, för att skapa världar och karaktärer från fantasin.',
      philosophyHeading: 'Min Filosofi',
      philosophy: 'Jag tror att alla har en konstnär inom sig som bara väntar på att släppas ut. Målning är ett fantastiskt sätt att utforska denna sida av sig själv, oavsett ålder eller färdighetsnivå. Det handlar inte om att skapa ett perfekt mästerverk, utan om att ha kul, slappna av och låta kreativiteten flöda.',
      love: 'Alla teckningar på denna sida är skapade med kärlek och en önskan att inspirera. Jag hoppas att de ger dig lika mycket glädje att färglägga som de gav mig att skapa.',
      thanks: 'Tack för att du tog dig tid att lära känna mig lite bättre. Glad målning!',
      licensing: 'För mer information om hur du kan använda bilderna, se vår',
      licensingLink: 'licenspolicy',
    },
  },
  de: {
    metadata: {
      title: 'Über den Autor - TegnOgFarge.no',
      description: 'Lernen Sie den Autor und Illustrator hinter TegnOgFarge.no kennen. Erfahren Sie mehr über die Leidenschaft für Kreativität und Zeichnen, die die Website antreibt.',
    },
    breadcrumb: {
      home: 'Startseite',
      author: 'Über den Autor',
    },
    heading: 'Über den Autor',
    content: {
      intro: 'Willkommen auf der Seite über mich, den Autor und Illustrator, der hinter allen Zeichnungen steht, die Sie auf TegnOgFarge.no finden. Ich freue mich sehr, meine Leidenschaft für Kunst und Kreativität mit Ihnen teilen zu können.',
      backgroundHeading: 'Mein Hintergrund',
      background: 'Seit ich klein war, war das Zeichnen meine Art, mich auszudrücken. Ich habe unzählige Stunden mit Bleistift und Papier und später mit digitalen Zeichenwerkzeugen verbracht, um Welten und Charaktere aus der Fantasie zu erschaffen.',
      philosophyHeading: 'Meine Philosophie',
      philosophy: 'Ich glaube, dass jeder einen Künstler in sich trägt, der nur darauf wartet, herauszukommen. Ausmalen ist eine fantastische Möglichkeit, diese Seite von sich selbst zu erkunden, unabhängig von Alter oder Fähigkeitsniveau. Es geht nicht darum, ein perfektes Meisterwerk zu schaffen, sondern darum, Spaß zu haben, sich zu entspannen und die Kreativität fließen zu lassen.',
      love: 'Alle Zeichnungen auf dieser Seite sind mit Liebe und dem Wunsch zu inspirieren gemacht. Ich hoffe, sie bereiten Ihnen genauso viel Freude beim Ausmalen, wie sie mir beim Erstellen bereitet haben.',
      thanks: 'Danke, dass Sie sich die Zeit genommen haben, mich ein wenig besser kennenzulernen. Viel Spaß beim Ausmalen!',
      licensing: 'Für weitere Informationen zur Nutzung der Bilder siehe unsere',
      licensingLink: 'Lizenzrichtlinien',
    },
  },
} as const;

export type Locale = keyof typeof authorTranslations;
