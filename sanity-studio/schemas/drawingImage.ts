import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'drawingImage',
  title: 'Tegnebilder',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'baseDocumentId',
      title: 'Base Document ID',
      type: 'string',
      description: 'ID of the original Norwegian document (used for translation linking)',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .replace(/\s+/g, '-')           // Replace spaces with hyphens
          .replace(/[æ]/g, 'ae')          // Replace æ with ae (Norwegian)
          .replace(/[ø]/g, 'o')           // Replace ø with o (Norwegian)
          .replace(/[å]/g, 'a')           // Replace å with a (Norwegian)
          .replace(/[ä]/g, 'a')           // Replace ä with a (Swedish)
          .replace(/[ö]/g, 'o')           // Replace ö with o (Swedish)
          .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric characters except hyphens
          .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '')          // Remove hyphens from start and end
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'En kort beskrivelse av tegningen'
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Beskrivelse',
      type: 'text',
      description: 'Beskrivelse for SEO formål. Vises i søkemotorresultater. Ideelt 150-160 tegn.',
      validation: Rule => Rule.max(160).warning('Meta beskrivelser bør ikke overstige 160 tegn for optimal SEO')
    }),
    defineField({
      name: 'recommendedAgeRange',
      title: 'Anbefalt Aldersgruppe',
      type: 'string',
      options: {
        list: [
          { title: '3-5 år', value: '3-5' },
          { title: '4-7 år', value: '4-7' },
          { title: '6-8 år', value: '6-8' },
          { title: '9-12 år', value: '9-12' },
          { title: 'Over 12 år', value: '12+' },
          { title: 'Alle aldre', value: 'all' }
        ]
      },
      description: 'Anbefalt aldersgruppe for dette fargeleggingsbildet',
      initialValue: 'all'
    }),
    defineField({
      name: 'contextContent',
      title: 'Kontekst og Innhold',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Overskrift 2', value: 'h2' },
            { title: 'Overskrift 3', value: 'h3' },
            { title: 'Overskrift 4', value: 'h4' }
          ],
          lists: [
            { title: 'Punktliste', value: 'bullet' },
            { title: 'Nummerert liste', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Fet', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
              { title: 'Understrek', value: 'underline' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ]
          }
        }
      ],
      description: 'Legg til detaljert informasjon, instruksjoner eller fakta relatert til bildet. Bruk overskrifter for å organisere innholdet.'
    }),
    defineField({
      name: 'downloadFile',
      title: 'Nedlastningsfil (PDF, valgfritt)',
      type: 'file'
    }),
    defineField({
      name: 'displayImage',
      title: 'Visningsbilde for tegningssiden',
      type: 'image',
      description: 'Dette bildet vil bli vist på tegningssiden med maks bredde 450px. Anbefalt størrelse: 750x1000 pixler (3:4 ratio). Bildet vil skaleres automatisk, men behold 3:4 format for best resultat. WebP-format anbefales.',
      options: {
        hotspot: true,
        metadata: ['lqip']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Viktig for SEO og tilgjengelighet. Beskriv bildet for skjermlesere.',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Miniatyrbilde',
      type: 'image',
      description: 'Brukes i oversikter og på kategori-sider. Anbefalt størrelse: 600x800 pixler (3:4 ratio). På mobile enheter vises bildet større (85% av skjermbredden), på mellomstore skjermer 40%, og på store skjermer 25%. WebP-format anbefales.',
      options: {
        hotspot: true,
        accept: 'image/webp,image/jpeg',
        metadata: ['lqip']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Viktig for SEO og tilgjengelighet. Beskriv bildet for skjermlesere.',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'webpImage',
      title: 'WebP Bilde for Online Fargelegging',
      type: 'image',
      options: {
        accept: 'image/webp',
        metadata: ['lqip']
      },
      validation: Rule => Rule.required(),
      description: 'Last opp bildet i WebP format for best ytelse ved online fargelegging',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Viktig for SEO og tilgjengelighet. Beskriv bildet for skjermlesere.',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'hasDigitalColoring',
      title: 'Kan fargelegges digitalt',
      type: 'boolean',
      initialValue: false,
      description: 'Aktivér denne hvis bildet skal kunne fargelegges online'
    }),
    defineField({
      name: 'difficulty',
      title: 'Vanskelighetsgrad',
      type: 'string',
      options: {
        list: [
          { title: 'Enkel', value: 'easy' },
          { title: 'Middels', value: 'medium' },
          { title: 'Vanskelig', value: 'hard' }
        ]
      },
      initialValue: 'medium'
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsrekkefølge',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'publishedDate',
      title: 'Publiseringsdato',
      type: 'date',
      description: 'Dato når tegningen ble publisert',
      initialValue: () => new Date().toISOString().split('T')[0], // Dagens dato som standard
      options: {
        dateFormat: 'YYYY/MM/DD'
      }
    }),
    defineField({
      name: 'isActive',
      title: 'Publisert',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'isPublishedToPinterest',
      title: 'Publisert til Pinterest?',
      type: 'boolean',
      description: 'Markerer om dette bildet er publisert til Pinterest. Kan endres manuelt eller automatisk av skriptet.',
      initialValue: false
    }),
    defineField({
      name: 'isPublishedToInstagram',
      title: 'Publisert til Instagram?',
      type: 'boolean',
      description: 'Markerer om dette bildet er publisert til Instagram. Kan endres manuelt eller automatisk av skriptet.',
      initialValue: false
    }),
    defineField({
      name: 'isPublishedToFacebook',
      title: 'Publisert til Facebook?',
      type: 'boolean',
      description: 'Markerer om dette bildet er publisert til Facebook. Kan endres manuelt eller automatisk av skriptet.',
      initialValue: false
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Legg til tags for bedre søk og kategorisering',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'entity',
      title: 'Entity Metadata',
      type: 'object',
      description: 'Strukturert metadata for AI og søkeoptimalisering',
      fields: [
        {
          name: 'attributes',
          title: 'Attributter',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Beskrivende attributter for bildet',
          options: {
            layout: 'tags'
          }
        },
        {
          name: 'main',
          title: 'Hovedbeskrivelse',
          type: 'string',
          description: 'Hovedbeskrivelse av bildet'
        },
        {
          name: 'related',
          title: 'Relaterte emner',
          type: 'object',
          fields: [
            {
              name: 'contextual',
              title: 'Kontekstuell informasjon',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' }
            },
            {
              name: 'techniques',
              title: 'Teknikker',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' }
            },
            {
              name: 'themes',
              title: 'Temaer',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'object',
      description: 'SEO-optimalisering for søkemotorer',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Tittel',
          type: 'string',
          description: 'Tittel som vises i søkemotorresultater'
        },
        {
          name: 'metaDescription',
          title: 'Meta Beskrivelse',
          type: 'text',
          description: 'Beskrivelse som vises i søkemotorresultater'
        }
      ]
    }),
    defineField({
      name: 'instagramImage',
      title: 'Instagram bilde',
      type: 'image',
      description: 'Optimalisert for Instagram (kvadratisk format)',
      options: {
        hotspot: true,
        metadata: ['lqip']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Alt tekst for Instagram bildet'
        }
      ]
    }),
    defineField({
      name: 'pinterestImage',
      title: 'Pinterest bilde',
      type: 'image',
      description: 'Optimalisert for Pinterest (høyt format)',
      options: {
        hotspot: true,
        metadata: ['lqip']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Alt tekst for Pinterest bildet'
        }
      ]
    }),
    defineField({
      name: 'flagMetadata',
      title: 'Flagg Metadata (kun for flagg-tegninger)',
      type: 'object',
      description: 'Spesiell metadata for flagg-fargeleggingsbilder. Fyll ut dette bare hvis dette er et flagg.',
      options: {
        collapsible: true,
        collapsed: true
      },
      fields: [
        {
          name: 'geography',
          title: 'Geografi',
          type: 'object',
          fields: [
            {
              name: 'continent',
              title: 'Kontinent',
              type: 'string',
              options: {
                list: [
                  { title: 'Europa', value: 'Europe' },
                  { title: 'Asia', value: 'Asia' },
                  { title: 'Afrika', value: 'Africa' },
                  { title: 'Nord-Amerika', value: 'North America' },
                  { title: 'Sør-Amerika', value: 'South America' },
                  { title: 'Oseania', value: 'Oceania' },
                  { title: 'Antarktis', value: 'Antarctica' }
                ]
              }
            },
            {
              name: 'subRegion',
              title: 'Region',
              type: 'string',
              description: 'F.eks. "Skandinavia", "Balkan", "Sør-Øst Asia"'
            },
            {
              name: 'countryName',
              title: 'Landsnavn',
              type: 'string'
            }
          ]
        },
        {
          name: 'flagInfo',
          title: 'Flagg-informasjon',
          type: 'object',
          description: 'Viktig: Dette er påkrevd for at filtreringen skal fungere!',
          fields: [
            {
              name: 'flagColors',
              title: 'Flaggfarger',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Liste over farger på flagget (bruk norske navn: rød, blå, hvit, svart, grønn, gul, oransje)',
              options: {
                layout: 'tags'
              },
              validation: Rule => Rule.required().min(1).error('Minst én farge må oppgis')
            },
            {
              name: 'colorCount',
              title: 'Antall farger',
              type: 'number',
              description: 'Hvor mange farger har flagget? (2, 3, 4, osv.)',
              validation: Rule => Rule.required().min(1).max(10)
            },
            {
              name: 'flagSymbol',
              title: 'Flaggsymbol',
              type: 'string',
              description: 'F.eks. "Kors", "Stjerne", "Måne", "Dobbeltørn"'
            },
            {
              name: 'flagPattern',
              title: 'Flaggmønster',
              type: 'string',
              description: 'F.eks. "Enkel design", "Striper", "Kors", "Tricolor"'
            },
            {
              name: 'flagType',
              title: 'Flaggtype',
              type: 'string',
              options: {
                list: [
                  { title: 'Nasjonalflagg', value: 'National' },
                  { title: 'Regionalt flagg', value: 'Regional' },
                  { title: 'Historisk flagg', value: 'Historical' }
                ]
              }
            }
          ]
        },
        {
          name: 'countryInfo',
          title: 'Landinformasjon',
          type: 'object',
          fields: [
            {
              name: 'capital',
              title: 'Hovedstad',
              type: 'string'
            },
            {
              name: 'officialLanguage',
              title: 'Offisielt språk',
              type: 'string'
            },
            {
              name: 'population',
              title: 'Befolkning',
              type: 'number'
            },
            {
              name: 'currency',
              title: 'Valuta',
              type: 'string'
            }
          ]
        },
        {
          name: 'locationInfo',
          title: 'Lokasjon',
          type: 'object',
          fields: [
            {
              name: 'borderingCountries',
              title: 'Naboland',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' }
            },
            {
              name: 'coastline',
              title: 'Kystlinje',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Hav/sjø landet grenser til. Skriv "Landlocked" hvis det ikke har kyst.',
              options: { layout: 'tags' }
            },
            {
              name: 'isIsland',
              title: 'Er det en øynasjon?',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'hemisphere',
              title: 'Halvkule',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                list: [
                  { title: 'Nordlig', value: 'Northern' },
                  { title: 'Sørlig', value: 'Southern' },
                  { title: 'Østlig', value: 'Eastern' },
                  { title: 'Vestlig', value: 'Western' }
                ]
              }
            }
          ]
        },
        {
          name: 'nature',
          title: 'Natur (valgfritt)',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            {
              name: 'climateZone',
              title: 'Klimasone',
              type: 'string',
              description: 'F.eks. "Tropisk", "Temperert", "Arktisk"'
            },
            {
              name: 'famousLandmark',
              title: 'Kjent landemerke',
              type: 'string'
            },
            {
              name: 'nativeAnimal',
              title: 'Nasjonaldyr',
              type: 'string'
            }
          ]
        },
        {
          name: 'culture',
          title: 'Kultur (valgfritt)',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            {
              name: 'traditionalFood',
              title: 'Tradisjonell mat',
              type: 'string'
            },
            {
              name: 'famousSport',
              title: 'Populær sport',
              type: 'string'
            },
            {
              name: 'greeting',
              title: 'Hilsen',
              type: 'string',
              description: 'Hvordan man sier "hei" på landets språk'
            },
            {
              name: 'localName',
              title: 'Lokalt navn',
              type: 'string',
              description: 'Landets navn på sitt eget språk'
            },
            {
              name: 'whenIndependent',
              title: 'Uavhengighetsår',
              type: 'string'
            },
            {
              name: 'majorFestival',
              title: 'Stor festival/høytid',
              type: 'string'
            },
            {
              name: 'nationalFlower',
              title: 'Nasjonalblomst',
              type: 'string'
            }
          ]
        },
        {
          name: 'funLearning',
          title: 'Moro og læring',
          type: 'object',
          fields: [
            {
              name: 'funFact',
              title: 'Morsomt faktum',
              type: 'text',
              description: 'En interessant fakta om landet'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'subcategory',
      title: 'Underkategori',
      type: 'reference',
      to: [{ type: 'subcategory' }],
      validation: Rule => Rule.required(),
      description: 'Velg hvilken underkategori dette bildet tilhører.'
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'displayImage'
    }
  }
}) 