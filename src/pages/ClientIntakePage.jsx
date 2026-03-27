import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

const tripTypeOptions = [
  'Holiday',
  'Honeymoon',
  'Celebration',
  'Family Vacation',
  'Wellness Retreat',
  'Romantic Escape',
]

const travelStyleOptions = [
  'Luxury',
  'Ultra Luxury',
  'Adventure',
  'Wellness',
  'Slow Travel',
  'Cultural',
  'Nature',
  'Romantic',
  'Family-Friendly',
  'Food-Focused',
  'Offbeat',
  'Beach',
  'Mountain',
  'City',
]

const climateOptions = ['Cold', 'Warm', 'Tropical', 'Mild', 'Snow']

const experienceOptions = [
  'Fine Dining',
  'Spa',
  'Beach Time',
  'Yachting',
  'Hiking',
  'Wildlife',
  'Museums',
  'Art',
  'Local Immersion',
  'Shopping',
  'Nightlife',
  'Road Trips',
  'Skiing',
  'Photography',
]

const budgetOptions = ['$$$', '$$$$', '$$$$$']

function ClientIntakePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    clientName: '',
    tripType: '',
    originCity: '',
    tripLengthDays: '',
    travellerCount: '',
    budgetBand: '',
    preferredClimate: [],
    travelStyle: [],
    desiredExperiences: [],
    mustAvoid: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function toggleArrayValue(fieldName, value) {
    setForm((prev) => {
      const currentValues = prev[fieldName]
      const exists = currentValues.includes(value)

      return {
        ...prev,
        [fieldName]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      }
    })
  }

  const autoSummary = useMemo(() => {
    const parts = []

    if (form.clientName) parts.push(`${form.clientName} is planning`)
    else parts.push('Client is planning')

    if (form.tripType) parts.push(`a ${form.tripType.toLowerCase()}`)

    if (form.tripLengthDays) parts.push(`for ${form.tripLengthDays} days`)

    if (form.originCity) parts.push(`from ${form.originCity}`)

    if (form.travellerCount) {
      parts.push(`for ${form.travellerCount} traveller${Number(form.travellerCount) > 1 ? 's' : ''}`)
    }

    if (form.budgetBand) parts.push(`with a ${form.budgetBand} budget profile`)

    if (form.preferredClimate.length) {
      parts.push(`preferring ${form.preferredClimate.join(', ').toLowerCase()} climates`)
    }

    if (form.travelStyle.length) {
      parts.push(`and a ${form.travelStyle.join(', ').toLowerCase()} travel style`)
    }

    if (form.desiredExperiences.length) {
      parts.push(`with interest in ${form.desiredExperiences.join(', ').toLowerCase()}`)
    }

    if (form.mustAvoid.trim()) {
      parts.push(`while avoiding ${form.mustAvoid}`)
    }

    return `${parts.join(' ')}.`
  }, [form])

  const structuredPreview = useMemo(() => {
    return {
      title: form.clientName
        ? `${form.clientName} - Travel Brief`
        : 'Untitled Travel Brief',
      clientName: form.clientName,
      tripType: form.tripType,
      originCity: form.originCity,
      tripLengthDays: Number(form.tripLengthDays) || null,
      travellerCount: Number(form.travellerCount) || null,
      budgetBand: form.budgetBand,
      preferredClimate: form.preferredClimate,
      travelStyle: form.travelStyle,
      desiredExperiences: form.desiredExperiences,
      mustAvoid: form.mustAvoid
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      notes: form.notes,
      autoSummary,
    }
  }, [form, autoSummary])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/create-trip-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structuredPreview),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save trip brief')
      }

      setSaveMessage('Client intake saved successfully.')

      setTimeout(() => {
        navigate('/recommendations')
      }, 800)
    } catch (err) {
      console.error('CREATE ERROR:', err)
      setSaveMessage(`Error saving trip brief: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero">
        <p className="eyebrow">LOQE</p>
        <h1>Client intake</h1>
        <p className="subtext">
          A guided intake built to feel premium, effortless, and structured enough to drive strong recommendations.
        </p>
      </header>

      <div className="intake-layout">
        <form className="intake-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Step 1</p>
                <h2>Core trip details</h2>
              </div>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Client name</span>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  placeholder="Rushabh Loke"
                />
              </label>

              <label className="field">
                <span>Trip type</span>
                <select
                  value={form.tripType}
                  onChange={(e) => updateField('tripType', e.target.value)}
                >
                  <option value="">Select trip type</option>
                  {tripTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Origin city</span>
                <input
                  type="text"
                  value={form.originCity}
                  onChange={(e) => updateField('originCity', e.target.value)}
                  placeholder="Mumbai"
                />
              </label>

              <label className="field">
                <span>Trip length (days)</span>
                <input
                  type="number"
                  min="1"
                  value={form.tripLengthDays}
                  onChange={(e) => updateField('tripLengthDays', e.target.value)}
                  placeholder="7"
                />
              </label>

              <label className="field">
                <span>Traveller count</span>
                <input
                  type="number"
                  min="1"
                  value={form.travellerCount}
                  onChange={(e) => updateField('travellerCount', e.target.value)}
                  placeholder="2"
                />
              </label>

              <label className="field">
                <span>Budget band</span>
                <select
                  value={form.budgetBand}
                  onChange={(e) => updateField('budgetBand', e.target.value)}
                >
                  <option value="">Select budget</option>
                  {budgetOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Step 2</p>
                <h2>Preference profile</h2>
              </div>
            </div>

            <div className="field-stack">
              <div className="field">
                <span>Preferred climate</span>
                <div className="chip-group">
                  {climateOptions.map((option) => {
                    const active = form.preferredClimate.includes(option)
                    return (
                      <button
                        type="button"
                        key={option}
                        className={`chip ${active ? 'chip-active' : ''}`}
                        onClick={() => toggleArrayValue('preferredClimate', option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="field">
                <span>Travel style</span>
                <div className="chip-group">
                  {travelStyleOptions.map((option) => {
                    const active = form.travelStyle.includes(option)
                    return (
                      <button
                        type="button"
                        key={option}
                        className={`chip ${active ? 'chip-active' : ''}`}
                        onClick={() => toggleArrayValue('travelStyle', option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="field">
                <span>Desired experiences</span>
                <div className="chip-group">
                  {experienceOptions.map((option) => {
                    const active = form.desiredExperiences.includes(option)
                    return (
                      <button
                        type="button"
                        key={option}
                        className={`chip ${active ? 'chip-active' : ''}`}
                        onClick={() => toggleArrayValue('desiredExperiences', option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Step 3</p>
                <h2>Refinement and notes</h2>
              </div>
            </div>

            <div className="field-stack">
              <label className="field">
                <span>Must avoid</span>
                <textarea
                  rows="4"
                  value={form.mustAvoid}
                  onChange={(e) => updateField('mustAvoid', e.target.value)}
                  placeholder="Crowded cities, red-eye flights, excessive transfers"
                />
              </label>

              <label className="field">
                <span>Planner notes</span>
                <textarea
                  rows="6"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add nuances from the client conversation here."
                />
              </label>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save and generate recommendations'}
            </button>
          </div>

          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </form>

        <aside className="preview-panel">
          <div className="preview-card luxury-preview">
            <p className="preview-label">Auto-generated brief summary</p>
            <h2>Client fit snapshot</h2>
            <p className="preview-summary">{autoSummary}</p>

            <div className="preview-divider" />

            <p className="preview-label">Structured preview</p>
            <pre className="preview-json">
              {JSON.stringify(structuredPreview, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ClientIntakePage