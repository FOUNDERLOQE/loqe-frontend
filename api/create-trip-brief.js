// IMPORTANT:
// This schema and API payload must stay aligned.
// If you add, remove, or rename fields here,
// update BOTH:
// 1) schemaTypes/clientTravelPersonality.js
// 2) api/create-trip-brief.js
// 3) frontend intake payload if needed
import { createClient } from '@sanity/client'

const sanityWrite = createClient({
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

  console.log('ENV CHECK', {
    hasProjectId: Boolean(process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID),
    hasDataset: Boolean(process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET),
    hasApiVersion: Boolean(process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION),
    hasWriteToken: Boolean(process.env.SANITY_WRITE_TOKEN),
  })

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    if (!process.env.SANITY_WRITE_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Missing SANITY_WRITE_TOKEN in environment variables',
      })
    }

    if (!(process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID)) {
      return res.status(500).json({
        success: false,
        error: 'Missing SANITY_PROJECT_ID or VITE_SANITY_PROJECT_ID',
      })
    }

    if (!(process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET)) {
      return res.status(500).json({
        success: false,
        error: 'Missing SANITY_DATASET or VITE_SANITY_DATASET',
      })
    }

    const payload = req.body || {}

    const {
      title,
      clientName,
      tripType,
      originCity,
      tripLengthDays,
      travellerCount,
      budgetBand,
      notes,
      autoSummary,
      clientProfile,
    } = payload

    const doc = {
      _type: 'clientTravelPersonality',
      title: title || (clientName ? `${clientName} - Travel Brief` : 'Untitled Travel Brief'),
      clientName: clientName || '',
      tripType: tripType || '',
      originCity: originCity || '',
      tripLengthDays: Number(tripLengthDays) || null,
      travellerCount: Number(travellerCount) || null,
      budgetBand: budgetBand || '',
      notes: notes || '',
      autoSummary: autoSummary || '',
      clientProfileSnapshot: JSON.stringify(clientProfile || {}, null, 2),
      status: 'new',
      submittedAt: new Date().toISOString(),
    }

    console.log('ABOUT TO CREATE clientTravelPersonality', doc)

    const created = await sanityWrite.create(doc)

    console.log('CREATED clientTravelPersonality RESPONSE', created)

    return res.status(200).json({
      success: true,
      id: created._id,
    })
  } catch (error) {
    console.error('CREATE_TRIP_BRIEF_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create trip brief',
    })
  }
}