import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Innlegg',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Hovedtittelen på innlegget',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unik URL-identifikator for innlegget',
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
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      description: 'Hovedbilde for innlegget. Anbefalt størrelse: 1200x800 pixler (3:2 ratio). På mobile enheter vises bildet større (85% av skjermbredden), på mellomstore skjermer 40%, og på store skjermer 25%. WebP-format anbefales.',
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
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      description: 'Kategorier som innlegget tilhører',
      of: [{type: 'reference', to: {type: 'category'}}]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert dato',
      type: 'datetime',
      description: 'Datoen innlegget ble publisert'
    }),
    defineField({
      name: 'body',
      title: 'Innhold',
      type: 'array',
      description: 'Hovedinnholdet i innlegget',
      of: [
        {
          type: 'block'
        },
        {
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
        }
      ]
    }),
    defineField({
      name: 'excerpt',
      title: 'Utdrag',
      type: 'text',
      description: 'En kort beskrivelse av innlegget'
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage'
    }
  }
}) 