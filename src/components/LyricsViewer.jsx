import { useRef, useEffect, useState, useCallback } from 'react'
import { expandLineBreaks } from '../utils/lyricsFormatting.js'
import SongPicker from './SongPicker.jsx'

export default function LyricsViewer({
  title,
  artist,
  lyrics,
  fontSize,
  speed,
  expandBreaks,
  songs,
  currentId,
  onSelectSong,
  onChangeFontSize,
  onChangeSpeed,
  onToggleExpandBreaks,
  onEdit,
}) {
  const scrollRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)
  const accumRef = useRef(0)

  // Pixels from the bottom at which we consider the song "done" —
  // roughly one viewport-height of empty space visible below the last word.
  const STOP_THRESHOLD_VH = 0.85

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

      // Stop when the trailing empty space (40vh spacer) is mostly visible —
      // i.e. the last word has scrolled well into view.
      const stopAt = el.scrollHeight - el.clientHeight * (1 + STOP_THRESHOLD_VH)
      if (el.scrollTop >= stopAt) {
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

  // Stop and restart from top when a new song is loaded
  useEffect(() => {
    setPlaying(false)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    accumRef.current = 0
  }, [currentId])

  const restart = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    accumRef.current = 0
    setPlaying(false)
  }

  const displayedLyrics = expandBreaks ? expandLineBreaks(lyrics) : lyrics

  return (
    <div className="fixed inset-0 flex flex-col bg-stage-bg">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b border-stage-border">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit song"
          className="p-1.5 -ml-1.5 text-ink-dim active:scale-90 transition shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <SongPicker songs={songs} onSelect={onSelectSong} currentId={currentId} />
        </div>
      </div>

      {/* Lyrics pane */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="lyrics-scroll h-full overflow-y-auto px-5 py-10"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          {lyrics ? (
            <pre className="whitespace-pre-wrap break-words font-body text-ink" style={{ fontSize: 'inherit' }}>
              {displayedLyrics}
            </pre>
          ) : (
            <p className="text-ink-faint text-sm mt-4">No song selected — pick one above or tap the edit icon to add lyrics.</p>
          )}
          <div style={{ height: '40vh' }} aria-hidden="true" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-stage-bg to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stage-bg to-transparent" />

        {/* Floating controls toggle */}
        <button
          type="button"
          onClick={() => setControlsOpen((o) => !o)}
          aria-label={controlsOpen ? 'Hide controls' : 'Show controls'}
          className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-stage-surface/90 border border-stage-border text-ink-dim shadow-lg backdrop-blur active:scale-90 transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${controlsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Controls drawer */}
      <div
        className={`border-t border-stage-border bg-stage-bg/95 backdrop-blur px-4 pt-3 transition-[max-height,padding] overflow-hidden ${
          controlsOpen ? 'max-h-80 pb-[max(0.75rem,env(safe-area-inset-bottom))]' : 'max-h-0 pb-0 border-t-0'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint w-12 shrink-0">Size</span>
            <input
              type="range"
              min={8}
              max={32}
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
              max={20}
              value={speed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-full accent-spot"
            />
            <span className="text-xs text-ink-faint font-mono w-7 text-right shrink-0">{speed}</span>
          </div>

          <button
            type="button"
            onClick={onToggleExpandBreaks}
            aria-pressed={expandBreaks}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
              expandBreaks ? 'border-spot/50 bg-spot/10 text-spot' : 'border-stage-border text-ink-faint'
            }`}
          >
            <span>Wider line spacing</span>
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${expandBreaks ? 'bg-spot' : 'bg-stage-border'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-stage-bg transition-transform ${expandBreaks ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
            </span>
          </button>

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
              disabled={!lyrics}
              aria-label={playing ? 'Pause' : 'Play'}
              className="p-4 rounded-full bg-spot text-stage-bg shadow-spotlight active:scale-90 transition disabled:opacity-40"
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
