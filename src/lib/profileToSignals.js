export function profileToSignals(payload) {
  const profile = payload?.clientProfile || {}

  const signals = {
    preferredTags: [],
    avoidTags: [],
    destinationTypes: [],
    budgetBand: payload?.budgetBand || '',
    tripType: payload?.tripType || '',
    tripLengthDays: payload?.tripLengthDays || null,
    travellerCount: payload?.travellerCount || null,
  }

  const vibeWords = (profile.tripVibeWords || '').toLowerCase()
  const dealBreakers = (profile.absoluteDealBreakers || '').toLowerCase()
  const mustHaves = (profile.accommodationMustHaves || '').toLowerCase()
  const dreamExperiences = (profile.dreamExperiences || '').toLowerCase()

  if ((profile.travelEnergyDrink || '').toLowerCase().includes('luxurious')) {
    signals.preferredTags.push('luxury', 'slow travel', 'relaxation')
  }

  if ((profile.travelEnergyDrink || '').toLowerCase().includes('energetic')) {
    signals.preferredTags.push('nightlife', 'city', 'high energy')
  }

  if ((profile.travelEnergyDrink || '').toLowerCase().includes('restorative')) {
    signals.preferredTags.push('wellness', 'beach', 'quiet')
  }

  if ((profile.travelEnergyDrink || '').toLowerCase().includes('celebratory')) {
    signals.preferredTags.push('celebration', 'romantic', 'luxury')
  }

  if ((profile.travelEnergyDrink || '').toLowerCase().includes('purpose-driven')) {
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

  if ((profile.travelExcitement || []).includes('Culinary experiences')) {
    signals.preferredTags.push('food')
  }

  if ((profile.travelExcitement || []).includes('Cultural immersion')) {
    signals.preferredTags.push('culture')
  }

  if ((profile.travelExcitement || []).includes('Adventure sports')) {
    signals.preferredTags.push('adventure')
  }

  if ((profile.travelExcitement || []).includes('Luxury indulgence')) {
    signals.preferredTags.push('luxury')
  }

  if ((profile.travelExcitement || []).includes('Wellness & retreats')) {
    signals.preferredTags.push('wellness')
  }

  if ((profile.travelExcitement || []).includes('Shopping & fashion')) {
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