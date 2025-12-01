import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export default defineType({
  name: 'weeklyCollection',
  title: 'Ukessamlinger',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. "Ukentlige Fargebilder - Januar 2025"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-identifikator (f.eks. "januar-2025")',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[æ]/g, 'ae')
          .replace(/[ø]/g, 'o')
          .replace(/[å]/g, 'a')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Kort introtekst som vises øverst på siden (valgfritt)',
      rows: 3
    }),
    defineField({
      name: 'publishedDate',
      title: 'Publiseringsdato',
      type: 'date',
      description: 'Når denne samlingen ble publisert',
      initialValue: () => new Date().toISOString().split('T')[0],
      options: {
        dateFormat: 'YYYY-MM-DD'
      }
    }),
    defineField({
      name: 'content',
      title: 'Innhold',
      type: 'array',
      description: 'Legg til tekst og tegnebilder. Dra og slipp for å endre rekkefølgen.',
      of: [
        // Rich text blocks
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Overskrift 2', value: 'h2' },
            { title: 'Overskrift 3', value: 'h3' }
          ],
          lists: [
            { title: 'Punktliste', value: 'bullet' },
            { title: 'Nummerert liste', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Fet', value: 'strong' },
              { title: 'Kursiv', value: 'em' }
            ]
          }
        },
        // Inline coloring image object (like Hugo coloringPage)
        {
          type: 'object',
          name: 'emailColoringImage',
          title: 'Tegnebilde',
          fields: [
            {
              name: 'title',
              title: 'Tittel',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'description',
              title: 'Beskrivelse',
              type: 'text',
              rows: 2,
              description: 'Kort beskrivelse av bildet (valgfritt)'
            },
            {
              name: 'image',
              title: 'Bilde',
              type: 'image',
              description: 'Fargebilde som vises på siden',
              options: {
                hotspot: true
              },
              validation: (Rule: any) => Rule.required(),
              fields: [
                {
                  name: 'alt',
                  title: 'Alt-tekst',
                  type: 'string',
                  description: 'Beskrivende tekst for bildet',
                  validation: (Rule: any) => Rule.required()
                }
              ]
            },
            {
              name: 'pdfFile',
              title: 'PDF-fil',
              type: 'file',
              description: 'Nedlastbar PDF-fil',
              options: {
                accept: 'application/pdf'
              },
              validation: (Rule: any) => Rule.required()
            }
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image'
            },
            prepare({ title, media }: any) {
              return {
                title: title || 'Uten tittel',
                subtitle: 'Fargeleggingsbilde',
                media
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'emailSentDate',
      title: 'E-post sendt dato',
      type: 'datetime',
      description: 'Når e-posten med denne samlingen ble sendt (fylles automatisk)',
      readOnly: true
    }),
    defineField({
      name: 'isActive',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Skal denne samlingen være synlig på nettsiden?',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      publishedDate: 'publishedDate',
      isActive: 'isActive'
    },
    prepare({ title, publishedDate, isActive }) {
      return {
        title: `${title}${!isActive ? ' (Inaktiv)' : ''}`,
        subtitle: publishedDate ? `Publisert: ${publishedDate}` : 'Ikke publisert ennå'
      }
    }
  }
})
