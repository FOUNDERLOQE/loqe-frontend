import { createClient } from '@sanity/client'

const baseClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'eiyy203r',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
})

export const client = baseClient
export const sanity = baseClient
export default baseClient