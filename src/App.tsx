import { useState } from 'react'
import type { Entry } from './types'
import { loadEntries, saveEntries } from './storage'
import LogTab from './components/LogTab'
import TrendsTab from './components/TrendsTab'

type Tab = 'log' | 'trends'

const App = () => {
  const [tab, setTab] = useState<Tab>('log')
  const [entries, setEntries] = useState<ReadonlyArray<Entry>>(loadEntries)

  const addEntry = (entry: Entry): void => {
    const next = [entry, ...entries]
    setEntries(next)
    saveEntries(next)
  }

  return (
    <div>
      <div id="header">
        <h1>🌙 Inner Log</h1>
        <p>private · persistent · non-judgmental</p>
        <div id="tabs">
          <button
            className={`tab-btn${tab === 'log' ? ' active' : ''}`}
            onClick={() => setTab('log')}
          >
            Log Entry
          </button>
          <button
            className={`tab-btn${tab === 'trends' ? ' active' : ''}`}
            onClick={() => setTab('trends')}
          >
            Trends{entries.length > 0 ? ` (${entries.length})` : ''}
          </button>
        </div>
      </div>
      <div id="body">
        {tab === 'log'
          ? <LogTab onSave={addEntry} />
          : <TrendsTab entries={entries} />
        }
      </div>
    </div>
  )
}

export default App
