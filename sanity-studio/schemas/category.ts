import { defineField, defineType } from 'sanity'
import { FolderIcon } from '@sanity/icons'

export default defineType({
  name: 'category',
  title: 'Kategorier',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Hovedtittelen på kategorien',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unik URL-identifikator for kategorien',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .replace(/\s+/g, '-')           // Replace spaces with hyphens
          .replace(/[æ]/g, 'ae')          // Replace æ with ae
          .replace(/[ø]/g, 'o')           // Replace ø with o
          .replace(/[å]/g, 'a')           // Replace å with a
          .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric characters except hyphens
          .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '')          // Remove hyphens from start and end
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Detaljert beskrivelse av kategorien'
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Tittel',
      type: 'string',
      description: 'Tittel som vil vises i søkemotorer og JSON-LD (hvis tom, brukes vanlig tittel)'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Beskrivelse',
      type: 'text',
      description: 'Beskrivelse som vil vises i søkemotorer og JSON-LD (hvis tom, brukes vanlig beskrivelse)'
    }),
    defineField({
      name: 'image',
      title: 'Kategori-bilde',
      description: 'Hovedbilde for kategorien. Anbefalt størrelse: 600x800 pixler (3:4 ratio). På mobile enheter vises bildet større (85% av skjermbredden), på mellomstore skjermer 40%, og på store skjermer 25%. WebP-format anbefales.',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt-tekst',
          description: 'Beskrivende tekst for bildet (viktig for SEO og tilgjengelighet)',
          validation: Rule => Rule.required().min(10).max(150)
        })
      ]
    }),
    defineField({
      name: 'icon',
      title: 'Ikon',
      type: 'string',
      description: 'Emoji eller ikon som representerer kategorien'
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Rekkefølgen kategorien skal vises i',
      initialValue: 0
    }),
    defineField({
      name: 'isActive',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Angir om kategorien er aktiv og synlig på nettsiden',
      initialValue: true
    }),
    defineField({
      name: 'featured',
      title: 'Fremhevet',
      type: 'boolean',
      description: 'Angir om kategorien skal fremheves på forsiden',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      isActive: 'isActive',
      featured: 'featured'
    },
    prepare({ title, media, isActive, featured }) {
      return {
        title: `${title}${!isActive ? ' (Inaktiv)' : ''}${featured ? ' ⭐' : ''}`,
        media
      }
    }
  }
}) 