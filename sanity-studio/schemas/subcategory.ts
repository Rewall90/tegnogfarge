import { defineField, defineType } from 'sanity'
import { FolderIcon } from '@sanity/icons'

export default defineType({
  name: 'subcategory',
  title: 'Underkategorier',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Hovedtittelen på underkategorien',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unik URL-identifikator for underkategorien',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Detaljert beskrivelse av underkategorien'
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
      name: 'parentCategory',
      title: 'Hovedkategori',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Hovedkategorien denne underkategorien tilhører',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Rekkefølgen underkategorien skal vises i',
      initialValue: 0
    }),
    defineField({
      name: 'isActive',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Angir om underkategorien er aktiv og synlig på nettsiden',
      initialValue: true
    }),
    defineField({
      name: 'featuredImage',
      title: 'Fremhevet bilde',
      type: 'image',
      description: 'Bilde som vises i kategori-oversikter. Anbefalt størrelse: 600x800 pixler (3:4 ratio). På mobile enheter vises bildet større (85% av skjermbredden), på mellomstore skjermer 40%, og på store skjermer 25%. WebP-format anbefales.',
      options: {
        hotspot: true,
        accept: 'image/webp,image/jpeg'
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Viktig for SEO og tilgjengelighet. Beskriv bildet for skjermlesere.',
          validation: Rule => Rule.required().min(10).max(150)
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      parent: 'parentCategory.title',
      isActive: 'isActive'
    },
    prepare({ title, media, parent, isActive }) {
      return {
        title: `${title}${!isActive ? ' (Inaktiv)' : ''}`,
        subtitle: parent ? `${parent}` : undefined,
        media
      }
    }
  }
}) 