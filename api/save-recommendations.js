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

    const body = req.body || {}
    const profileId = body.profileId || ''
    const recommendations = Array.isArray(body.recommendations) ? body.recommendations : []

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileId',
      })
    }

    if (!recommendations.length) {
      return res.status(400).json({
        success: false,
        error: 'No recommendations provided',
      })
    }

    const snapshot = {
      _key: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      topDestinations: recommendations.map((item) => ({
        _key: `${item.destinationId || item._id || item.title}-${Math.random().toString(36).slice(2, 8)}`,
        destinationId: item.destinationId || item._id || '',
        title: item.title || '',
        slug: item.slug || '',
        country: item.country || '',
        region: item.region || '',
        budgetBand: item.budgetBand || '',
        recommendationScore: Number(item.recommendationScore || 0),
        matchReasons: Array.isArray(item.matchReasons) ? item.matchReasons : [],
        matchWarnings: Array.isArray(item.matchWarnings) ? item.matchWarnings : [],
      })),
    }

    const updated = await sanityWrite
      .patch(profileId)
      .setIfMissing({ recommendationSnapshots: [] })
      .append('recommendationSnapshots', [snapshot])
      .set({ status: 'recommended' })
      .commit()

    return res.status(200).json({
      success: true,
      id: updated._id,
    })
  } catch (error) {
    console.error('SAVE_RECOMMENDATIONS_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to save recommendations',
    })
  }
}