import { useRef, useEffect, useCallback } from 'react'

interface KnobProps {
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step?: number
  readonly label: string
  readonly displayValue?: string
  readonly onChange: (v: number) => void
  readonly size?: number
}

const MIN_ANGLE = -135
const MAX_ANGLE = 135
const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arc(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const s = polar(cx, cy, r, a1)
  const e = polar(cx, cy, r, a2)
  const large = a2 - a1 > 180 ? 1 : 0
  return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r},0,${large},1,${e.x.toFixed(2)},${e.y.toFixed(2)}`
}

export const Knob = ({ value, min, max, step = 1, label, displayValue, onChange, size = 96 }: KnobProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ startAngle: number; startValue: number } | null>(null)

  const valueToAngle = (v: number) =>
    MIN_ANGLE + ((v - min) / (max - min)) * ANGLE_RANGE

  const getAngle = (clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0
    const rect = svgRef.current.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    return Math.atan2(dy, dx) * (180 / Math.PI) + 90
  }

  const angleToValue = (angle: number): number => {
    const clamped = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle))
    const raw = min + ((clamped - MIN_ANGLE) / ANGLE_RANGE) * (max - min)
    return Math.max(min, Math.min(max, Math.round(raw / step) * step))
  }

  const applyDelta = useCallback(
    (startAngle: number, startValue: number, cx: number, cy: number) => {
      let delta = getAngle(cx, cy) - startAngle
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      const raw = startValue + (delta / ANGLE_RANGE) * (max - min)
      const stepped = Math.round(raw / step) * step
      onChange(Math.max(min, Math.min(max, stepped)))
    },
    [max, min, step, onChange], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current) return
      applyDelta(drag.current.startAngle, drag.current.startValue, e.clientX, e.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!drag.current || !e.touches[0]) return
      e.preventDefault()
      applyDelta(drag.current.startAngle, drag.current.startValue, e.touches[0].clientX, e.touches[0].clientY)
    }
    const onUp = () => { drag.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [applyDelta])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const clickAngle = getAngle(e.clientX, e.clientY)
    const newValue = angleToValue(clickAngle)
    onChange(newValue)
    drag.current = { startAngle: clickAngle, startValue: newValue }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return
    const clickAngle = getAngle(e.touches[0].clientX, e.touches[0].clientY)
    const newValue = angleToValue(clickAngle)
    onChange(newValue)
    drag.current = { startAngle: clickAngle, startValue: newValue }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault(); onChange(Math.min(max, value + step))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault(); onChange(Math.max(min, value - step))
    } else if (e.key === 'Home') {
      e.preventDefault(); onChange(min)
    } else if (e.key === 'End') {
      e.preventDefault(); onChange(max)
    }
  }

  const pad = 14
  const r = size / 2 - pad
  const cx = size / 2
  const cy = size / 2
  const angle = valueToAngle(value)
  const ptr = polar(cx, cy, r, angle)

  return (
    <div className="knob-wrap">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onKeyDown={onKeyDown}
        className="knob-svg"
      >
        {/* Track background */}
        <path
          d={arc(cx, cy, r, MIN_ANGLE, MAX_ANGLE)}
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {angle > MIN_ANGLE && (
          <path
            d={arc(cx, cy, r, MIN_ANGLE, angle)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        {/* Pointer dot */}
        <circle cx={ptr.x} cy={ptr.y} r="3.5" fill="var(--accent)" />
        {/* Center value */}
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="knob-center-text"
        >
          {displayValue ?? value}
        </text>
      </svg>
      <span className="knob-label">{label}</span>
    </div>
  )
}
