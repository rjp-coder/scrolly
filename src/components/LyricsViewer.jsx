import { useRef, useEffect, useState, useCallback } from 'react'

export default function LyricsViewer({
  title,
  artist,
  lyrics,
  fontSize,
  speed,
  onChangeFontSize,
  onChangeSpeed,
  onBack,
}) {
  const scrollRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)
  const accumRef = useRef(0) // sub-pixel accumulator

  const tick = useCallback(
    (ts) => {
      const el = scrollRef.current
      if (!el) return
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      accumRef.current += speed * dt
      if (accumRef.current >= 1) {
        const delta = Math.floor(accumRef.current)
        accumRef.current -= delta
        el.scrollTop += delta
      }

      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if (atEnd) {
        setPlaying(false)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [speed]
  )

  useEffect(() => {
    if (playing) {
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, tick])

  const restart = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    accumRef.current = 0
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-stage-bg">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b border-stage-border">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to editor"
          className="p-1.5 -ml-1.5 text-ink-dim active:scale-90 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm text-ink truncate">{title || 'Untitled'}</p>
          {artist && <p className="text-xs text-ink-faint truncate">{artist}</p>}
        </div>
        <button
          type="button"
          onClick={() => setControlsOpen((o) => !o)}
          aria-label={controlsOpen ? 'Hide controls' : 'Show controls'}
          className="p-1.5 text-ink-dim active:scale-90 transition"
        >
          <svg
            className={`w-5 h-5 transition-transform ${controlsOpen ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Lyrics pane with spotlight falloff */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="lyrics-scroll h-full overflow-y-auto px-5 py-10"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          <pre className="whitespace-pre-wrap break-words font-body text-ink" style={{ fontSize: 'inherit' }}>
            {lyrics}
          </pre>
          <div style={{ height: '40vh' }} aria-hidden="true" />
        </div>
        {/* top/bottom fade for stage-light feel */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-stage-bg to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stage-bg to-transparent" />
      </div>

      {/* Controls */}
      <div
        className={`border-t border-stage-border bg-stage-bg/95 backdrop-blur px-4 pt-3 transition-[max-height,padding] overflow-hidden ${
          controlsOpen ? 'max-h-64 pb-[max(0.75rem,env(safe-area-inset-bottom))]' : 'max-h-0 pb-0 border-t-0'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint w-12 shrink-0">Size</span>
            <input
              type="range"
              min={16}
              max={60}
              value={fontSize}
              onChange={(e) => onChangeFontSize(Number(e.target.value))}
              className="w-full accent-spot"
            />
            <span className="text-xs text-ink-faint font-mono w-7 text-right shrink-0">{fontSize}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint w-12 shrink-0">Speed</span>
            <input
              type="range"
              min={5}
              max={150}
              value={speed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-full accent-spot"
            />
            <span className="text-xs text-ink-faint font-mono w-7 text-right shrink-0">{speed}</span>
          </div>

          <div className="flex items-center justify-center gap-4 pt-1 pb-2">
            <button
              type="button"
              onClick={restart}
              aria-label="Restart"
              className="p-3 rounded-full border border-stage-border text-ink-dim active:scale-90 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
              className="p-4 rounded-full bg-spot text-stage-bg shadow-spotlight active:scale-90 transition"
            >
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="w-11" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
