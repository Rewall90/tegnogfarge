export default {
  name: 'category',
  title: 'Kategorier',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'text'
    },
    {
      name: 'image',
      title: 'Kategori-bilde',
      type: 'image',
      options: {
        hotspot: true
      }
    }
  ]
} 