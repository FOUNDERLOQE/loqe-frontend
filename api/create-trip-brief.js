import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET,
  apiVersion:
    process.env.SANITY_API_VERSION ||
    process.env.VITE_SANITY_API_VERSION ||
    '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
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

function buildFullName(body) {
  return (
    normalizeString(body.clientName) ||
    normalizeString(body.fullName) ||
    'Untitled Client'
  )
}

function buildSlugSource(body) {
  return (
    normalizeString(body.clientName) ||
    normalizeString(body.fullName) ||
    'untitled-client'
  )
}

function inferClientType(body, profilePayload) {
  if (normalizeString(body.clientType)) return normalizeString(body.clientType)

  const travellerCount = normalizeNumber(body.travellerCount)
  const tinyHumans = normalizeString(profilePayload?.tinyHumansOrPets).toLowerCase()
  const tripType = normalizeString(body.tripType).toLowerCase()

  if (tripType.includes('family') || tinyHumans.includes('child')) return 'family'
  if (travellerCount === 2) return 'couple'
  if (travellerCount && travellerCount > 2) return 'group'
  return 'individual'
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    if (!process.env.SANITY_WRITE_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SANITY_WRITE_TOKEN in environment variables',
      })
    }

    const body = req.body || {}
    const profilePayload = body.clientProfile || body.profilePayload || {}

    const fullName = buildFullName(body)
    const slugSource = buildSlugSource(body)

    const doc = {
      _type: 'clientProfile',

      fullName,
      slug: {
        _type: 'slug',
        current: slugSource
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 96) || 'untitled-client',
      },

      clientName: normalizeString(body.clientName),
      email: normalizeString(body.email),
      phone: normalizeString(body.phone),
      nationality: normalizeString(body.nationality),
      cityOfResidence: normalizeString(body.cityOfResidence),
      clientType: inferClientType(body, profilePayload),

      tripType: normalizeString(body.tripType),
      tripLengthDays: normalizeNumber(body.tripLengthDays),
      travellerCount: normalizeNumber(body.travellerCount),
      budgetBand: normalizeString(body.budgetBand),
      originCity: normalizeString(body.originCity),
      autoSummary: normalizeString(body.autoSummary),
      relationshipManagerNotes: normalizeString(body.notes),
      createdAt: new Date().toISOString(),

      travelSignalTags: [
        normalizeString(body.tripType),
        normalizeString(profilePayload.travelStyle),
        normalizeString(profilePayload.luxuryStyle),
        normalizeString(profilePayload.vibe),
      ].filter(Boolean),

      profilePayload: {
        greetName: normalizeString(profilePayload.greetName),
        preferredPronouns: normalizeString(profilePayload.preferredPronouns),
        currentLocation: normalizeString(profilePayload.currentLocation),
        bestWayToReach: normalizeString(profilePayload.bestWayToReach),
        nextEscapeWindow: normalizeString(profilePayload.nextEscapeWindow),
        tinyHumansOrPets: normalizeString(profilePayload.tinyHumansOrPets),

        liveNow: normalizeString(profilePayload.liveNow),
        livingSituation: normalizeString(profilePayload.livingSituation),
        careerCurrentFocus: normalizeString(profilePayload.careerCurrentFocus),
        typicalEscapeWindows: normalizeString(profilePayload.typicalEscapeWindows),
        averageTripLengthPreference: normalizeString(profilePayload.averageTripLengthPreference),
        recentMajorLifeChanges: normalizeString(profilePayload.recentMajorLifeChanges),

        travelEnergyDrink: normalizeString(profilePayload.travelEnergyDrink),
        wouldYouRatherOceanOrMountain: normalizeString(profilePayload.wouldYouRatherOceanOrMountain),
        wouldYouRatherExploreOrLounge: normalizeString(profilePayload.wouldYouRatherExploreOrLounge),
        wouldYouRatherStreetFoodOrMichelin: normalizeString(profilePayload.wouldYouRatherStreetFoodOrMichelin),
        wouldYouRatherPlanOrFlow: normalizeString(profilePayload.wouldYouRatherPlanOrFlow),
        preferredClimate: normalizeString(profilePayload.preferredClimate),
        idealTravelSoundtrack: normalizeString(profilePayload.idealTravelSoundtrack),
        holidayMovie: normalizeString(profilePayload.holidayMovie),
        holidayMovieOther: normalizeString(profilePayload.holidayMovieOther),
        travelExcitement: Array.isArray(profilePayload.travelExcitement)
          ? profilePayload.travelExcitement.filter(Boolean)
          : [],
        tripVibeWords: normalizeString(profilePayload.tripVibeWords),
        travelSpiritAnimal: normalizeString(profilePayload.travelSpiritAnimal),

        accommodationMustHaves: normalizeString(profilePayload.accommodationMustHaves),
        absoluteDealBreakers: normalizeString(profilePayload.absoluteDealBreakers),
        preferredAirlinesLoyaltyPrograms: normalizeString(profilePayload.preferredAirlinesLoyaltyPrograms),
        dietaryPreferencesRestrictions: normalizeString(profilePayload.dietaryPreferencesRestrictions),
        healthMobilityConsiderations: normalizeString(profilePayload.healthMobilityConsiderations),

        favoritePastDestinationsWhy: normalizeString(profilePayload.favoritePastDestinationsWhy),
        wontReturnDestinationsWhy: normalizeString(profilePayload.wontReturnDestinationsWhy),
        mostMemorableExperiencesEver: normalizeString(profilePayload.mostMemorableExperiencesEver),
        repeatDestinationComfortZones: normalizeString(profilePayload.repeatDestinationComfortZones),

        top5BucketListDestinations: normalizeString(profilePayload.top5BucketListDestinations),
        dreamExperiences: normalizeString(profilePayload.dreamExperiences),
        specialEventsTravelFor: normalizeString(profilePayload.specialEventsTravelFor),
        surpriseTolerance: normalizeString(profilePayload.surpriseTolerance),

        favoriteCuisinesDishes: normalizeString(profilePayload.favoriteCuisinesDishes),
        preferredWineDrinkChoices: normalizeString(profilePayload.preferredWineDrinkChoices),
        favoriteColourPaletteInInteriors: normalizeString(profilePayload.favoriteColourPaletteInInteriors),
        fashionStyleReference: normalizeString(profilePayload.fashionStyleReference),
        hobbiesPassions: normalizeString(profilePayload.hobbiesPassions),
        musicPlaylistForTravels: normalizeString(profilePayload.musicPlaylistForTravels),

        annualReviewLog: Array.isArray(profilePayload.annualReviewLog)
          ? profilePayload.annualReviewLog
          : [],
      },
    }

    const created = await client.create(doc)

    return res.status(200).json({
      ok: true,
      id: created._id,
      type: created._type,
    })
  } catch (error) {
    console.error('Save clientProfile failed:', error)

    return res.status(500).json({
      ok: false,
      error: error.message || 'Unknown error',
    })
  }
}