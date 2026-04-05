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
