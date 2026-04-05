import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET,
  apiVersion:
    process.env.SANITY_API_VERSION ||
    process.env.VITE_SANITY_API_VERSION ||
    '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    if (!process.env.SANITY_WRITE_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SANITY_WRITE_TOKEN in environment variables',
      })
    }

    const body = req.body || {}

    const doc = {
      _type: 'clientTravelPersonality',
      title: body.title || (body.clientName ? `${body.clientName} - Travel Brief` : 'Untitled Travel Brief'),
      clientName: body.clientName || '',
      tripType: body.tripType || '',
      originCity: body.originCity || '',
      tripLengthDays: Number(body.tripLengthDays || 0) || null,
      travellerCount: Number(body.travellerCount || 0) || null,
      budgetBand: body.budgetBand || '',
      notes: body.notes || '',
      autoSummary: body.autoSummary || '',
      clientProfileSnapshot: body.clientProfileSnapshot || '',
      status: 'new',
      submittedAt: new Date().toISOString(),
    }

    const created = await client.create(doc)

    return res.status(200).json({
      ok: true,
      id: created._id,
    })
  } catch (error) {
    console.error('Save clientTravelPersonality failed:', error)

    return res.status(500).json({
      ok: false,
      error: error.message || 'Unknown error',
    })
  }
}