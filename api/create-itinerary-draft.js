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

function buildDayPlan({
  dayNumber,
  destinationTitle,
  tripType,
  travelStyleSummary,
  whyThisDestination,
}) {
  const styleText = Array.isArray(travelStyleSummary) && travelStyleSummary.length
    ? travelStyleSummary.slice(0, 4).join(', ')
    : 'luxury travel'

  const reasonText = Array.isArray(whyThisDestination) && whyThisDestination.length
    ? whyThisDestination.slice(0, 2).join(' | ')
    : 'strong destination fit for this client'

  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and first immersion in ${destinationTitle}`,
      morning: `Arrival support, seamless transfer, and soft landing aligned with the client's ${tripType || 'holiday'} expectations.`,
      afternoon: `Check-in and recovery window with a slow introduction to ${destinationTitle}, shaped around ${styleText}.`,
      evening: `Curated first-night experience designed to reflect ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Signature experiences in ${destinationTitle}`,
      morning: `Core destination experience block matched to the client's preferences and strongest recommendation signals.`,
      afternoon: `Leisure-balanced exploration with premium pacing, local depth, and room for spontaneity.`,
      evening: `Elevated dinner or private experience that reinforces the destination's strongest luxury angle.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 3) {
    return {
      dayNumber,
      headline: `Deep dive into the destination rhythm`,
      morning: `A higher-personality experience block reflecting the client's travel style summary: ${styleText}.`,
      afternoon: `Optional wellness, culture, or private exploration depending on planner refinement.`,
      evening: `Atmospheric evening built around the destination's strongest emotional positioning.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Curated day ${dayNumber} in ${destinationTitle}`,
    morning: `Tailored morning programming based on destination strengths and client fit.`,
    afternoon: `Flexible midday experience balancing discovery, comfort, and luxury pacing.`,
    evening: `Premium evening sequence with room for planner customisation and supplier input.`,
    overnight: destinationTitle,
  }
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

    const body = req.body || {}
    const profileId = body.profileId || ''
    const destination = body.destination || null
    const profile = body.profile || null
    const recommendation = body.recommendation || null

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileId',
      })
    }

    if (!profile || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing profile or destination payload',
      })
    }

    const tripLengthDays = Number(profile.tripLengthDays || 0) || 5
    const title = `${profile.clientName || 'Client'} - ${destination.title || 'Destination'} Itinerary Draft`

    const days = Array.from({ length: tripLengthDays }, (_, index) =>
      buildDayPlan({
        dayNumber: index + 1,
        destinationTitle: destination.title || '',
        tripType: profile.tripType || '',
        travelStyleSummary: body.travelStyleSummary || [],
        whyThisDestination: recommendation?.matchReasons || [],
      })
    )

    const doc = {
      _type: 'itineraryDraft',
      title,
      clientTravelPersonalityId: profileId,
      clientName: profile.clientName || '',
      destinationTitle: destination.title || '',
      destinationSlug: destination.slug || '',
      tripType: profile.tripType || '',
      originCity: profile.originCity || '',
      tripLengthDays,
      travellerCount: Number(profile.travellerCount || 0) || null,
      budgetBand: profile.budgetBand || '',
      travelStyleSummary: Array.isArray(body.travelStyleSummary) ? body.travelStyleSummary : [],
      whyThisDestination: Array.isArray(recommendation?.matchReasons)
        ? recommendation.matchReasons.slice(0, 5)
        : [],
      plannerNotes: `Auto-generated first draft based on saved recommendation score${recommendation?.recommendationScore ? ` (${recommendation.recommendationScore})` : ''}.`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      days,
    }

    const created = await sanityWrite.create(doc)

    return res.status(200).json({
      success: true,
      id: created._id,
    })
  } catch (error) {
    console.error('CREATE_ITINERARY_DRAFT_ERROR', error)

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create itinerary draft',
    })
  }
}