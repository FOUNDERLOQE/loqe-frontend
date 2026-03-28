import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}

    const doc = {
      _type: 'clientTravelPersonality',
      clientName: body.clientName || '',
      company: body.company || '',
      email: body.email || '',
      phone: body.phone || '',
      tripPurpose: body.tripPurpose || '',
      groupType: body.groupType || '',
      travelerCount: Number(body.travelerCount || 0),
      budgetBand: body.budgetBand || '',
      pace: body.pace || '',
      preferredDestinations: Array.isArray(body.preferredDestinations)
        ? body.preferredDestinations
        : [],
      vibePreferences: Array.isArray(body.vibePreferences)
        ? body.vibePreferences
        : [],
      hotelStyle: body.hotelStyle || '',
      foodPreferences: Array.isArray(body.foodPreferences)
        ? body.foodPreferences
        : [],
      activityPreferences: Array.isArray(body.activityPreferences)
        ? body.activityPreferences
        : [],
      specialNotes: body.specialNotes || '',
      signals: Array.isArray(body.signals) ? body.signals : [],
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