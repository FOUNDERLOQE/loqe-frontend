import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function makeDraftTitle(profile = {}, destination = {}) {
  const clientName = normalizeString(profile.clientName)
  const destinationTitle = normalizeString(destination.title)

  if (clientName && destinationTitle) {
    return `${clientName} - ${destinationTitle} Itinerary Draft`
  }

  if (destinationTitle) {
    return `${destinationTitle} Itinerary Draft`
  }

  if (clientName) {
    return `${clientName} Itinerary Draft`
  }

  return 'Itinerary Draft'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_DATASET || !process.env.SANITY_API_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Missing Sanity environment variables',
      })
    }

    const {
      profileId,
      profile = {},
      destination = {},
      recommendation = {},
      travelStyleSummary = [],
    } = req.body || {}

    const normalizedProfileId = normalizeString(profileId)

    if (!normalizedProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileId',
      })
    }

    const existingProfile = await sanity.fetch(
      `*[_type == "clientProfile" && _id == $profileId][0]{ _id, fullName, clientName }`,
      { profileId: normalizedProfileId }
    )

    if (!existingProfile?._id) {
      return res.status(404).json({
        success: false,
        error: 'Client profile not found',
      })
    }

    const destinationTitle = normalizeString(destination.title)
    const destinationSlug =
      typeof destination.slug === 'object'
        ? normalizeString(destination.slug.current)
        : normalizeString(destination.slug)

    const tripLengthDays =
      normalizeNumber(profile.tripLengthDays) ??
      normalizeNumber(profile.tripLength) ??
      null

    const travellerCount =
      normalizeNumber(profile.travellerCount) ??
      normalizeNumber(profile.partySize) ??
      null

    const recommendationScore = normalizeNumber(recommendation.recommendationScore) ?? 0

    const cleanMatchReasons = Array.isArray(recommendation.matchReasons)
      ? recommendation.matchReasons.filter(Boolean).map((item) => String(item).trim())
      : []

    const cleanTravelStyleSummary = Array.isArray(travelStyleSummary)
      ? travelStyleSummary.filter(Boolean).map((item) => String(item).trim())
      : []

    const title = makeDraftTitle(profile, destination)
    const summaryParts = [
      normalizeString(profile.tripType),
      destinationTitle,
      normalizeString(destination.region),
      normalizeString(destination.country),
    ].filter(Boolean)

    const doc = {
      _type: 'itineraryDraft',

      title,
      tripName: normalizeString(profile.tripName) || destinationTitle || title,
      status: 'draft',
      version: 1,

      summary: summaryParts.length
        ? `Draft for ${summaryParts.join(' • ')}`
        : 'Initial itinerary draft',

      notes: normalizeString(profile.notes),

      clientProfile: {
        _type: 'reference',
        _ref: normalizedProfileId,
      },

      profileSnapshot: {
        clientName:
          normalizeString(profile.clientName) ||
          normalizeString(existingProfile.fullName) ||
          normalizeString(existingProfile.clientName),
        tripType: normalizeString(profile.tripType),
        originCity: normalizeString(profile.originCity),
        tripLengthDays,
        travellerCount,
        budgetBand: normalizeString(profile.budgetBand),
      },

      destinationSnapshot: {
        title: destinationTitle,
        slug: destinationSlug,
        country: normalizeString(destination.country),
        region: normalizeString(destination.region),
        budgetBand: normalizeString(destination.budgetBand),
      },

      recommendationSnapshot: {
        recommendationScore,
        matchReasons: cleanMatchReasons,
      },

      travelStyleSummary: cleanTravelStyleSummary,

      dayCount: tripLengthDays,
      nights: tripLengthDays,

      updatedAt: new Date().toISOString(),
    }

    const created = await sanity.create(doc)

    return res.status(200).json({
      success: true,
      draftId: created._id,
      message: 'Itinerary draft created successfully',
    })
  } catch (error) {
    console.error('CREATE_ITINERARY_DRAFT_API_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create itinerary draft',
    })
  }
}