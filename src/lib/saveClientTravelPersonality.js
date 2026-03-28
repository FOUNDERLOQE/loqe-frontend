export async function saveClientTravelPersonality(payload) {
  const response = await fetch('/api/save-client-travel-personality', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Failed to save client travel personality')
  }

  return result
}