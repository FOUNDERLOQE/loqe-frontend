export function profileToSignals(payload) {
  const profile = payload?.clientProfile || {}

  const signals = {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand: payload?.budgetBand || '',
    tripType: payload?.tripType || '',
    tripLengthDays: Number(payload?.tripLengthDays) || null,
    travellerCount: Number(payload?.travellerCount) || null,
    travelStyleSummary: [],
  }

  const energyDrink = (profile.travelEnergyDrink || '').toLowerCase()
  const vibeWords = (profile.tripVibeWords || '').toLowerCase()
  const dealBreakers = (profile.absoluteDealBreakers || '').toLowerCase()
  const mustHaves = (profile.accommodationMustHaves || '').toLowerCase()
  const dreamExperiences = (profile.dreamExperiences || '').toLowerCase()
  const climate = (profile.preferredClimate || '').toLowerCase()
  const cuisines = (profile.favoriteCuisinesDishes || '').toLowerCase()
  const hobbies = (profile.hobbiesPassions || '').toLowerCase()
  const specialEvents = (profile.specialEventsTravelFor || '').toLowerCase()

  if (energyDrink.includes('luxurious')) {
    signals.preferredTags.push('luxury', 'slow travel', 'relaxation')
  }

  if (energyDrink.includes('energetic')) {
    signals.preferredTags.push('nightlife', 'city', 'high energy')
  }

  if (energyDrink.includes('restorative')) {
    signals.preferredTags.push('wellness', 'beach', 'quiet')
  }

  if (energyDrink.includes('celebratory')) {
    signals.preferredTags.push('celebration', 'romantic', 'luxury')
  }

  if (energyDrink.includes('purpose-driven')) {
    signals.preferredTags.push('culture', 'learning', 'events')
  }

  if (profile.wouldYouRatherOceanOrMountain === 'Ocean waves') {
    signals.destinationTypes.push('beach', 'island', 'coastal')
  }

  if (profile.wouldYouRatherOceanOrMountain === 'Mountain air') {
    signals.destinationTypes.push('mountain', 'nature', 'retreat')
  }

  if (profile.wouldYouRatherExploreOrLounge === 'Exploring') {
    signals.preferredTags.push('adventure', 'culture', 'active')
  }

  if (profile.wouldYouRatherExploreOrLounge === 'Lounging') {
    signals.preferredTags.push('relaxation', 'slow travel', 'resort')
  }

  if (profile.wouldYouRatherStreetFoodOrMichelin === 'Street food') {
    signals.preferredTags.push('local immersion', 'food')
  }

  if (profile.wouldYouRatherStreetFoodOrMichelin === 'Michelin star dining') {
    signals.preferredTags.push('fine dining', 'luxury')
  }

  const excitement = Array.isArray(profile.travelExcitement)
    ? profile.travelExcitement
    : []

  if (excitement.includes('Culinary experiences')) {
    signals.preferredTags.push('food')
  }

  if (excitement.includes('Cultural immersion')) {
    signals.preferredTags.push('culture')
  }

  if (excitement.includes('Adventure sports')) {
    signals.preferredTags.push('adventure')
  }

  if (excitement.includes('Luxury indulgence')) {
    signals.preferredTags.push('luxury')
  }

  if (excitement.includes('Wellness & retreats')) {
    signals.preferredTags.push('wellness')
  }

  if (excitement.includes('Shopping & fashion')) {
    signals.preferredTags.push('shopping')
  }

  if (vibeWords.includes('romantic')) signals.preferredTags.push('romantic')
  if (vibeWords.includes('spiritual')) signals.preferredTags.push('spiritual')
  if (vibeWords.includes('thrilling')) signals.preferredTags.push('adventure')
  if (vibeWords.includes('indulgent')) signals.preferredTags.push('luxury')
  if (vibeWords.includes('peaceful')) signals.preferredTags.push('quiet')
  if (vibeWords.includes('playful')) signals.preferredTags.push('fun')
  if (vibeWords.includes('cultural')) signals.preferredTags.push('culture')

  if (mustHaves.includes('private pool')) {
    signals.preferredTags.push('private villa', 'privacy')
  }

  if (mustHaves.includes('sea view')) {
    signals.preferredTags.push('beach', 'ocean view')
  }

  if (mustHaves.includes('butler')) {
    signals.preferredTags.push('ultra luxury')
  }

  if (mustHaves.includes('spa')) {
    signals.preferredTags.push('wellness')
  }

  if (mustHaves.includes('kids club')) {
    signals.preferredTags.push('family')
  }

  if (dealBreakers.includes('crowd') || dealBreakers.includes('crowded')) {
    signals.avoidTags.push('crowded')
  }

  if (dealBreakers.includes('budget hotel')) {
    signals.avoidTags.push('budget')
  }

  if (dealBreakers.includes('red-eye')) {
    signals.avoidTags.push('complex flights')
  }

  if (dealBreakers.includes('noise') || dealBreakers.includes('noisy')) {
    signals.avoidTags.push('nightlife')
  }

  if (dealBreakers.includes('long drive')) {
    signals.avoidTags.push('remote transfer')
  }

  if (dreamExperiences.includes('maldives')) {
    signals.destinationTypes.push('island')
  }

  if (dreamExperiences.includes('kyoto')) {
    signals.destinationTypes.push('culture')
  }

  if (dreamExperiences.includes('cappadocia')) {
    signals.destinationTypes.push('bucket list')
  }

  if (dreamExperiences.includes('safari')) {
    signals.destinationTypes.push('wildlife')
    signals.preferredTags.push('adventure')
  }

  if (dreamExperiences.includes('northern lights')) {
    signals.destinationTypes.push('cold climate', 'bucket list')
  }

  if (climate.includes('cold')) {
    signals.destinationTypes.push('cold climate')
  }

  if (climate.includes('warm') || climate.includes('tropical')) {
    signals.destinationTypes.push('warm weather')
  }

  if (climate.includes('beach')) {
    signals.destinationTypes.push('beach')
  }

  if (cuisines.includes('japanese')) {
    signals.preferredTags.push('fine dining', 'culture')
  }

  if (cuisines.includes('italian')) {
    signals.preferredTags.push('food', 'romantic')
  }

  if (cuisines.includes('local')) {
    signals.preferredTags.push('local immersion')
  }

  if (hobbies.includes('shopping') || hobbies.includes('fashion')) {
    signals.preferredTags.push('shopping')
  }

  if (hobbies.includes('art')) {
    signals.preferredTags.push('culture')
  }

  if (hobbies.includes('hiking')) {
    signals.preferredTags.push('adventure', 'nature')
    signals.destinationTypes.push('mountain')
  }

  if (hobbies.includes('surf')) {
    signals.preferredTags.push('adventure', 'beach')
    signals.destinationTypes.push('coastal')
  }

  if (specialEvents.includes('birthday') || specialEvents.includes('anniversary')) {
    signals.preferredTags.push('celebration', 'romantic')
  }

  const tripType = (payload?.tripType || '').toLowerCase()

  if (tripType.includes('honeymoon')) {
    signals.preferredTags.push('romantic', 'luxury', 'privacy')
  }

  if (tripType.includes('wellness')) {
    signals.preferredTags.push('wellness', 'quiet', 'slow travel')
  }

  if (tripType.includes('family')) {
    signals.preferredTags.push('family')
  }

  if (tripType.includes('celebration')) {
    signals.preferredTags.push('celebration')
  }

  signals.preferredTags = [...new Set(signals.preferredTags)]
  signals.avoidTags = [...new Set(signals.avoidTags)]
  signals.destinationTypes = [...new Set(signals.destinationTypes)]

  signals.travelStyleSummary = [
    signals.tripType,
    signals.budgetBand,
    ...signals.preferredTags.slice(0, 4),
    ...signals.destinationTypes.slice(0, 3),
  ].filter(Boolean)

  return signals
}