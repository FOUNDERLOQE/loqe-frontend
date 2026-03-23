import { useEffect, useMemo, useState } from 'react'
import { client } from './sanity'
import { urlFor } from './image'

function FilterChips({ title, items, selectedValue, onSelect }) {
  if (!items.length) return null

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {items.map((item) => {
          const active = selectedValue === item

          return (
            <button
              key={item}
              onClick={() => onSelect(active ? '' : item)}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: active ? '1px solid #f5f5f5' : '1px solid #374151',
                background: active ? '#f5f5f5' : 'transparent',
                color: active ? '#0b1020' : '#f5f5f5',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedDestination, setSelectedDestination] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPersona, setSelectedPersona] = useState('')
  const [selectedLens, setSelectedLens] = useState('')

  useEffect(() => {
    const query = `*[_type == "experience"]{
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

    client
      .fetch(query)
      .then((data) => {
        setExperiences(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Sanity fetch error:', err)
        setLoading(false)
      })
  }, [])

  const destinations = useMemo(() => {
    const values = experiences.map((e) => e.destinationName).filter(Boolean)
    return [...new Set(values)].sort()
  }, [experiences])

  const categories = useMemo(() => {
    const values = experiences.flatMap((e) =>
      Array.isArray(e.category) ? e.category : e.category ? [e.category] : []
    )
    return [...new Set(values)].sort()
  }, [experiences])

  const personas = useMemo(() => {
    const values = experiences.flatMap((e) =>
      Array.isArray(e.persona) ? e.persona : e.persona ? [e.persona] : []
    )
    return [...new Set(values)].sort()
  }, [experiences])

  const lenses = useMemo(() => {
    const values = experiences.flatMap((e) =>
      Array.isArray(e.lens) ? e.lens : e.lens ? [e.lens] : []
    )
    return [...new Set(values)].sort()
  }, [experiences])

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const destinationMatch =
        !selectedDestination || exp.destinationName === selectedDestination

      const categoryValues = Array.isArray(exp.category)
        ? exp.category
        : exp.category
          ? [exp.category]
          : []

      const personaValues = Array.isArray(exp.persona)
        ? exp.persona
        : exp.persona
          ? [exp.persona]
          : []

      const lensValues = Array.isArray(exp.lens)
        ? exp.lens
        : exp.lens
          ? [exp.lens]
          : []

      const categoryMatch =
        !selectedCategory || categoryValues.includes(selectedCategory)

      const personaMatch =
        !selectedPersona || personaValues.includes(selectedPersona)

      const lensMatch =
        !selectedLens || lensValues.includes(selectedLens)

      return destinationMatch && categoryMatch && personaMatch && lensMatch
    })
  }, [
    experiences,
    selectedDestination,
    selectedCategory,
    selectedPersona,
    selectedLens,
  ])

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #0b1020 0%, #0f172a 45%, #111827 100%)',
        color: '#f5f5f5',
        padding: '32px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <p
            style={{
              margin: 0,
              color: '#9ca3af',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: '12px',
            }}
          >
            LOQE Travel
          </p>
          <h1
            style={{
              fontSize: '56px',
              lineHeight: 1,
              margin: '12px 0 10px',
              fontWeight: 700,
            }}
          >
            Curated Experiences
          </h1>
          <p
            style={{
              color: '#cbd5e1',
              fontSize: '18px',
              maxWidth: '760px',
              margin: 0,
            }}
          >
            Filter by destination, experience type, traveller profile, and style
            to curate recommendations live during client conversations.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '28px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <FilterChips
            title="Destinations"
            items={destinations}
            selectedValue={selectedDestination}
            onSelect={setSelectedDestination}
          />

          <FilterChips
            title="Experience Type"
            items={categories}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <FilterChips
            title="Who is it for?"
            items={personas}
            selectedValue={selectedPersona}
            onSelect={setSelectedPersona}
          />

          <FilterChips
            title="Experience Style"
            items={lenses}
            selectedValue={selectedLens}
            onSelect={setSelectedLens}
          />

          <button
            onClick={() => {
              setSelectedDestination('')
              setSelectedCategory('')
              setSelectedPersona('')
              setSelectedLens('')
            }}
            style={{
              marginTop: '8px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid #475569',
              background: 'transparent',
              color: '#f5f5f5',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reset Filters
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px' }}>
            {loading ? 'Loading experiences...' : `${filteredExperiences.length} experiences`}
          </h2>
          {!loading && (
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Built from your live Sanity content
            </p>
          )}
        </div>

        {!loading && filteredExperiences.length === 0 && (
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
            }}
          >
            No matching experiences found. Try clearing a filter or publishing more
            entries in Sanity.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '22px',
          }}
        >
          {filteredExperiences.map((exp) => {
            const image =
              Array.isArray(exp.media) && exp.media.length > 0 ? exp.media[0] : null

            return (
              <div
                key={exp._id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '22px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                }}
              >
                {image && (
                  <img
                    src={urlFor(image).width(900).height(520).url()}
                    alt={exp.title}
                    style={{
                      width: '100%',
                      height: '220px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}

                <div style={{ padding: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '12px',
                      marginBottom: '10px',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '24px',
                        lineHeight: 1.15,
                      }}
                    >
                      {exp.title}
                    </h3>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        color: '#0b1020',
                        background: '#f8fafc',
                        padding: '7px 10px',
                        borderRadius: '999px',
                        fontWeight: 700,
                      }}
                    >
                      {exp.priceTier || '—'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px', color: '#cbd5e1' }}>
                    <strong>Destination:</strong> {exp.destinationName || '—'}
                  </p>

                  <p style={{ margin: '0 0 10px', color: '#cbd5e1' }}>
                    <strong>Category:</strong>{' '}
                    {Array.isArray(exp.category)
                      ? exp.category.join(', ')
                      : exp.category || '—'}
                  </p>

                  <p style={{ margin: '0 0 10px', color: '#cbd5e1' }}>
                    <strong>Persona:</strong>{' '}
                    {Array.isArray(exp.persona)
                      ? exp.persona.join(', ')
                      : exp.persona || '—'}
                  </p>

                  <p style={{ margin: '0 0 14px', color: '#cbd5e1' }}>
                    <strong>Lens:</strong>{' '}
                    {Array.isArray(exp.lens)
                      ? exp.lens.join(', ')
                      : exp.lens || '—'}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      fontSize: '15px',
                    }}
                  >
                    {exp.description || 'No description yet.'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
