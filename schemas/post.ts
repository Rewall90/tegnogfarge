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
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      description: 'Hovedbilde for innlegget',
      options: {
        hotspot: true
      }
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
          }
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