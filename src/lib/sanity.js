import { createClient } from '@sanity/client'

const baseClient = createClient({
  projectId: 'eiyy203r',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export const client = baseClient
export const sanity = baseClient
export default baseClient