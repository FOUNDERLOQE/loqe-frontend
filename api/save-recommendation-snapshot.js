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
    const summaryTitle = body.summaryTitle || 'Recommendation Snapshot'

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileId',
      })
    }

    if (!topDestinations.length) {
      return res.status(400).json({
        success: false,
        error: 'No top destinations provided',
      })
    }

    const snapshot = {
      _key: `snapshot-${Date.now()}`,
      createdAt: new Date().toISOString(),
      summaryTitle,
      topDestinations: topDestinations.slice(0, 6).map((item, index) => ({
        _key: `destination-${Date.now()}-${index}`,
        destinationId: item._id || item.destinationId || '',
        title: item.title || '',
        slug: item.slug?.current || item.slug || '',
        country: item.country || '',
        region: item.region || '',
        budgetBand: item.budgetBand || '',
        recommendationScore: Number(item.recommendationScore || 0),
        matchReasons: Array.isArray(item.matchReasons) ? item.matchReasons.slice(0, 4) : [],
        matchWarnings: Array.isArray(item.matchWarnings) ? item.matchWarnings.slice(0, 3) : [],
      })),
    }

    const result = await sanityWrite
      .patch(profileId)
      .setIfMissing({ recommendationSnapshots: [] })
      .append('recommendationSnapshots', [snapshot])
      .commit()

    return res.status(200).json({
      success: true,
      id: result._id,
      snapshotCreatedAt: snapshot.createdAt,
    })
  } catch (error) {
    console.error('SAVE_RECOMMENDATION_SNAPSHOT_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to save recommendation snapshot',
    })
  }
}
