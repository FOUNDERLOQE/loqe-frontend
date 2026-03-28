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