import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {schemaTypes} from './schemas/index'

export default defineConfig({
  name: 'default',
  title: 'Fargeleggingsside CMS',

  projectId: 'fn0kjvlp',
  dataset: 'production',

  plugins: [
    deskTool(),
    visionTool(),
    documentInternationalization({
      // Supported languages
      supportedLanguages: [
        {id: 'no', title: 'Norwegian (Bokmål)'},
        {id: 'sv', title: 'Swedish'}
      ],
      // Document types that support translation
      schemaTypes: ['drawingImage', 'category', 'subcategory'],
      // Optional: Allows bulk publishing all translations at once
      bulkPublish: true,
    })
  ],

  schema: {
    types: schemaTypes,
  },

  server: {
    port: 3334
  }
})
