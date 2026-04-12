export function profileToSignals(profileDocument) {
  const payload = profileDocument?.profilePayload || profileDocument?.clientProfile || {}

  const signals = {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand:
      profileDocument?.budgetBand ||
      profileDocument?.budgetRange ||
      profileDocument?.budget ||
      '',
    tripType:
      profileDocument?.tripType ||
      profileDocument?.purposeOfTravel ||
      '',
    tripLengthDays:
      profileDocument?.tripLengthDays ||
      profileDocument?.tripLength ||
      profileDocument?.duration ||
      profileDocument?.nights ||
      profileDocument?.days ||
      null,
    travellerCount:
      profileDocument?.travellerCount ||
      profileDocument?.partySize ||
      profileDocument?.travelers ||
      null,

    themeWeights: {
      luxury: 0,
      romance: 0,
      wellness: 0,
      adventure: 0,
      culture: 0,
      food: 0,
      family: 0,
      nightlife: 0,
      nature: 0,
      shopping: 0,
      slowTravel: 0,
      privacy: 0,
      beach: 0,
      mountain: 0,
    },
  }

  const addTag = (tag) => {
    if (tag) signals.preferredTags.push(String(tag).toLowerCase())
  }

  const addAvoid = (tag) => {
    if (tag) signals.avoidTags.push(String(tag).toLowerCase())
  }

  const addType = (tag) => {
    if (tag) signals.destinationTypes.push(String(tag).toLowerCase())
  }

  const boost = (theme, points = 1) => {
    if (signals.themeWeights[theme] !== undefined) {
      signals.themeWeights[theme] += points
    }
  }

  const blob = [
    profileDocument?.tripType,
    profileDocument?.purposeOfTravel,
    profileDocument?.travelStyle,
    profileDocument?.luxuryStyle,
    profileDocument?.vibe,
    profileDocument?.summary,
    profileDocument?.autoSummary,
    profileDocument?.questionnaireOutput,
    payload?.tripVibeWords,
    payload?.dreamExperiences,
    payload?.favoritePastDestinationsWhy,
    payload?.wontReturnDestinationsWhy,
    payload?.favoriteCuisinesDishes,
    payload?.hobbiesPassions,
    payload?.accommodationMustHaves,
    payload?.absoluteDealBreakers,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const vibeWords = (payload.tripVibeWords || '').toLowerCase()
  const dealBreakers = (payload.absoluteDealBreakers || '').toLowerCase()
  const mustHaves = (payload.accommodationMustHaves || '').toLowerCase()
  const dreamExperiences = (payload.dreamExperiences || '').toLowerCase()
  const pastFavorites = (payload.favoritePastDestinationsWhy || '').toLowerCase()
  const wontReturn = (payload.wontReturnDestinationsWhy || '').toLowerCase()
  const hobbies = (payload.hobbiesPassions || '').toLowerCase()
  const cuisine = (payload.favoriteCuisinesDishes || '').toLowerCase()
  const energy = (payload.travelEnergyDrink || '').toLowerCase()

  const hasText = (needle) => blob.includes(needle)

  if (energy.includes('luxurious')) {
    addTag('luxury')
    addTag('slow travel')
    boost('luxury', 4)
    boost('slowTravel', 3)
  }

  if (energy.includes('energetic')) {
    addTag('nightlife')
    addTag('city')
    boost('nightlife', 4)
    boost('adventure', 2)
  }

  if (energy.includes('restorative')) {
    addTag('wellness')
    addTag('quiet')
    boost('wellness', 5)
    boost('slowTravel', 2)
    boost('privacy', 2)
  }

  if (energy.includes('celebratory')) {
    addTag('romantic')
    addTag('luxury')
    boost('romance', 4)
    boost('luxury', 3)
  }

  if (energy.includes('purpose-driven')) {
    addTag('culture')
    addTag('learning')
    boost('culture', 4)
  }

  if (payload.wouldYouRatherOceanOrMountain === 'Ocean waves' || hasText('beach') || hasText('island') || hasText('ocean')) {
    addType('beach')
    addType('island')
    addTag('beach')
    boost('beach', 5)
  }

  if (payload.wouldYouRatherOceanOrMountain === 'Mountain air' || hasText('mountain') || hasText('hills')) {
    addType('mountain')
    addType('nature')
    addTag('mountain')
    boost('mountain', 5)
    boost('nature', 3)
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Exploring' || hasText('explore') || hasText('adventure')) {
    addTag('adventure')
    addTag('culture')
    boost('adventure', 4)
    boost('culture', 2)
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Lounging' || hasText('relax') || hasText('lounge') || hasText('resort')) {
    addTag('relaxation')
    addTag('resort')
    boost('slowTravel', 4)
    boost('wellness', 2)
    boost('privacy', 2)
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Street food' || hasText('street food') || hasText('culinary')) {
    addTag('food')
    addTag('local immersion')
    boost('food', 4)
    boost('culture', 2)
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Michelin star dining' || hasText('michelin') || hasText('fine dining')) {
    addTag('fine dining')
    addTag('luxury')
    boost('food', 3)
    boost('luxury', 2)
  }

  if (payload.wouldYouRatherPlanOrFlow === 'Flow') {
    addTag('slow travel')
    boost('slowTravel', 2)
  }

  if (payload.wouldYouRatherPlanOrFlow === 'Plan') {
    addTag('structured')
  }

  const excitement = Array.isArray(payload.travelExcitement) ? payload.travelExcitement : []

  if (excitement.includes('Culinary experiences')) {
    addTag('food')
    boost('food', 4)
  }

  if (excitement.includes('Cultural immersion')) {
    addTag('culture')
    boost('culture', 4)
  }

  if (excitement.includes('Adventure sports')) {
    addTag('adventure')
    boost('adventure', 5)
  }

  if (excitement.includes('Luxury indulgence')) {
    addTag('luxury')
    boost('luxury', 5)
  }

  if (excitement.includes('Wellness & retreats')) {
    addTag('wellness')
    boost('wellness', 5)
  }

  if (excitement.includes('Shopping & fashion')) {
    addTag('shopping')
    boost('shopping', 4)
  }

  if (vibeWords.includes('romantic') || hasText('romantic') || hasText('honeymoon')) {
    addTag('romantic')
    boost('romance', 5)
  }
  if (vibeWords.includes('spiritual') || hasText('spiritual')) {
    addTag('spiritual')
    boost('wellness', 2)
    boost('culture', 1)
  }
  if (vibeWords.includes('thrilling') || hasText('thrilling')) {
    addTag('adventure')
    boost('adventure', 4)
  }
  if (vibeWords.includes('indulgent') || hasText('luxury') || hasText('ultra luxury')) {
    addTag('luxury')
    boost('luxury', 4)
  }
  if (vibeWords.includes('secluded') || hasText('private') || hasText('secluded')) {
    addTag('privacy')
    boost('privacy', 4)
  }
  if (vibeWords.includes('calm') || hasText('calm') || hasText('quiet')) {
    addTag('quiet')
    boost('slowTravel', 2)
    boost('wellness', 2)
  }

  if (mustHaves.includes('private pool') || hasText('private pool')) {
    addTag('private villa')
    addTag('privacy')
    boost('privacy', 4)
    boost('luxury', 2)
  }

  if (mustHaves.includes('sea view') || hasText('sea view') || hasText('ocean view')) {
    addTag('ocean view')
    addTag('beach')
    boost('beach', 3)
  }

  if (mustHaves.includes('butler') || hasText('butler')) {
    addTag('ultra luxury')
    boost('luxury', 4)
  }

  if (mustHaves.includes('spa') || hasText('spa')) {
    addTag('wellness')
    boost('wellness', 3)
  }

  if (mustHaves.includes('kids club') || hasText('kids club')) {
    addTag('family')
    boost('family', 4)
  }

  if (dealBreakers.includes('crowd') || hasText('avoid crowds')) addAvoid('crowded')
  if (dealBreakers.includes('budget hotel')) addAvoid('budget')
  if (dealBreakers.includes('red-eye')) addAvoid('complex flights')
  if (dealBreakers.includes('noise') || hasText('noise')) addAvoid('noisy')
  if (dealBreakers.includes('party')) addAvoid('nightlife')
  if (dealBreakers.includes('cold')) addAvoid('cold')
  if (dealBreakers.includes('transfers')) addAvoid('complex logistics')

  if (dreamExperiences.includes('maldives') || hasText('maldives')) {
    addType('island')
    addTag('beach')
    boost('beach', 3)
    boost('luxury', 2)
  }

  if (dreamExperiences.includes('kyoto') || hasText('kyoto')) {
    addType('culture')
    addTag('culture')
    boost('culture', 3)
  }

  if (dreamExperiences.includes('cappadocia') || hasText('cappadocia')) {
    addType('bucket list')
    addTag('adventure')
    boost('adventure', 2)
  }

  if (pastFavorites.includes('beach') || hasText('beach')) {
    addTag('beach')
    boost('beach', 3)
  }

  if (pastFavorites.includes('food') || hasText('food')) {
    addTag('food')
    boost('food', 2)
  }

  if (pastFavorites.includes('culture') || hasText('culture')) {
    addTag('culture')
    boost('culture', 2)
  }

  if (pastFavorites.includes('relax') || hasText('relax')) {
    addTag('slow travel')
    boost('slowTravel', 2)
  }

  if (wontReturn.includes('crowd')) addAvoid('crowded')
  if (wontReturn.includes('unsafe')) addAvoid('unsafe')
  if (wontReturn.includes('boring')) addAvoid('slow')
  if (wontReturn.includes('touristy')) addAvoid('touristy')

  if (hobbies.includes('hiking') || hasText('hiking')) {
    addTag('nature')
    addTag('adventure')
    boost('nature', 3)
    boost('adventure', 2)
  }

  if (hobbies.includes('art') || hasText('art')) {
    addTag('culture')
    boost('culture', 2)
  }

  if (hobbies.includes('shopping') || hasText('shopping')) {
    addTag('shopping')
    boost('shopping', 2)
  }

  if (cuisine.includes('japanese') || cuisine.includes('omakase') || hasText('japanese') || hasText('omakase')) {
    addTag('food')
    boost('food', 2)
  }

  const tripType = (profileDocument?.tripType || profileDocument?.purposeOfTravel || '').toLowerCase()

  if (tripType.includes('honeymoon') || tripType.includes('romantic')) {
    boost('romance', 5)
    addTag('romantic')
    addTag('privacy')
  }

  if (tripType.includes('wellness')) {
    boost('wellness', 5)
    addTag('wellness')
  }

  if (tripType.includes('family')) {
    boost('family', 5)
    addTag('family')
  }

  if (tripType.includes('celebration')) {
    boost('luxury', 2)
    boost('romance', 2)
  }

  if (tripType.includes('holiday') || tripType.includes('vacation')) {
    boost('luxury', 1)
    boost('slowTravel', 1)
  }

  const travelStyle = `${profileDocument?.travelStyle || ''} ${profileDocument?.luxuryStyle || ''} ${profileDocument?.vibe || ''}`.toLowerCase()

  if (travelStyle.includes('luxury')) {
    addTag('luxury')
    boost('luxury', 4)
  }
  if (travelStyle.includes('wellness')) {
    addTag('wellness')
    boost('wellness', 4)
  }
  if (travelStyle.includes('romantic')) {
    addTag('romantic')
    boost('romance', 4)
  }
  if (travelStyle.includes('adventure')) {
    addTag('adventure')
    boost('adventure', 4)
  }
  if (travelStyle.includes('culture')) {
    addTag('culture')
    boost('culture', 3)
  }
  if (travelStyle.includes('beach')) {
    addTag('beach')
    addType('beach')
    boost('beach', 4)
  }

  signals.preferredTags = [...new Set(signals.preferredTags)]
  signals.avoidTags = [...new Set(signals.avoidTags)]
  signals.destinationTypes = [...new Set(signals.destinationTypes)]

  return signals
}