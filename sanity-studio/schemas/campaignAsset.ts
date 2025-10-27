import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export default defineType({
  name: 'campaignAsset',
  title: 'Pop-up bilder',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Navn',
      type: 'string',
      description: 'Beskrivende navn for dette bildet (f.eks. "Bonus Tegninger Illustrasjon")',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      description: 'Bilde som skal vises i pop-up. Anbefalt størrelse: 400-600px bredde, 4:3 eller 16:9 ratio. WebP-format anbefales.',
      options: {
        hotspot: true,
        accept: 'image/webp,image/jpeg,image/png',
        metadata: ['lqip']
      },
      validation: Rule => Rule.required(),
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          description: 'Viktig for tilgjengelighet. Beskriv bildet for skjermlesere.',
          validation: Rule => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'description',
      title: 'Intern beskrivelse',
      type: 'text',
      description: 'Intern notat: Hva er dette bildet for? Hvilken kampanje skal det brukes i?',
      rows: 3
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for å organisere bilder (f.eks. "jul", "sommer", "bonus", "nedlastning")',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'campaignId',
      title: 'Kampanje ID (valgfritt)',
      type: 'string',
      description: 'Hvis bildet er knyttet til en spesifikk kampanje, skriv inn kampanje-ID her for referanse'
    }),
    defineField({
      name: 'isActive',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Er dette bildet i aktiv bruk?',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      campaignId: 'campaignId',
      isActive: 'isActive'
    },
    prepare(selection) {
      const { title, media, campaignId, isActive } = selection
      return {
        title: title,
        subtitle: campaignId ? `Kampanje: ${campaignId}${!isActive ? ' (inaktiv)' : ''}` : (!isActive ? '(inaktiv)' : ''),
        media: media
      }
    }
  }
})
