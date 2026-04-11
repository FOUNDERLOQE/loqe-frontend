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

function normalizeTripType(value = '') {
  const tripType = value.toLowerCase()

  if (tripType.includes('honeymoon') || tripType.includes('romantic')) return 'romantic'
  if (tripType.includes('wellness')) return 'wellness'
  if (tripType.includes('family')) return 'family'
  if (tripType.includes('celebration')) return 'celebration'
  return 'general'
}

function buildStyleSummary(travelStyleSummary = []) {
  if (!Array.isArray(travelStyleSummary) || !travelStyleSummary.length) {
    return 'luxury travel'
  }

  return travelStyleSummary.slice(0, 4).join(', ')
}

function buildReasonSummary(whyThisDestination = []) {
  if (!Array.isArray(whyThisDestination) || !whyThisDestination.length) {
    return 'strong fit for this client'
  }

  return whyThisDestination.slice(0, 3).join(' • ')
}

function buildRomanticDay(dayNumber, destinationTitle, styleText, reasonText, totalDays) {
  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and intimate settling-in at ${destinationTitle}`,
      morning: `Arrival formalities, private transfer, and a seamless check-in designed to protect pace and privacy.`,
      afternoon: `Soft landing with time to decompress, settle into the stay, and absorb the destination atmosphere through a slow-luxury lens shaped by ${styleText}.`,
      evening: `A gentle first-night sequence with sunset drinks or a private dinner, positioned around ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === totalDays) {
    return {
      dayNumber,
      headline: `Final romantic moments and graceful departure`,
      morning: `A relaxed final morning with space for a spa treatment, breakfast ritual, or private moment before checkout.`,
      afternoon: `Departure support with a polished transition out of ${destinationTitle} and optional farewell experience if timing allows.`,
      evening: `Travel onward.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Signature couple experience`,
      morning: `A strong scenic or emotionally resonant experience designed to anchor the trip and create a memorable shared moment.`,
      afternoon: `Leisure-led exploration with private pacing, strong aesthetics, and enough flexibility to keep the day feeling effortless.`,
      evening: `A high-touch dinner or private setup that reinforces the destination’s strongest romantic positioning.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Slow luxury and shared discovery`,
    morning: `A curated morning experience built around intimacy, beauty, and pace rather than checklist tourism.`,
    afternoon: `Flexible luxury leisure with the option of wellness, local exploration, or private downtime depending on planner refinement.`,
    evening: `An atmospheric evening with strong emotional texture and premium service touchpoints.`,
    overnight: destinationTitle,
  }
}

function buildWellnessDay(dayNumber, destinationTitle, styleText, reasonText, totalDays) {
  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and reset into ${destinationTitle}`,
      morning: `Arrival support and smooth transfer with minimum friction and maximum recovery value.`,
      afternoon: `Check-in, room settling, and gentle decompression structured around a restorative start to the trip and aligned with ${styleText}.`,
      evening: `A calm first-night setup with early dinner, sleep optimisation, and low-stimulation pacing anchored by ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === totalDays) {
    return {
      dayNumber,
      headline: `Grounded close and departure`,
      morning: `A final slow morning with wellness continuation, optional therapy block, or time in nature before departure.`,
      afternoon: `Departure support with a calm, unhurried transition out of ${destinationTitle}.`,
      evening: `Travel onward.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Core wellness immersion`,
      morning: `Flagship wellness programming such as movement, recovery, spa, or guided reset depending on supplier refinement.`,
      afternoon: `Balanced leisure window to prevent the day from feeling over-programmed while still preserving premium structure.`,
      evening: `Quiet luxury dining and sleep-forward pacing that protects the restorative quality of the trip.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Wellness rhythm and destination calm`,
    morning: `A layered morning combining personal wellbeing, light exploration, and a strong sense of unforced pace.`,
    afternoon: `Open recovery window with optional nature, spa, or cultural softness depending on final itinerary curation.`,
    evening: `A low-friction, elegant evening sequence supporting calm, energy management, and destination atmosphere.`,
    overnight: destinationTitle,
  }
}

function buildFamilyDay(dayNumber, destinationTitle, styleText, reasonText, totalDays) {
  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and family settling-in at ${destinationTitle}`,
      morning: `Arrival handling, transfer, and check-in planned for ease, comfort, and minimal family friction.`,
      afternoon: `Property orientation and recovery time with space for everyone to settle into the trip at the right pace, shaped by ${styleText}.`,
      evening: `A soft first evening with easy dining and a low-pressure setup built around ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === totalDays) {
    return {
      dayNumber,
      headline: `Final family day and departure`,
      morning: `A flexible final morning with light activity, easy breakfast, and enough buffer for family logistics.`,
      afternoon: `Departure support with a stress-managed exit from ${destinationTitle}.`,
      evening: `Travel onward.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Signature shared experience`,
      morning: `A flagship family-friendly experience with strong memorability, practical pacing, and high enjoyment across the group.`,
      afternoon: `Recovery and leisure block with freedom for pool time, downtime, or optional secondary activity.`,
      evening: `A premium but family-sensible evening plan that preserves enjoyment without overstretching energy.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Balanced family exploration`,
    morning: `Destination discovery built around flexibility, comfort, and keeping the group engaged without overloading the day.`,
    afternoon: `A practical luxury block mixing leisure, food, and optional age-appropriate experiences.`,
    evening: `Relaxed evening flow with easy service, comfort, and enough space for the day to end well.`,
    overnight: destinationTitle,
  }
}

