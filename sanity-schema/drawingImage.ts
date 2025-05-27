import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'drawingImage',
  title: 'Tegnebilder',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text'
    }),
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde (for visning)',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Dette bildet vises i kategorier og oversikter'
    }),
    defineField({
      name: 'svgContent',
      title: 'SVG-innhold (for fargelegging)',
      type: 'text',
      description: 'SVG-kode for digital fargelegging. Må inneholde class="fillable-area" på områder som kan fargelegges.',
      rows: 10
    }),
    defineField({
      name: 'downloadFile',
      title: 'Nedlastningsfil (PDF)',
      type: 'file',
      description: 'PDF-fil som brukere kan laste ned og skrive ut'
    }),
    defineField({
      name: 'hasDigitalColoring',
      title: 'Kan fargelegges digitalt',
      type: 'boolean',
      initialValue: false,
      description: 'Aktiver kun hvis SVG-innhold er lagt til og testet'
    }),
    defineField({
      name: 'suggestedColors',
      title: 'Foreslåtte farger',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ 
              name: 'name', 
              type: 'string', 
              title: 'Fargenavn',
              validation: (Rule) => Rule.required(),
              placeholder: 'f.eks. "Himmel blå"'
            }),
            defineField({ 
              name: 'hex', 
              type: 'string', 
              title: 'Hex-kode',
              validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/).error('Må være gyldig hex-kode (f.eks. #FF0000)'),
              placeholder: '#FF0000'
            })
          ],
          preview: {
            select: {
              title: 'name',
              hex: 'hex'
            },
            prepare(selection: { title?: string; hex?: string }) {
              return {
                title: selection.title || 'Unavngitt farge',
                subtitle: selection.hex || 'Ingen farge'
              }
            }
          }
        }
      ],
      description: 'Foreslå spesielle farger som passer godt til denne tegningen'
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'tags',
      title: 'Nøkkelord',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
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
      name: 'downloadCount',
      title: 'Antall nedlastninger',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatisk oppdatert'
    })
  ],
  
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      hasDigital: 'hasDigitalColoring',
      category: 'category.title',
      svgContent: 'svgContent'
    },
    prepare(selection: { title?: string; media?: any; hasDigital?: boolean; category?: string; svgContent?: string }) {
      const { title, media, hasDigital, category, svgContent } = selection
      
      // Tell fargeleggbare områder
      let colorableAreas = 0
      if (svgContent && typeof svgContent === 'string') {
        const matches = svgContent.match(/class="fillable-area"/g)
        colorableAreas = matches ? matches.length : 0
      }
      
      let subtitle = category || 'Ingen kategori'
      
      if (hasDigital && colorableAreas > 0) {
        subtitle += ` 🎨 ${colorableAreas} fargeleggbare områder`
      } else if (hasDigital) {
        subtitle += ' 🎨 Digital fargelegging (ikke testet)'
      } else {
        subtitle += ' 📄 Kun PDF'
      }
      
      return {
        title: title,
        subtitle: subtitle,
        media: media
      }
    }
  },
  
  orderings: [
    {
      title: 'Nyeste først',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }]
    },
    {
      title: 'Tittel A-Å',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    },
    {
      title: 'Kategori',
      name: 'categoryAsc',
      by: [
        { field: 'category.title', direction: 'asc' },
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
}) 