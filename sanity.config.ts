import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from '@schemas/index';
import { presentationTool } from 'sanity/presentation';
import { SANITY_DRAFT_MODE_SECRET } from './src/lib/sanity.secrets';
import type { SanityDocument } from 'sanity';

// Bruker den konkrete prosjekt-ID'en
export const projectId = 'fn0kjvlp';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = "2024-06-05"

export default defineConfig({
  name: 'default',
  title: 'Fargeleggingsside CMS',
  projectId,
  dataset,
  plugins: [
    deskTool(),
    presentationTool({
      previewUrl: `/api/draft?secret=${SANITY_DRAFT_MODE_SECRET}`
    }),
    visionTool({ defaultApiVersion: apiVersion }),
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