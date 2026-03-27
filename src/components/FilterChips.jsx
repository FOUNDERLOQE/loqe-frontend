export default function FilterChips({ title, items, selectedValue, onSelect }) {
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
