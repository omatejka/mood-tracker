import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Entry } from './types'
import { loadEntries, saveEntries } from './storage'
import LogTab from './components/LogTab'
import TrendsTab from './components/TrendsTab'

type Tab = 'log' | 'trends'

const tabContent = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15 } },
}

const App = () => {
  const [tab, setTab] = useState<Tab>('log')
  const [entries, setEntries] = useState<ReadonlyArray<Entry>>(loadEntries)

  const addEntry = (entry: Entry): void => {
    const next = [entry, ...entries]
    setEntries(next)
    saveEntries(next)
  }

  return (
    <div id="app-shell">
      <div id="header">
        <div id="header-top">
          <h1>Inner Log</h1>
          <span id="header-subtitle">private · persistent</span>
        </div>
        <div id="tabs">
          {(['log', 'trends'] as Tab[]).map(t => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'log' ? 'Log entry' : `Trends${entries.length > 0 ? ` (${entries.length})` : ''}`}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div id="body">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={tabContent}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {tab === 'log'
              ? <LogTab onSave={addEntry} />
              : <TrendsTab entries={entries} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
