import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity-schema';

// Bruker den konkrete prosjekt-ID'en
const projectId = 'fn0kjvlp';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Fargeleggingsside CMS',
  projectId,
  dataset,
  plugins: [
    deskTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      // Du kan legge til tilpassede komponenter for Studio her
    }
  }
}); 