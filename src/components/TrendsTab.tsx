import { useState } from 'react'
import { motion } from 'framer-motion'
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

const listVariants = {
  show: { transition: { staggerChildren: 0.045 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 360, damping: 28 } },
}

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
      { label: 'Mood',    data: recent.map(e => e.mood),    borderColor: '#7C72BE', tension: 0.35, pointRadius: 2, borderWidth: 2, fill: false },
      { label: 'Anxiety', data: recent.map(e => e.anxiety), borderColor: '#B86B55', tension: 0.35, pointRadius: 2, borderWidth: 2, fill: false },
      { label: 'Sleep h', data: recent.map(e => e.sleepH),  borderColor: '#6B9478', tension: 0.35, pointRadius: 2, borderWidth: 2, fill: false },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#A8A29E', font: { size: 11 }, boxWidth: 12 } },
    },
    scales: {
      x: { ticks: { color: '#A8A29E', font: { size: 9 } }, grid: { color: '#E4DFD9' } },
      y: { ticks: { color: '#A8A29E', font: { size: 9 } }, grid: { color: '#E4DFD9' }, min: 0, max: 12 },
    },
  }

  const analyze = async (): Promise<void> => {
    setAiLoading(true)
    const summary = [...entries].slice(0, 20).reverse().map(e => ({
      date:       formatDate(e.ts),
      mood:       `${e.moodLabel}(${e.mood}/10)`,
      anxiety:    `${e.anxiety}/9`,
      sleep:      `${e.sleepH}h q${e.sleepQ}`,
      substances: Object.keys(e.substances).join(',') || 'none',
      note:       e.note,
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
        <motion.div
          className="chart-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="label">Last 30 entries</span>
          <Line data={chartData} options={chartOptions} height={180} />
        </motion.div>
      )}

      <button id="analyze-btn" onClick={() => void analyze()} disabled={aiLoading}>
        {aiLoading ? 'Analyzing…' : aiText ? '↺ Refresh analysis' : '✦ Analyze patterns'}
      </button>

      {aiText && (
        <motion.div
          id="ai-box"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {aiText}
        </motion.div>
      )}

      <span className="label">All entries</span>
      <motion.div id="entries-list" variants={listVariants} initial="hidden" animate="show">
        {entries.map(e => {
          const subs = Object.keys(e.substances)
          return (
            <motion.div key={e.id} className="entry-card" variants={cardVariants}>
              <div className="top">
                <span className="mood-label">{e.moodEmoji} {e.moodLabel}</span>
                <span className="ts">{formatDateTime(e.ts)}</span>
              </div>
              <div className="meta">
                <span>Anxiety {e.anxiety}/9</span>
                <span>Sleep {e.sleepH}h (q{e.sleepQ})</span>
                {subs.length > 0 && <span>{subs.join(', ')}</span>}
              </div>
              {e.note && <div className="note">{e.note}</div>}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default TrendsTab
