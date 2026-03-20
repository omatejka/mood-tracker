import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip,
} from 'chart.js'
import type { Entry } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip)

interface Props {
  readonly entries: ReadonlyArray<Entry>
}

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const formatDateTime = (ts: number): string =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const TrendsTab = ({ entries }: Props) => {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  if (entries.length === 0) {
    return <div id="empty">No entries yet.</div>
  }

  const recent = [...entries].reverse().slice(-30)
  const labels = recent.map(e => formatDate(e.ts))

  const chartData = {
    labels,
    datasets: [
      { label: 'Mood', data: recent.map(e => e.mood), borderColor: '#c9b8f5', tension: 0.3, pointRadius: 2, borderWidth: 2, fill: false },
      { label: 'Anxiety', data: recent.map(e => e.anxiety), borderColor: '#f87171', tension: 0.3, pointRadius: 2, borderWidth: 2, fill: false },
      { label: 'Sleep h', data: recent.map(e => e.sleepH), borderColor: '#34d399', tension: 0.3, pointRadius: 2, borderWidth: 2, fill: false },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: '#1e2130' } },
      y: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: '#1e2130' }, min: 0, max: 12 },
    },
  }

  const analyze = async (): Promise<void> => {
    setAiLoading(true)
    const summary = [...entries].slice(0, 20).reverse().map(e => ({
      date: formatDate(e.ts),
      mood: `${e.moodLabel}(${e.mood}/10)`,
      anxiety: `${e.anxiety}/9`,
      sleep: `${e.sleepH}h q${e.sleepQ}`,
      substances: Object.keys(e.substances).join(',') || 'none',
      note: e.note,
    }))
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: 'You are a compassionate, non-judgmental mental wellness companion. Analyze the journal entries. Write 2–3 short paragraphs noting correlations between sleep, substances, anxiety and mood. Warm tone, no bullets, no clinical language, no disclaimers.',
          messages: [{ role: 'user', content: 'My journal entries:\n\n' + JSON.stringify(summary, null, 2) + '\n\nWhat patterns do you notice?' }],
        }),
      })
      const data = await res.json() as { content?: Array<{ type: string; text: string }> }
      setAiText(data.content?.find(b => b.type === 'text')?.text ?? 'Could not analyze.')
    } catch {
      setAiText('Analysis unavailable — check your connection.')
    }
    setAiLoading(false)
  }

  return (
    <div>
      {entries.length >= 3 && (
        <div className="chart-wrap">
          <span className="label">Last 30 entries</span>
          <Line data={chartData} options={chartOptions} height={180} />
        </div>
      )}

      <button id="analyze-btn" onClick={() => void analyze()} disabled={aiLoading}>
        {aiLoading ? 'Analyzing…' : aiText ? '✦ Refresh analysis' : '✦ Ask Claude to analyze my patterns'}
      </button>

      {aiText && <div id="ai-box">{aiText}</div>}

      <span className="label">All entries</span>
      <div id="entries-list">
        {entries.map(e => {
          const subs = Object.keys(e.substances)
          return (
            <div key={e.id} className="entry-card">
              <div className="top">
                <span className="mood-label">{e.moodEmoji} {e.moodLabel}</span>
                <span className="ts">{formatDateTime(e.ts)}</span>
              </div>
              <div className="meta">
                <span>Anxiety {e.anxiety}/9</span>
                <span>Sleep {e.sleepH}h (q{e.sleepQ})</span>
                {subs.length > 0 && <span>💊 {subs.join(', ')}</span>}
              </div>
              {e.note && <div className="note">{e.note}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrendsTab
