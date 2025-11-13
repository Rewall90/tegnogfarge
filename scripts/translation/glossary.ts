/**
 * Translation Glossary
 * Norwegian → Swedish translations for consistent terminology
 */

export const TRANSLATION_GLOSSARY = {
  // Core terminology
  'fargelegg': 'färglägg',
  'fargelegging': 'färgläggning',
  'fargeleggingsark': 'färgläggningsark',
  'fargeleggingssider': 'färgläggningssidor',
  'fargeleg': 'färglägg',
  'tegning': 'teckning',
  'tegninger': 'teckningar',
  'tegnebilde': 'teckningsbild',

  // Categories & Organization
  'kategori': 'kategori',
  'kategorier': 'kategorier',
  'underkategori': 'underkategori',
  'underkategorier': 'underkategorier',

  // Content types
  'motiv': 'motiv',
  'motiver': 'motiv',
  'bilde': 'bild',
  'bilder': 'bilder',
  'ark': 'ark',

  // Actions
  'last ned': 'ladda ner',
  'nedlastning': 'nedladdning',
  'nedlastninger': 'nedladdningar',
  'skriv ut': 'skriv ut',
  'lagre': 'spara',
  'del': 'dela',

  // Site specific
  'gratis': 'gratis',
  'barn': 'barn',
  'voksne': 'vuxna',
  'for barn': 'för barn',
  'for voksne': 'för vuxna',

  // Difficulty levels
  'enkel': 'enkel',
  'enkelt': 'enkelt',
  'middels': 'mellan',
  'vanskelig': 'svår',
  'vanskeligt': 'svårt',

  // Age ranges  'år': 'år',
  'alder': 'ålder',
  'aldersgruppe': 'åldersgrupp',
  'alle aldre': 'alla åldrar',

  // UI elements
  'søk': 'sök',
  'filtrer': 'filtrera',
  'sorter': 'sortera',
  'vis mer': 'visa mer',
  'se alle': 'se alla',

  // Holidays & Seasons (common translations)
  'jul': 'jul',
  'påske': 'påsk',
  '17. mai': '6 juni', // National days are different!
  'halloween': 'halloween',
  'vår': 'vår',
  'sommer': 'sommar',
  'høst': 'höst',
  'vinter': 'vinter',

  // Animals (common)
  'dyr': 'djur',
  'hund': 'hund',
  'katt': 'katt',
  'hest': 'häst',
  'fugl': 'fågel',
  'fisk': 'fisk',
  'elefant': 'elefant',
  'løve': 'lejon',
  'tiger': 'tiger',
  'bjørn': 'björn',
  'kanin': 'kanin',
  'rev': 'räv',

  // Nature
  'natur': 'natur',
  'tre': 'träd',
  'blomst': 'blomma',
  'blomster': 'blommor',
  'hav': 'hav',
  'fjell': 'berg',
  'skog': 'skog',

  // Vehicles
  'kjøretøy': 'fordon',
  'bil': 'bil',
  'lastebil': 'lastbil',
  'fly': 'flygplan',
  'båt': 'båt',
  'tog': 'tåg',

  // Other categories
  'mat': 'mat',
  'vitenskap': 'vetenskap',
  'tegneserier': 'tecknade serier',
  'superhelter': 'superhjältar',
  'prinsesse': 'prinsessa',
  'prinsesser': 'prinsessor',
  'enhjørning': 'enhörning',
  'enhjørninger': 'enhörningar',

  // SEO & Marketing
  'populær': 'populär',
  'populære': 'populära',
  'nye': 'nya',
  'nyeste': 'nyaste',
  'beste': 'bästa',
  'mest': 'mest',
  'favoritt': 'favorit',
  'utvalgte': 'utvalda',
} as const;

/**
 * Get glossary as formatted string for AI prompt
 */
export function getGlossaryPrompt(): string {
  const entries = Object.entries(TRANSLATION_GLOSSARY)
    .map(([no, sv]) => `- "${no}" → "${sv}"`)
    .join('\n');

  return `Translation Glossary (Norwegian → Swedish):\n${entries}\n\nUse these translations consistently throughout the content.`;
}

/**
 * Get glossary as key-value map for validation
 */
export function getGlossaryMap(): Record<string, string> {
  return { ...TRANSLATION_GLOSSARY };
}
