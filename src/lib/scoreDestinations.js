export function scoreDestinations(destinations, signals) {
  return destinations
    .map((destination) => {
      let score = 0
      const vibeTags = destination?.vibeTags || []
      const suitableFor = destination?.suitableFor || []
      const allTags = [...vibeTags, ...suitableFor].map((tag) => String(tag).toLowerCase())

      signals.preferredTags.forEach((tag) => {
        if (allTags.some((item) => item.includes(tag))) score += 12
      })

      signals.destinationTypes.forEach((tag) => {
        if (allTags.some((item) => item.includes(tag))) score += 10
      })

      signals.avoidTags.forEach((tag) => {
        if (allTags.some((item) => item.includes(tag))) score -= 15
      })

      if (signals.budgetBand && destination?.budgetBand === signals.budgetBand) {
        score += 8
      }

      if ((signals.tripType || '').toLowerCase().includes('honeymoon')) {
        if (allTags.includes('romantic')) score += 12
      }

      if ((signals.tripType || '').toLowerCase().includes('wellness')) {
        if (allTags.includes('wellness')) score += 12
      }

      if ((signals.tripType || '').toLowerCase().includes('family')) {
        if (allTags.includes('family')) score += 12
      }

      return {
        ...destination,
        recommendationScore: score,
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}
