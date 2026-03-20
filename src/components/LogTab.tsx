import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mood, SubstanceEntry, Entry } from '../types';
import { MOODS, ANXIETY_LABELS, PRESETS } from '../constants';
import { Knob } from './Knob';

interface Props {
  readonly onSave: (entry: Entry) => void;
}

type ActiveSubs = Readonly<Record<string, SubstanceEntry>>;

const spring = { type: 'spring', stiffness: 400, damping: 24 } as const;

// ── Substance icons ────────────────────────────────────────────────────────

const IconNicotine = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    aria-hidden="true"
  >
    <line
      x1="2"
      y1="11"
      x2="15"
      y2="11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect
      x="15.5"
      y="8.5"
      width="2.5"
      height="5"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="18.5"
      y="8.5"
      width="2"
      height="5"
      rx="0.5"
      fill="currentColor"
      opacity="0.35"
    />
  </svg>
);

const IconCannabis = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11 3 C7 6 5 10 7 14 C8.5 12 11 11 11 11 C11 11 13.5 12 15 14 C17 10 15 6 11 3Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <line
      x1="11"
      y1="11"
      x2="11"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="8.5"
      y1="16"
      x2="13.5"
      y2="16"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const IconCaffeine = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 8 L16 8 L14.5 18 L7.5 18 Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 11 Q18 11 18 13.5 Q18 16 14.5 16"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M9 6 Q9.5 4 11 4 Q12.5 4 13 6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const IconAlcohol = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7 3 L15 3 L13.2 10.5 Q12.5 13.5 11 13.5 Q9.5 13.5 8.8 10.5 Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <line
      x1="11"
      y1="13.5"
      x2="11"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="19"
      x2="14"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const SUBSTANCE_ICONS: Record<string, React.ReactNode> = {
  Nicotine: <IconNicotine />,
  Cannabis: <IconCannabis />,
  Caffeine: <IconCaffeine />,
  Alcohol: <IconAlcohol />,
};

// ──────────────────────────────────────────────────────────────────────────

const LogTab = ({ onSave }: Props) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [anxiety, setAnxiety] = useState(3);
  const [sleepH, setSleepH] = useState(7);
  const [sleepQ, setSleepQ] = useState(5);
  const [activeSubs, setActiveSubs] = useState<ActiveSubs>({});
  const [customSub, setCustomSub] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const allSubs = [
    ...PRESETS,
    ...Object.keys(activeSubs).filter((s) => !PRESETS.includes(s)),
  ];

  const toggleSub = (name: string): void => {
    setActiveSubs((prev) => {
      if (prev[name]) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: { amount: '', unit: '' } };
    });
  };

  const addCustomSub = (): void => {
    const s = customSub.trim();
    if (!s) return;
    setActiveSubs((prev) => ({ ...prev, [s]: { amount: '', unit: '' } }));
    setCustomSub('');
  };

  const updateSub = (
    name: string,
    field: keyof SubstanceEntry,
    value: string,
  ): void => {
    setActiveSubs((prev) => {
      const existing: SubstanceEntry = prev[name] ?? { amount: '', unit: '' };
      return { ...prev, [name]: { ...existing, [field]: value } };
    });
  };

  const saveEntry = (): void => {
    if (!selectedMood) return;
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
    });
    setSelectedMood(null);
    setAnxiety(3);
    setSleepH(7);
    setSleepQ(5);
    setActiveSubs({});
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const anxietyLabel = ANXIETY_LABELS[anxiety - 1] ?? '';

  return (
    <div className="log-root">
      {/* ── Mood ── */}
      <div className="section">
        <span className="label">Mood</span>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <motion.button
              key={m.score}
              className={`mood-btn${selectedMood?.score === m.score ? ' active' : ''}`}
              onClick={() => setSelectedMood(m)}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              aria-pressed={selectedMood?.score === m.score}
            >
              <span className="mood-emoji" aria-hidden="true">
                {m.emoji}
              </span>
              <span className="mood-label-text">{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Anxiety ── */}
      <div className="section">
        <div className="knob-section-header">
          <span className="label" style={{ marginBottom: 0 }}>
            Anxiety
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={anxietyLabel}
              className="knob-sublabel"
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.12 }}
            >
              {anxietyLabel}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="knob-row">
          <Knob
            value={anxiety}
            min={1}
            max={9}
            label={`Anxiety — ${anxietyLabel}`}
            onChange={setAnxiety}
            size={104}
          />
        </div>
      </div>

      {/* ── Sleep ── */}
      <div className="section">
        <span className="label">Sleep last night</span>
        <div className="knob-pair">
          <div className="knob-col">
            <Knob
              value={sleepH}
              min={0}
              max={12}
              step={0.5}
              label="Sleep hours"
              displayValue={`${sleepH}h`}
              onChange={setSleepH}
              size={104}
            />
            <span className="knob-sub" aria-hidden="true">
              hours
            </span>
          </div>
          <div className="knob-divider" aria-hidden="true" />
          <div className="knob-col">
            <Knob
              value={sleepQ}
              min={1}
              max={9}
              label="Sleep quality"
              onChange={setSleepQ}
              size={104}
            />
            <span className="knob-sub" aria-hidden="true">
              quality
            </span>
          </div>
        </div>
      </div>

      {/* ── Substances ── */}
      <div className="section">
        <span className="label">Substances</span>
        <div className="sub-grid">
          {allSubs.map((name) => {
            const icon = SUBSTANCE_ICONS[name];
            const isActive = !!activeSubs[name];
            return (
              <motion.button
                key={name}
                className={`sub-btn${isActive ? ' active' : ''}`}
                onClick={() => toggleSub(name)}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                aria-pressed={isActive}
              >
                <span className="sub-icon" aria-hidden="true">
                  {icon ?? <span className="sub-icon-initial">{name[0]}</span>}
                </span>
                <span className="sub-name">{name}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {Object.keys(activeSubs).length > 0 && (
            <motion.div
              className="sub-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              {Object.keys(activeSubs).map((name) => (
                <motion.div
                  key={name}
                  className="sub-item"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={spring}
                >
                  <span className="sub-item-name">{name}</span>
                  <input
                    type="text"
                    placeholder="amount"
                    aria-label={`${name} amount`}
                    value={activeSubs[name]?.amount ?? ''}
                    onChange={(e) => updateSub(name, 'amount', e.target.value)}
                    style={{ width: 58 }}
                  />
                  <input
                    type="text"
                    placeholder="unit"
                    aria-label={`${name} unit`}
                    value={activeSubs[name]?.unit ?? ''}
                    onChange={(e) => updateSub(name, 'unit', e.target.value)}
                    style={{ width: 46 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="custom-row">
          <input
            type="text"
            placeholder="Add substance…"
            value={customSub}
            onChange={(e) => setCustomSub(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustomSub();
            }}
          />
          <motion.button
            className="custom-add-btn"
            onClick={addCustomSub}
            whileTap={{ scale: 0.92 }}
            aria-label="Add custom substance"
          >
            +
          </motion.button>
        </div>
      </div>

      {/* ── Note ── */}
      <div className="section">
        <span className="label">Thoughts</span>
        <textarea
          placeholder="What's on your mind…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* ── Save ── */}
      <motion.button
        id="save-btn"
        className={selectedMood ? 'ready' : ''}
        onClick={saveEntry}
        whileTap={selectedMood ? { scale: 0.985 } : {}}
        transition={spring}
        disabled={!selectedMood}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={saved ? 'saved' : 'save'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.12 }}
            style={{ display: 'inline-block' }}
          >
            {saved ? '✓  Saved' : 'Save entry'}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default LogTab;
