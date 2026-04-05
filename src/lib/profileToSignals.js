export function profileToSignals(profileDocument) {
  const payload = profileDocument?.profilePayload || {}

  const signals = {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand: profileDocument?.budgetBand || '',
    tripType: profileDocument?.tripType || '',
    tripLengthDays: profileDocument?.tripLengthDays || null,
    travellerCount: profileDocument?.travellerCount || null,
  }

  const vibeWords = (payload.tripVibeWords || '').toLowerCase()
  const dealBreakers = (payload.absoluteDealBreakers || '').toLowerCase()
  const mustHaves = (payload.accommodationMustHaves || '').toLowerCase()
  const dreamExperiences = (payload.dreamExperiences || '').toLowerCase()

  if ((payload.travelEnergyDrink || '').toLowerCase().includes('luxurious')) {
    signals.preferredTags.push('luxury', 'slow travel', 'relaxation')
  }

  if ((payload.travelEnergyDrink || '').toLowerCase().includes('energetic')) {
    signals.preferredTags.push('nightlife', 'city', 'high energy')
  }

  if ((payload.travelEnergyDrink || '').toLowerCase().includes('restorative')) {
    signals.preferredTags.push('wellness', 'beach', 'quiet')
  }

  if ((payload.travelEnergyDrink || '').toLowerCase().includes('celebratory')) {
    signals.preferredTags.push('celebration', 'romantic', 'luxury')
  }

  if ((payload.travelEnergyDrink || '').toLowerCase().includes('purpose-driven')) {
    signals.preferredTags.push('culture', 'learning', 'events')
  }

  if (payload.wouldYouRatherOceanOrMountain === 'Ocean waves') {
    signals.destinationTypes.push('beach', 'island', 'coastal')
  }

  if (payload.wouldYouRatherOceanOrMountain === 'Mountain air') {
    signals.destinationTypes.push('mountain', 'nature', 'retreat')
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Exploring') {
    signals.preferredTags.push('adventure', 'culture', 'active')
  }

  if (payload.wouldYouRatherExploreOrLounge === 'Lounging') {
    signals.preferredTags.push('relaxation', 'slow travel', 'resort')
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Street food') {
    signals.preferredTags.push('food', 'local immersion')
  }

  if (payload.wouldYouRatherStreetFoodOrMichelin === 'Michelin star dining') {
    signals.preferredTags.push('fine dining', 'luxury')
  }

  if ((payload.travelExcitement || []).includes('Culinary experiences')) {
    signals.preferredTags.push('food')
  }

  if ((payload.travelExcitement || []).includes('Cultural immersion')) {
    signals.preferredTags.push('culture')
  }

  if ((payload.travelExcitement || []).includes('Adventure sports')) {
    signals.preferredTags.push('adventure')
  }

  if ((payload.travelExcitement || []).includes('Luxury indulgence')) {
    signals.preferredTags.push('luxury')
  }

  if ((payload.travelExcitement || []).includes('Wellness & retreats')) {
    signals.preferredTags.push('wellness')
  }

  if ((payload.travelExcitement || []).includes('Shopping & fashion')) {
    signals.preferredTags.push('shopping')
  }

  if (vibeWords.includes('romantic')) signals.preferredTags.push('romantic')
  if (vibeWords.includes('spiritual')) signals.preferredTags.push('spiritual')
  if (vibeWords.includes('thrilling')) signals.preferredTags.push('adventure')
  if (vibeWords.includes('indulgent')) signals.preferredTags.push('luxury')

  if (mustHaves.includes('private pool')) signals.preferredTags.push('private villa', 'privacy')
  if (mustHaves.includes('sea view')) signals.preferredTags.push('beach', 'ocean view')
  if (mustHaves.includes('butler')) signals.preferredTags.push('ultra luxury')

  if (dealBreakers.includes('crowd')) signals.avoidTags.push('crowded')
  if (dealBreakers.includes('budget hotel')) signals.avoidTags.push('budget')
  if (dealBreakers.includes('red-eye')) signals.avoidTags.push('complex flights')

  if (dreamExperiences.includes('maldives')) signals.destinationTypes.push('island')
  if (dreamExperiences.includes('kyoto')) signals.destinationTypes.push('culture')
  if (dreamExperiences.includes('cappadocia')) signals.destinationTypes.push('bucket list')

  signals.preferredTags = [...new Set(signals.preferredTags)]
  signals.avoidTags = [...new Set(signals.avoidTags)]
  signals.destinationTypes = [...new Set(signals.destinationTypes)]

  return signals
}
