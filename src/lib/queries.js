export const experiencesQuery = `*[_type == "experience"]{
  _id,
  title,
  description,
  category,
  priceTier,
  persona,
  lens,
  media,
  "destinationName": destination->name
} | order(title asc)`
