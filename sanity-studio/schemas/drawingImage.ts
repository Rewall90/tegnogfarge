import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export default defineType({
  name: 'drawingImage',
  title: 'Tegnebilder',
  type: 'document',
  icon: ImageIcon,
  fields: [
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
        maxLength: 96
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
        hotspot: true
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
        accept: 'image/webp,image/jpeg'
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
        accept: 'image/webp'
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
      name: 'tags',
      title: 'Nøkkelord',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'F.eks. romvesen, måne, kikkert'
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