import { useState, useMemo, useRef, useEffect } from 'react'

export default function SongPicker({ songs, onSelect, currentId }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const current = songs.find((s) => s.id === currentId)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.artist || '').toLowerCase().includes(q)
    )
  }, [songs, query])

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('touchstart', onClickOutside)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('touchstart', onClickOutside)
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-stage-border bg-stage-surface px-3 py-2.5 text-left active:scale-[0.99] transition"
      >
        <span className="truncate text-sm">
          {current ? (
            <>
              <span className="text-ink">{current.title}</span>
              {current.artist && (
                <span className="text-ink-faint"> · {current.artist}</span>
              )}
            </>
          ) : (
            <span className="text-ink-faint">
              {songs.length ? 'Open a saved song…' : 'No saved songs yet'}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-stage-border bg-stage-surface2 shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-2 border-b border-stage-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or artist…"
              className="w-full rounded-md bg-stage-bg border border-stage-border px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-spot"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto lyrics-scroll">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink-faint">No matches</li>
            )}
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(s.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-stage-surface transition flex flex-col ${
                    s.id === currentId ? 'bg-stage-surface' : ''
                  }`}
                >
                  <span className="text-ink truncate">{s.title}</span>
                  {s.artist && (
                    <span className="text-xs text-ink-faint truncate">{s.artist}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
