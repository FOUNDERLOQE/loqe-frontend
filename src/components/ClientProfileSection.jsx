import { useEffect, useState } from 'react'
import { clientProfileSchema } from '../data/clientProfileSchema'

const defaultAnnualRow = {
  year: '',
  majorLifeChanges: '',
  updatedTravelPreferences: '',
  upcomingImportantDates: '',
}

function buildInitialState() {
  const initial = {}

  clientProfileSchema.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        initial[field.key] = []
      } else if (field.type === 'arrayOfObjects') {
        initial[field.key] = [{ ...defaultAnnualRow }]
      } else if (field.type === 'radioWithOther') {
        initial[field.key] = ''
        initial[`${field.key}Other`] = ''
      } else {
        initial[field.key] = ''
      }
    })
  })

  return initial
}

function ClientProfileSection({ value, onChange }) {
  const [localData, setLocalData] = useState(buildInitialState())

  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setLocalData((prev) => ({
        ...prev,
        ...value,
      }))
    }
  }, [value])

  function updateField(key, newValue) {
    const updated = { ...localData, [key]: newValue }
    setLocalData(updated)
    onChange?.(updated)
  }

  function toggleCheckbox(key, option) {
    const current = localData[key] || []
    const updatedValues = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]

    updateField(key, updatedValues)
  }

  function updateAnnualRow(index, fieldKey, fieldValue) {
    const rows = [...(localData.annualReviewLog || [])]
    rows[index] = { ...rows[index], [fieldKey]: fieldValue }
    updateField('annualReviewLog', rows)
  }

  function addAnnualRow() {
    updateField('annualReviewLog', [
      ...(localData.annualReviewLog || []),
      { ...defaultAnnualRow },
    ])
  }

  return (
    <section className="form-section glass-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Step 2</p>
          <h2>Client Profile</h2>
          <p className="section-copy">
            The exact LŌQÉ questionnaire, preserved word-for-word.
          </p>
        </div>
      </div>

      <div className="field-stack">
        {clientProfileSchema.map((section) => (
          <div key={section.id} className="profile-block">
            <div className="section-head">
              <div>
                <p className="section-kicker">{section.title}</p>
                <h3>{section.subtitle}</h3>
              </div>
            </div>

            <div className="field-stack">
              {section.fields.map((field) => {
                if (field.type === 'text') {
                  return (
                    <label key={field.key} className="field">
                      <span>{field.label}</span>
                      <input
                        type="text"
                        value={localData[field.key] || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                      />
                    </label>
                  )
                }

                if (field.type === 'textarea') {
                  return (
                    <label key={field.key} className="field">
                      <span>{field.label}</span>
                      <textarea
                        rows="4"
                        value={localData[field.key] || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                      />
                    </label>
                  )
                }

                if (field.type === 'radio') {
                  return (
                    <div key={field.key} className="field">
                      <span>{field.label}</span>
                      <div className="chip-group">
                        {field.options.map((option) => {
                          const active = localData[field.key] === option

                          return (
                            <button
                              type="button"
                              key={option}
                              className={`chip ${active ? 'chip-active' : ''}`}
                              onClick={() => updateField(field.key, option)}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                if (field.type === 'radioWithOther') {
                  return (
                    <div key={field.key} className="field">
                      <span>{field.label}</span>
                      <div className="chip-group">
                        {field.options.map((option) => {
                          const active = localData[field.key] === option

                          return (
                            <button
                              type="button"
                              key={option}
                              className={`chip ${active ? 'chip-active' : ''}`}
                              onClick={() => updateField(field.key, option)}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>

                      {localData[field.key] === 'Other' && (
                        <input
                          type="text"
                          value={localData[`${field.key}Other`] || ''}
                          onChange={(e) =>
                            updateField(`${field.key}Other`, e.target.value)
                          }
                          placeholder="Other"
                        />
                      )}
                    </div>
                  )
                }

                if (field.type === 'checkbox') {
                  return (
                    <div key={field.key} className="field">
                      <span>{field.label}</span>
                      <div className="chip-group">
                        {field.options.map((option) => {
                          const active = (localData[field.key] || []).includes(option)

                          return (
                            <button
                              type="button"
                              key={option}
                              className={`chip ${active ? 'chip-active' : ''}`}
                              onClick={() => toggleCheckbox(field.key, option)}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                if (field.type === 'arrayOfObjects') {
                  return (
                    <div key={field.key} className="field">
                      <span>{field.label}</span>

                      <div className="field-stack">
                        {(localData.annualReviewLog || []).map((row, rowIndex) => (
                          <div key={rowIndex} className="annual-review-card">
                            {field.columns.map((col) => (
                              <label key={col.key} className="field">
                                <span>{col.label}</span>
                                <textarea
                                  rows={col.key === 'year' ? 1 : 3}
                                  value={row[col.key] || ''}
                                  onChange={(e) =>
                                    updateAnnualRow(rowIndex, col.key, e.target.value)
                                  }
                                />
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={addAnnualRow}
                      >
                        Add Review Year
                      </button>
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ClientProfileSection