export function profileToSignals(profileDocument) {
  const payload = profileDocument?.profilePayload || profileDocument?.clientProfile || {}

  const signals = {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand: profileDocument?.budgetBand || '',
    tripType: profileDocument?.tripType || '',
    tripLengthDays: profileDocument?.tripLengthDays || null,
    travellerCount: profileDocument?.travellerCount || null,

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
    if (tag) signals.preferredTags.push(tag)
  }

  const addAvoid = (tag) => {
    if (tag) signals.avoidTags.push(tag)
  }

  const addType = (tag) => {
    if (tag) signals.destinationTypes.push(tag)
  }

  const boost = (theme, points = 1) => {
    if (signals.themeWeights[theme] !== undefined) {
      signals.themeWeights[theme] += points
    }
  }

  const vibeWords = (payload.tripVibeWords || '').toLowerCase()
  const dealBreakers = (payload.absoluteDealBreakers || '').toLowerCase()
  const mustHaves = (payload.accommodationMustHaves || '').toLowerCase()
  const dreamExperiences = (payload.dreamExperiences || '').toLowerCase()
  const pastFavorites = (payload.favoritePastDestinationsWhy || '').toLowerCase()
  const wontReturn = (payload.wontReturnDestinationsWhy || '').toLowerCase()
  const hobbies = (payload.hobbiesPassions || '').toLowerCase()
  const cuisine = (payload.favoriteCuisinesDishes || '').toLowerCase()

  const energy = (payload.travelEnergyDrink || '').toLowerCase()

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

  if (payload.wouldYouRatherOceanOrMountain === 'Ocean waves') {
    addType('beach')
    addType('island')
    addTag('beach')
    boost('beach', 5)
  }

  if (payload.wouldYouRatherOceanOrMountain === 'Mountain air') {
    addType('mountain')
    addType('nature')
    addTag('mountain')
    boost('mountain', 5)
    boost('nature', 3)
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Exploring') {
    addTag('adventure')
    addTag('culture')
    boost('adventure', 4)
    boost('culture', 2)
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Lounging') {
    addTag('relaxation')
    addTag('resort')
    boost('slowTravel', 4)
    boost('wellness', 2)
    boost('privacy', 2)
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Street food') {
    addTag('food')
    addTag('local immersion')
    boost('food', 4)
    boost('culture', 2)
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Michelin star dining') {
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

  if (vibeWords.includes('romantic')) {
    addTag('romantic')
    boost('romance', 5)
  }
  if (vibeWords.includes('spiritual')) {
    addTag('spiritual')
    boost('wellness', 2)
    boost('culture', 1)
  }
  if (vibeWords.includes('thrilling')) {
    addTag('adventure')
    boost('adventure', 4)
  }
  if (vibeWords.includes('indulgent')) {
    addTag('luxury')
    boost('luxury', 4)
  }
  if (vibeWords.includes('secluded')) {
    addTag('privacy')
    boost('privacy', 4)
  }
  if (vibeWords.includes('calm')) {
    addTag('quiet')
    boost('slowTravel', 2)
    boost('wellness', 2)
  }

  if (mustHaves.includes('private pool')) {
    addTag('private villa')
    addTag('privacy')
    boost('privacy', 4)
    boost('luxury', 2)
  }

  if (mustHaves.includes('sea view')) {
    addTag('ocean view')
    addTag('beach')
    boost('beach', 3)
  }

  if (mustHaves.includes('butler')) {
    addTag('ultra luxury')
    boost('luxury', 4)
  }

  if (mustHaves.includes('spa')) {
    addTag('wellness')
    boost('wellness', 3)
  }

  if (mustHaves.includes('kids club')) {
    addTag('family')
    boost('family', 4)
  }

  if (dealBreakers.includes('crowd')) addAvoid('crowded')
  if (dealBreakers.includes('budget hotel')) addAvoid('budget')
  if (dealBreakers.includes('red-eye')) addAvoid('complex flights')
  if (dealBreakers.includes('noise')) addAvoid('noisy')
  if (dealBreakers.includes('party')) addAvoid('nightlife')
  if (dealBreakers.includes('cold')) addAvoid('cold')
  if (dealBreakers.includes('transfers')) addAvoid('complex logistics')

  if (dreamExperiences.includes('maldives')) {
    addType('island')
    addTag('beach')
    boost('beach', 3)
    boost('luxury', 2)
  }

  if (dreamExperiences.includes('kyoto')) {
    addType('culture')
    addTag('culture')
    boost('culture', 3)
  }

  if (dreamExperiences.includes('cappadocia')) {
    addType('bucket list')
    addTag('adventure')
    boost('adventure', 2)
  }

  if (pastFavorites.includes('beach')) {
    addTag('beach')
    boost('beach', 3)
  }

  if (pastFavorites.includes('food')) {
    addTag('food')
    boost('food', 2)
  }

  if (pastFavorites.includes('culture')) {
    addTag('culture')
    boost('culture', 2)
  }

  if (pastFavorites.includes('relax')) {
    addTag('slow travel')
    boost('slowTravel', 2)
  }

  if (wontReturn.includes('crowd')) addAvoid('crowded')
  if (wontReturn.includes('unsafe')) addAvoid('unsafe')
  if (wontReturn.includes('boring')) addAvoid('slow')
  if (wontReturn.includes('touristy')) addAvoid('touristy')

  if (hobbies.includes('hiking')) {
    addTag('nature')
    addTag('adventure')
    boost('nature', 3)
    boost('adventure', 2)
  }

  if (hobbies.includes('art')) {
    addTag('culture')
    boost('culture', 2)
  }

  if (hobbies.includes('shopping')) {
    addTag('shopping')
    boost('shopping', 2)
  }

  if (cuisine.includes('japanese') || cuisine.includes('omakase')) {
    addTag('food')
    boost('food', 2)
  }

  const tripType = (profileDocument?.tripType || '').toLowerCase()

  if (tripType.includes('honeymoon') || tripType.includes('romantic')) {
    boost('romance', 5)
    addTag('romantic')
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

  signals.preferredTags = [...new Set(signals.preferredTags)]
  signals.avoidTags = [...new Set(signals.avoidTags)]
  signals.destinationTypes = [...new Set(signals.destinationTypes)]

  return signals
}
