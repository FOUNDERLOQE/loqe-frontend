import { createClient } from '@sanity/client'

const sanityWrite = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  apiVersion: process.env.VITE_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      clientName,
      tripType,
      originCity,
      tripLengthDays,
      travellerCount,
      budgetBand,
      preferredClimate,
      travelStyle,
      desiredExperiences,
      mustAvoid,
      notes,
      autoSummary,
    } = req.body || {}

    const title = clientName
      ? `${clientName} - Travel Brief`
      : 'Untitled Travel Brief'

    const doc = {
      _type: 'tripBrief',
      title,
      clientName: clientName || '',
      tripType: tripType || '',
      originCity: originCity || '',
      tripLengthDays: Number(tripLengthDays) || null,
      travellerCount: Number(travellerCount) || null,
      budgetBand: budgetBand || '',
      preferredClimate: Array.isArray(preferredClimate) ? preferredClimate : [],
      travelStyle: Array.isArray(travelStyle) ? travelStyle : [],
      desiredExperiences: Array.isArray(desiredExperiences)
        ? desiredExperiences
        : [],
      mustAvoid: Array.isArray(mustAvoid) ? mustAvoid : [],
      notes: notes || '',
      autoSummary: autoSummary || '',
      createdAt: new Date().toISOString(),
    }

    const result = await sanityWrite.create(doc)

    return res.status(200).json({
      success: true,
      id: result._id,
    })
  } catch (error) {
    console.error('CREATE_TRIP_BRIEF_ERROR', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trip brief',
    })
  }
}