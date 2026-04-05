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
    const topDestinations = Array.isArray(body.topDestinations) ? body.topDestinations : []

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileId',
      })
    }

    const snapshot = {
      savedAt: new Date().toISOString(),
      topDestinations: topDestinations.map((item) => ({
        destinationId: item.destinationId || '',
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

    await sanityWrite
      .patch(profileId)
      .setIfMissing({ recommendationSnapshots: [] })
      .append('recommendationSnapshots', [snapshot])
      .set({ status: 'recommended' })
      .commit()

    return res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.error('SAVE_RECOMMENDATION_SNAPSHOT_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to save recommendation snapshot',
    })
  }
}