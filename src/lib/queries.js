export const destinationsQuery = `
  *[_type == "destination"] | order(title asc){
    _id,
    title,
    slug,
    country,
    region,
    summary,
    heroImage,
    "heroVideoUrl": heroVideo.asset->url,
    budgetBand,
    vibeTags,
    suitableFor
  }
`

export const clientProfilesQuery = `
  *[_type == "clientProfile"] | order(createdAt desc){
    _id,
    fullName,
    clientType,
    cityOfResidence,
    tripType,
    tripLengthDays,
    travellerCount,
    budgetBand,
    originCity,
    autoSummary,
    travelSignalTags,
    createdAt
  }
`

export const clientProfileDetailQuery = `
  *[_type == "clientProfile" && _id == $id][0]{
    _id,
    fullName,
    email,
    phone,
    nationality,
    cityOfResidence,
    clientType,
    travellerComposition,
    relationshipManagerNotes,
    tripType,
    tripLengthDays,
    travellerCount,
    budgetBand,
    originCity,
    autoSummary,
    travelSignalTags,
    profilePayload,
    createdAt
  }
`

export const itineraryDraftDetailQuery = `
  *[_type == "itineraryDraft" && _id == $id][0]{
    _id,
    title,
    clientName,
    destinationTitle,
    destinationSlug,
    tripType,
    originCity,
    tripLengthDays,
    travellerCount,
    budgetBand,
    travelStyleSummary,
    whyThisDestination,
    plannerNotes,
    status,
    createdAt,
    days
  }
`
