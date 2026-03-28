import { createClient } from '@sanity/client'

const sanityWrite = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET,
  apiVersion:
    process.env.SANITY_API_VERSION ||
    process.env.VITE_SANITY_API_VERSION ||
    '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}

function toClientType(payload) {
  const count = Number(payload?.travellerCount || 1)
  const tripType = (payload?.tripType || '').toLowerCase()

  if (tripType.includes('family')) return 'family'
  if (count === 1) return 'individual'
  if (count === 2) return 'couple'
  if (count > 2) return 'group'
  return 'individual'
}

function buildSignalTags(payload) {
  const profile = payload?.clientProfile || {}
  const tags = []

  if ((profile.tripVibeWords || '').toLowerCase().includes('romantic')) tags.push('romantic')
  if ((profile.tripVibeWords || '').toLowerCase().includes('spiritual')) tags.push('spiritual')
  if ((profile.tripVibeWords || '').toLowerCase().includes('indulgent')) tags.push('luxury')
  if ((profile.travelEnergyDrink || '').toLowerCase().includes('restorative')) tags.push('wellness')
  if ((profile.travelEnergyDrink || '').toLowerCase().includes('energetic')) tags.push('high-energy')
  if ((profile.wouldYouRatherOceanOrMountain || '') === 'Ocean waves') tags.push('beach')
  if ((profile.wouldYouRatherOceanOrMountain || '') === 'Mountain air') tags.push('mountain')
  if ((profile.wouldYouRatherStreetFoodOrMichelin || '') === 'Michelin star dining') tags.push('fine-dining')
  if ((profile.wouldYouRatherStreetFoodOrMichelin || '') === 'Street food') tags.push('local-food')
  if ((profile.travelExcitement || []).includes('Luxury indulgence')) tags.push('luxury')
  if ((profile.travelExcitement || []).includes('Wellness & retreats')) tags.push('wellness')
  if ((profile.travelExcitement || []).includes('Cultural immersion')) tags.push('culture')
  if ((profile.travelExcitement || []).includes('Adventure sports')) tags.push('adventure')

  return [...new Set(tags)]
}

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
    const profile = payload.clientProfile || {}

    const {
      clientName,
      tripType,
      originCity,
      tripLengthDays,
      travellerCount,
      budgetBand,
      notes,
      autoSummary,
    } = payload

    const title = clientName
      ? `${clientName} - Travel Brief`
      : 'Untitled Travel Brief'

    let tripBriefResult = null
    let clientProfileResult = null

    // WRITE 1: tripBrief
    try {
      const tripBriefDoc = {
        _type: 'tripBrief',
        title,
        clientName: clientName || '',
        tripType: tripType || '',
        originCity: originCity || '',
        tripLengthDays: Number(tripLengthDays) || null,
        travellerCount: Number(travellerCount) || null,
        budgetBand: budgetBand || '',
        notes: notes || '',
        autoSummary: autoSummary || '',
        createdAt: new Date().toISOString(),
      }

      tripBriefResult = await sanityWrite.create(tripBriefDoc)
    } catch (tripBriefError) {
      console.error('TRIP_BRIEF_CREATE_ERROR', tripBriefError)
      return res.status(500).json({
        success: false,
        step: 'tripBrief',
        error: tripBriefError?.message || 'Failed while creating tripBrief',
      })
    }

    // WRITE 2: clientProfile
    try {
      const fullName = clientName || profile.greetName || 'Untitled Client'

      const clientProfileDoc = {
        _type: 'clientProfile',
        fullName,
        slug: {
          _type: 'slug',
          current: slugify(fullName),
        },
        cityOfResidence: profile.currentLocation || originCity || '',
        clientType: toClientType(payload),
        relationshipManagerNotes: notes || '',
        tripType: tripType || '',
        tripLengthDays: Number(tripLengthDays) || null,
        travellerCount: Number(travellerCount) || null,
        budgetBand: budgetBand || '',
        originCity: originCity || '',
        autoSummary: autoSummary || '',
        travelSignalTags: buildSignalTags(payload),
        profilePayload: profile,
        createdAt: new Date().toISOString(),
        status: 'active',
      }

      clientProfileResult = await sanityWrite.create(clientProfileDoc)
    } catch (clientProfileError) {
      console.error('CLIENT_PROFILE_CREATE_ERROR', clientProfileError)
      return res.status(500).json({
        success: false,
        step: 'clientProfile',
        error: clientProfileError?.message || 'Failed while creating clientProfile',
        tripBriefId: tripBriefResult?._id || null,
      })
    }

    return res.status(200).json({
      success: true,
      tripBriefId: tripBriefResult._id,
      clientProfileId: clientProfileResult._id,
    })
  } catch (error) {
    console.error('CREATE_TRIP_BRIEF_ERROR', error)
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create trip brief',
    })
  }
}