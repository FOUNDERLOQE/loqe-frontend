function normalizeTags(destination) {
  const vibeTags = destination?.vibeTags || []
  const suitableFor = destination?.suitableFor || []
  return [...vibeTags, ...suitableFor]
    .filter(Boolean)
    .map((tag) => String(tag).toLowerCase())
}

function inferDestinationThemes(tags) {
  const has = (needle) => tags.some((tag) => tag.includes(needle))

  return {
    luxury: has('luxury') || has('ultra luxury') || has('fine dining'),
    romance: has('romantic'),
    wellness: has('wellness') || has('spa'),
    adventure: has('adventure') || has('hiking') || has('wildlife'),
    culture: has('culture') || has('museums') || has('art') || has('local immersion'),
    food: has('food') || has('fine dining'),
    family: has('family'),
    nightlife: has('nightlife'),
    nature: has('nature') || has('mountain') || has('wildlife'),
    shopping: has('shopping'),
    slowTravel: has('slow travel') || has('resort') || has('relaxation'),
    privacy: has('privacy') || has('private villa'),
    beach: has('beach') || has('island') || has('ocean'),
    mountain: has('mountain'),
  }
}

function addReason(reasons, text) {
  if (!text || reasons.includes(text) || reasons.length >= 4) return
  reasons.push(text)
}

function addWarning(warnings, text) {
  if (!text || warnings.includes(text) || warnings.length >= 3) return
  warnings.push(text)
}

export function scoreDestinations(destinations, signals) {
  return destinations
    .map((destination) => {
      let score = 0
      const reasons = []
      const warnings = []
      const tags = normalizeTags(destination)
      const themes = inferDestinationThemes(tags)

      signals.preferredTags.forEach((tag) => {
        if (tags.some((item) => item.includes(tag))) {
          score += 10
          addReason(reasons, `Aligned with ${tag}`)
        }
      })

      signals.destinationTypes.forEach((tag) => {
        if (tags.some((item) => item.includes(tag))) {
          score += 9
          addReason(reasons, `Matches preferred ${tag} setting`)
        }
      })

      signals.avoidTags.forEach((tag) => {
        if (tags.some((item) => item.includes(tag))) {
          score -= 16
          addWarning(warnings, `Potential mismatch around ${tag}`)
        }
      })

      if (signals.budgetBand && destination?.budgetBand === signals.budgetBand) {
        score += 10
        addReason(reasons, `Budget alignment with ${signals.budgetBand}`)
      } else if (signals.budgetBand && destination?.budgetBand && destination.budgetBand !== signals.budgetBand) {
        score -= 5
        addWarning(warnings, `Budget band differs from requested ${signals.budgetBand}`)
      }

      if (themes.luxury) score += signals.themeWeights.luxury * 2.2
      if (themes.romance) score += signals.themeWeights.romance * 2.3
      if (themes.wellness) score += signals.themeWeights.wellness * 2.2
      if (themes.adventure) score += signals.themeWeights.adventure * 2.0
      if (themes.culture) score += signals.themeWeights.culture * 1.8
      if (themes.food) score += signals.themeWeights.food * 1.8
      if (themes.family) score += signals.themeWeights.family * 2.0
      if (themes.nightlife) score += signals.themeWeights.nightlife * 1.8
      if (themes.nature) score += signals.themeWeights.nature * 1.7
      if (themes.shopping) score += signals.themeWeights.shopping * 1.7
      if (themes.slowTravel) score += signals.themeWeights.slowTravel * 1.9
      if (themes.privacy) score += signals.themeWeights.privacy * 2.1
      if (themes.beach) score += signals.themeWeights.beach * 2.0
      if (themes.mountain) score += signals.themeWeights.mountain * 2.0

      const tripType = (signals.tripType || '').toLowerCase()

      if (tripType.includes('honeymoon') && themes.romance) {
        score += 14
        addReason(reasons, 'Strong honeymoon positioning')
      }

      if (tripType.includes('wellness') && themes.wellness) {
        score += 14
        addReason(reasons, 'Strong wellness-led fit')
      }

      if (tripType.includes('family') && themes.family) {
        score += 14
        addReason(reasons, 'Strong family suitability')
      }

      if (tripType.includes('celebration') && (themes.luxury || themes.romance)) {
        score += 10
        addReason(reasons, 'Good celebration fit')
      }

      if (signals.tripLengthDays && signals.tripLengthDays <= 4 && tags.some((tag) => tag.includes('complex flights'))) {
        score -= 8
        addWarning(warnings, 'Trip may feel logistically heavy for a shorter duration')
      }

      if (signals.travellerCount && signals.travellerCount >= 4 && !themes.family && !tags.some((tag) => tag.includes('group'))) {
        score -= 4
      }

      if (reasons.length === 0) {
        addReason(reasons, 'Good broad fit against overall brief')
      }

      return {
        ...destination,
        recommendationScore: Math.round(score),
        matchReasons: reasons.slice(0, 4),
        matchWarnings: warnings.slice(0, 3),
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}
