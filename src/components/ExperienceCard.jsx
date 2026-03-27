import { urlFor } from '../image'

export default function ExperienceCard({ exp }) {
  const image =
    Array.isArray(exp.media) && exp.media.length > 0 ? exp.media[0] : null

  return (
    <div
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
}
