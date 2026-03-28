import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'eiyy203r',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})
