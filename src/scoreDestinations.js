export function scoreDestinations(destinations, signals) {
  return destinations
    .map((destination) => {
      let score = 0
      const matchReasons = []
      const matchWarnings = []

      const vibeTags = Array.isArray(destination?.vibeTags) ? destination.vibeTags : []
      const suitableFor = Array.isArray(destination?.suitableFor) ? destination.suitableFor : []
      const destinationTypes = Array.isArray(destination?.destinationTypes)
        ? destination.destinationTypes
        : []
      const bestTripTypes = Array.isArray(destination?.bestTripTypes)
        ? destination.bestTripTypes
        : []
      const climateTags = Array.isArray(destination?.climateTags)
        ? destination.climateTags
        : []
      const paceTags = Array.isArray(destination?.paceTags)
        ? destination.paceTags
        : []
      const experienceTags = Array.isArray(destination?.experienceTags)
        ? destination.experienceTags
        : []
      const travelLogistics = Array.isArray(destination?.travelLogistics)
        ? destination.travelLogistics
        : []

      const idealTripLength = String(destination?.idealTripLength || '').toLowerCase()
      const budgetBand = String(destination?.budgetBand || '').trim()

      const allTags = [
        ...vibeTags,
        ...suitableFor,
        ...destinationTypes,
        ...bestTripTypes,
        ...climateTags,
        ...paceTags,
        ...experienceTags,
        ...travelLogistics,
        idealTripLength,
      ]
        .filter(Boolean)
        .map((tag) => String(tag).toLowerCase())

      const uniquePush = (list, value) => {
        if (!list.includes(value)) list.push(value)
      }

      ;(signals?.preferredTags || []).forEach((tag) => {
        const normalizedTag = String(tag).toLowerCase()

        if (allTags.some((item) => item.includes(normalizedTag))) {
          score += 12
          uniquePush(matchReasons, `Matches preferred tag: ${tag}`)
        }
      })

      ;(signals?.destinationTypes || []).forEach((tag) => {
        const normalizedTag = String(tag).toLowerCase()

        if (allTags.some((item) => item.includes(normalizedTag))) {
          score += 10
          uniquePush(matchReasons, `Matches destination type: ${tag}`)
        }
      })

      ;(signals?.avoidTags || []).forEach((tag) => {
        const normalizedTag = String(tag).toLowerCase()

        if (allTags.some((item) => item.includes(normalizedTag))) {
          score -= 15
          uniquePush(matchWarnings, `Contains avoid tag: ${tag}`)
        }
      })

      if (signals?.budgetBand && budgetBand === String(signals.budgetBand).trim()) {
        score += 10
        uniquePush(matchReasons, `Matches budget band: ${signals.budgetBand}`)
      }

      const tripType = String(signals?.tripType || '').toLowerCase()

      if (
        tripType &&
        bestTripTypes.some((item) => String(item).toLowerCase() === tripType)
      ) {
        score += 15
        uniquePush(matchReasons, `Strong fit for trip type: ${signals.tripType}`)
      }

      if (tripType.includes('honeymoon') || tripType.includes('romantic')) {
        if (allTags.includes('romantic')) {
          score += 12
          uniquePush(matchReasons, 'Strong fit for romantic travel')
        }
      }

      if (tripType.includes('wellness')) {
        if (allTags.includes('wellness')) {
          score += 12
          uniquePush(matchReasons, 'Strong fit for wellness travel')
        }
      }

      if (tripType.includes('family')) {
        if (allTags.includes('family')) {
          score += 12
          uniquePush(matchReasons, 'Strong fit for family travel')
        }
      }

      if (tripType.includes('celebration')) {
        if (allTags.includes('celebration') || allTags.includes('romantic')) {
          score += 10
          uniquePush(matchReasons, 'Good fit for celebration travel')
        }
      }

      if ((signals?.tripLengthDays || 0) <= 4) {
        if (
          idealTripLength.includes('short break') ||
          allTags.includes('easy access') ||
          allTags.includes('direct access')
        ) {
          score += 8
          uniquePush(matchReasons, 'Good fit for a shorter trip')
        }
      }

      if ((signals?.tripLengthDays || 0) >= 5 && (signals?.tripLengthDays || 0) <= 7) {
        if (idealTripLength.includes('4-7 days')) {
          score += 8
          uniquePush(matchReasons, 'Well suited for a 4-7 day trip')
        }
      }

      if ((signals?.tripLengthDays || 0) >= 8 && (signals?.tripLengthDays || 0) <= 10) {
        if (idealTripLength.includes('7-10 days')) {
          score += 8
          uniquePush(matchReasons, 'Well suited for a 7-10 day trip')
        }
      }

      if ((signals?.tripLengthDays || 0) > 10) {
        if (
          idealTripLength.includes('10+ days') ||
          allTags.includes('immersive') ||
          allTags.includes('slow travel')
        ) {
          score += 8
          uniquePush(matchReasons, 'Good fit for a longer immersive trip')
        }
      }

      if ((signals?.travellerCount || 0) >= 3) {
        if (allTags.includes('group') || allTags.includes('family')) {
          score += 6
          uniquePush(matchReasons, 'Works well for multiple travellers')
        }
      }

      if ((signals?.travellerCount || 0) === 2) {
        if (allTags.includes('romantic') || allTags.includes('couples')) {
          score += 6
          uniquePush(matchReasons, 'Good fit for two travellers')
        }
      }

      if ((signals?.preferredTags || []).includes('luxury')) {
        if (allTags.includes('luxury') || allTags.includes('ultra luxury')) {
          score += 8
          uniquePush(matchReasons, 'Strong luxury alignment')
        }
      }

      if ((signals?.preferredTags || []).includes('wellness')) {
        if (allTags.includes('wellness') || allTags.includes('quiet')) {
          score += 8
          uniquePush(matchReasons, 'Strong wellness alignment')
        }
      }

      if ((signals?.preferredTags || []).includes('food')) {
        if (allTags.includes('food') || allTags.includes('fine dining') || allTags.includes('local immersion')) {
          score += 7
          uniquePush(matchReasons, 'Strong culinary alignment')
        }
      }

      if ((signals?.preferredTags || []).includes('adventure')) {
        if (allTags.includes('adventure') || allTags.includes('active') || allTags.includes('nature')) {
          score += 7
          uniquePush(matchReasons, 'Strong adventure alignment')
        }
      }

      if ((signals?.preferredTags || []).includes('culture')) {
        if (allTags.includes('culture') || allTags.includes('local immersion')) {
          score += 7
          uniquePush(matchReasons, 'Strong cultural alignment')
        }
      }

      if ((signals?.destinationTypes || []).includes('warm weather')) {
        if (allTags.includes('warm weather') || allTags.includes('tropical')) {
          score += 6
          uniquePush(matchReasons, 'Matches warm weather preference')
        }
      }

      if ((signals?.destinationTypes || []).includes('cold climate')) {
        if (allTags.includes('cold climate')) {
          score += 6
          uniquePush(matchReasons, 'Matches cold climate preference')
        }
      }

      if ((signals?.avoidTags || []).includes('complex flights')) {
        if (allTags.includes('complex flights') || allTags.includes('remote transfer')) {
          score -= 10
          uniquePush(matchWarnings, 'Travel logistics may be inconvenient')
        }
      }

      if ((signals?.avoidTags || []).includes('crowded')) {
        if (allTags.includes('high energy') || allTags.includes('nightlife') || allTags.includes('city')) {
          score -= 8
          uniquePush(matchWarnings, 'May feel busier than preferred')
        }
      }

      return {
        ...destination,
        recommendationScore: score,
        matchReasons,
        matchWarnings,
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}