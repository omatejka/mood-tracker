import { useState } from 'react'
import type { Mood, SubstanceEntry, Entry } from '../types'
import { MOODS, ANXIETY_LABELS, PRESETS } from '../constants'

interface Props {
  readonly onSave: (entry: Entry) => void
}

type ActiveSubs = Readonly<Record<string, SubstanceEntry>>

const LogTab = ({ onSave }: Props) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [anxiety, setAnxiety] = useState(3)
  const [sleepH, setSleepH] = useState(7)
  const [sleepQ, setSleepQ] = useState(5)
  const [activeSubs, setActiveSubs] = useState<ActiveSubs>({})
  const [customSub, setCustomSub] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const allSubs = [
    ...PRESETS,
    ...Object.keys(activeSubs).filter(s => !PRESETS.includes(s)),
  ]

  const toggleSub = (name: string): void => {
    setActiveSubs(prev => {
      if (prev[name]) {
        const { [name]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [name]: { amount: '', unit: '' } }
    })
  }

  const addCustomSub = (): void => {
    const s = customSub.trim()
    if (!s) return
    setActiveSubs(prev => ({ ...prev, [s]: { amount: '', unit: '' } }))
    setCustomSub('')
  }

  const updateSub = (name: string, field: keyof SubstanceEntry, value: string): void => {
    setActiveSubs(prev => {
      const existing: SubstanceEntry = prev[name] ?? { amount: '', unit: '' }
      return { ...prev, [name]: { ...existing, [field]: value } }
    })
  }

  const saveEntry = (): void => {
    if (!selectedMood) return
    onSave({
      id: Date.now(),
      ts: Date.now(),
      mood: selectedMood.score,
      moodLabel: selectedMood.label,
      moodEmoji: selectedMood.emoji,
      anxiety,
      sleepH,
      sleepQ,
      substances: { ...activeSubs },
      note,
    })
    setSelectedMood(null)
    setAnxiety(3)
    setSleepH(7)
    setSleepQ(5)
    setActiveSubs({})
    setNote('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const anxietyLabel = ANXIETY_LABELS[anxiety - 1] ?? ''

  return (
    <div>
      <div className="section">
        <span className="label">How are you feeling?</span>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button
              key={m.score}
              className={`mood-btn${selectedMood?.score === m.score ? ' active' : ''}`}
              onClick={() => setSelectedMood(m)}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <span className="label">Anxiety — {anxietyLabel}</span>
        <div className="slider-row">
          <input
            type="range" min="1" max="9" value={anxiety}
            onChange={e => setAnxiety(Number(e.target.value))}
          />
          <span className="slider-val">{anxiety}</span>
        </div>
      </div>

      <div className="section">
        <span className="label">Sleep last night</span>
        <div className="slider-row">
          <span className="slider-lbl">Hours</span>
          <input
            type="range" min="0" max="12" step="0.5" value={sleepH}
            onChange={e => setSleepH(Number(e.target.value))}
          />
          <span className="slider-val">{sleepH}h</span>
        </div>
        <div className="slider-row" style={{ marginTop: '0.4rem' }}>
          <span className="slider-lbl">Quality</span>
          <input
            type="range" min="1" max="9" value={sleepQ}
            onChange={e => setSleepQ(Number(e.target.value))}
          />
          <span className="slider-val">{sleepQ}</span>
        </div>
      </div>

      <div className="section">
        <span className="label">Substances (optional)</span>
        <div className="sub-grid">
          {allSubs.map(name => (
            <button
              key={name}
              className={`sub-btn${activeSubs[name] ? ' active' : ''}`}
              onClick={() => toggleSub(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {Object.keys(activeSubs).length > 0 && (
          <div className="sub-details">
            {Object.keys(activeSubs).map(name => (
              <div key={name} className="sub-item">
                <span>{name}</span>
                <input
                  type="text" placeholder="amount"
                  value={activeSubs[name]?.amount ?? ''}
                  onChange={e => updateSub(name, 'amount', e.target.value)}
                  style={{ width: 60 }}
                />
                <input
                  type="text" placeholder="unit"
                  value={activeSubs[name]?.unit ?? ''}
                  onChange={e => updateSub(name, 'unit', e.target.value)}
                  style={{ width: 48 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="custom-row">
          <input
            type="text" placeholder="Add custom…" value={customSub}
            onChange={e => setCustomSub(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustomSub() }}
          />
          <button className="sub-btn" onClick={addCustomSub}>+</button>
        </div>
      </div>

      <div className="section">
        <span className="label">Note (optional)</span>
        <textarea
          placeholder="What's on your mind…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <button
        id="save-btn"
        className={selectedMood ? 'ready' : ''}
        onClick={saveEntry}
      >
        {saved ? '✓ Saved' : 'Save entry'}
      </button>
    </div>
  )
}

export default LogTab
