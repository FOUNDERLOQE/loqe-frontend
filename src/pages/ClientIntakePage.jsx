import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import ClientProfileSection from '../components/ClientProfileSection'

const tripTypeOptions = [
  'Holiday',
  'Honeymoon',
  'Celebration',
  'Family Vacation',
  'Wellness Retreat',
  'Romantic Escape',
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
    notes: '',
  })

  const [clientProfile, setClientProfile] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
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

    if (form.budgetBand) {
      parts.push(`with a ${form.budgetBand} budget profile`)
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
      notes: form.notes,
      autoSummary,
      clientProfile,
    }
  }, [form, autoSummary, clientProfile])

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

      setSaveMessage('Client profile saved successfully.')

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
    <div className="page page-luxury">
      <div className="page-topbar">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>

      <header className="hero luxury-hero">
        <div className="hero-badge">LŌQÉ Client Profiling</div>
        <h1>Build the client story before the itinerary</h1>
        <p className="subtext hero-subtext">
          One elegant intake flow combining trip context and the full LŌQÉ client profile,
          so recommendations come from depth, not guesswork.
        </p>
      </header>

      <div className="intake-layout">
        <form className="intake-form" onSubmit={handleSubmit}>
          <section className="form-section glass-card">
            <div className="section-head">
              <div>
                <p className="section-kicker">Step 1</p>
                <h2>Trip Context</h2>
                <p className="section-copy">
                  Just the key trip facts needed to guide recommendations.
                </p>
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

            <div className="field-stack">
              <label className="field">
                <span>Planner notes</span>
                <textarea
                  rows="5"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Anything useful from the conversation that should influence recommendations."
                />
              </label>
            </div>
          </section>

          <ClientProfileSection
            value={clientProfile}
            onChange={setClientProfile}
          />

          <div className="form-actions">
            <button type="submit" className="primary-button luxury-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save and generate recommendations'}
            </button>
          </div>

          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </form>

        <aside className="preview-panel">
          <div className="preview-card luxury-preview glass-card">
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