function buildCelebrationDay(dayNumber, destinationTitle, styleText, reasonText, totalDays) {
  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and elevated celebration setup`,
      morning: `Arrival and VIP-style transition into the property with strong first-impression value.`,
      afternoon: `Check-in, refresh, and celebration mood-setting shaped by ${styleText}.`,
      evening: `A strong opening evening with premium positioning and a first-night sequence aligned to ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === totalDays) {
    return {
      dayNumber,
      headline: `Closing celebration notes and departure`,
      morning: `A softer final morning to rebalance energy and allow graceful closure to the trip.`,
      afternoon: `Departure support and final premium touchpoints before leaving ${destinationTitle}.`,
      evening: `Travel onward.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Signature high-point experience`,
      morning: `The main statement experience of the trip, designed to create the strongest bragging-rights moment.`,
      afternoon: `Leisure and prep window allowing energy reset before the evening peak.`,
      evening: `A high-impact dinner, event, or private experience that anchors the celebration narrative.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Luxury pacing with celebration energy`,
    morning: `A polished experience block that maintains momentum without turning the trip into a rush.`,
    afternoon: `A premium leisure phase for spa, shopping, pool, or scenic downtime depending on final curation.`,
    evening: `An elevated evening built for atmosphere, service, and memorable storytelling.`,
    overnight: destinationTitle,
  }
}

function buildGeneralDay(dayNumber, destinationTitle, styleText, reasonText, totalDays) {
  if (dayNumber === 1) {
    return {
      dayNumber,
      headline: `Arrival and orientation in ${destinationTitle}`,
      morning: `Arrival support, transfer, and a smooth check-in process that establishes luxury pace from the start.`,
      afternoon: `Soft destination introduction aligned with ${styleText} and giving room for recovery and first impressions.`,
      evening: `An elegant first-night experience positioned around ${reasonText}.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === totalDays) {
    return {
      dayNumber,
      headline: `Final destination moments and departure`,
      morning: `A well-paced final morning with enough buffer for relaxation, light exploration, or one last signature moment.`,
      afternoon: `Departure transition with polished support and minimal friction.`,
      evening: `Travel onward.`,
      overnight: destinationTitle,
    }
  }

  if (dayNumber === 2) {
    return {
      dayNumber,
      headline: `Signature immersion day`,
      morning: `A flagship destination experience designed around the strongest fit points in the recommendation.`,
      afternoon: `Leisure-balanced exploration with premium pacing and strong local texture.`,
      evening: `An elevated dinner or private experience reinforcing the destination’s strongest sell-through angle.`,
      overnight: destinationTitle,
    }
  }

  return {
    dayNumber,
    headline: `Curated luxury flow in ${destinationTitle}`,
    morning: `A tailored morning experience shaped by destination strengths and the client’s core profile signals.`,
    afternoon: `Flexible midday structure balancing discovery, comfort, and premium pacing.`,
    evening: `A strong evening sequence with room for planner refinement and supplier-specific detail.`,
    overnight: destinationTitle,
  }
}

function buildDayPlan({
  dayNumber,
  destinationTitle,
  tripType,
  travelStyleSummary,
  whyThisDestination,
  totalDays,
}) {
  const normalizedTripType = normalizeTripType(tripType)
  const styleText = buildStyleSummary(travelStyleSummary)
  const reasonText = buildReasonSummary(whyThisDestination)

  if (normalizedTripType === 'romantic') {
    return buildRomanticDay(dayNumber, destinationTitle, styleText, reasonText, totalDays)
  }

  if (normalizedTripType === 'wellness') {
    return buildWellnessDay(dayNumber, destinationTitle, styleText, reasonText, totalDays)
  }

  if (normalizedTripType === 'family') {
    return buildFamilyDay(dayNumber, destinationTitle, styleText, reasonText, totalDays)
  }

  if (normalizedTripType === 'celebration') {
    return buildCelebrationDay(dayNumber, destinationTitle, styleText, reasonText, totalDays)
  }

  return buildGeneralDay(dayNumber, destinationTitle, styleText, reasonText, totalDays)
}

function buildPlannerNotes({ recommendationScore, whyThisDestination, tripType, destinationTitle }) {
  const reasons =
    Array.isArray(whyThisDestination) && whyThisDestination.length
      ? whyThisDestination.slice(0, 3).join(' • ')
      : 'No explicit reasons captured'

  return [
    `Auto-generated first-draft itinerary for ${destinationTitle}.`,
    recommendationScore ? `Recommendation score: ${recommendationScore}.` : null,
    tripType ? `Trip type lens: ${tripType}.` : null,
    `Core fit rationale: ${reasons}.`,
    'Planner should refine with actual supplier inventory, logistics, flight rhythm, and signature property/experience choices.',
  ]
    .filter(Boolean)
    .join(' ')
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

    const whyThisDestination = Array.isArray(recommendation?.matchReasons)
      ? recommendation.matchReasons.slice(0, 5)
      : []

    const days = Array.from({ length: tripLengthDays }, (_, index) =>
      buildDayPlan({
        dayNumber: index + 1,
        destinationTitle: destination.title || '',
        tripType: profile.tripType || '',
        travelStyleSummary: body.travelStyleSummary || [],
        whyThisDestination,
        totalDays: tripLengthDays,
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
      travelStyleSummary: Array.isArray(body.travelStyleSummary)
        ? body.travelStyleSummary
        : [],
      whyThisDestination,
      plannerNotes: buildPlannerNotes({
        recommendationScore: recommendation?.recommendationScore,
        whyThisDestination,
        tripType: profile.tripType || '',
        destinationTitle: destination.title || '',
      }),
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
