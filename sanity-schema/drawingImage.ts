export default {
  name: 'drawingImage',
  title: 'Tegnebilder',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'text'
    },
    {
      name: 'mainImage',
      title: 'Hovedbilde (for visning)',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'outlineImage',
      title: 'Omriss-bilde (for online fargelegging)',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'downloadFile',
      title: 'Nedlastningsfil (PDF)',
      type: 'file'
    },
    {
      name: 'category',
      title: 'Kategori',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    {
      name: 'tags',
      title: 'Nøkkelord',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'canColorOnline',
      title: 'Kan fargelegges online',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'downloadCount',
      title: 'Antall nedlastninger',
      type: 'number',
      initialValue: 0,
      readOnly: true
    }
  ]
} 