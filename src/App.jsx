import { useState, useMemo, useEffect, useRef } from 'react'
import { useSongLibrary } from './hooks/useSongLibrary.js'
import { useTheme } from './hooks/useTheme.js'
import SongPicker from './components/SongPicker.jsx'
import LyricsEditor from './components/LyricsEditor.jsx'
import LyricsViewer from './components/LyricsViewer.jsx'

const BLANK = { id: null, title: '', artist: '', lyrics: '', fontSize: 28, speed: 30 }
const EXPAND_BREAKS_KEY = 'lyric-scroller:expand-breaks'

function getInitialExpandBreaks() {
  try {
    return localStorage.getItem(EXPAND_BREAKS_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const { songs, upsertSong, deleteSong, exportSongs, importSongs } = useSongLibrary()
  const { theme, toggleTheme } = useTheme()
  const [draft, setDraft] = useState(BLANK)
  const [mode, setMode] = useState('edit') // 'edit' | 'play'
  const [expandBreaks, setExpandBreaks] = useState(getInitialExpandBreaks)
  const [statusMessage, setStatusMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(EXPAND_BREAKS_KEY, expandBreaks ? '1' : '0')
    } catch {
      // ignore write failures
    }
  }, [expandBreaks])

  // Auto-clear transient status messages (e.g. "Imported 4 songs")
  useEffect(() => {
    if (!statusMessage) return
    const t = setTimeout(() => setStatusMessage(null), 4000)
    return () => clearTimeout(t)
  }, [statusMessage])

  const savedVersion = useMemo(
    () => songs.find((s) => s.id === draft.id),
    [songs, draft.id]
  )

  const isDirty = useMemo(() => {
    if (!savedVersion) return Boolean(draft.title || draft.artist || draft.lyrics)
    return (
      savedVersion.title !== draft.title ||
      savedVersion.artist !== draft.artist ||
      savedVersion.lyrics !== draft.lyrics
    )
  }, [savedVersion, draft])

  const loadSong = (id) => {
    const song = songs.find((s) => s.id === id)
    if (song) setDraft(song)
  }

  const handleSave = () => {
    const id = draft.id || crypto.randomUUID()
    const toSave = { ...draft, id }
    upsertSong(toSave)
    setDraft(toSave)
  }

  const handleDelete = () => {
    if (draft.id) deleteSong(draft.id)
    setDraft(BLANK)
  }

  const handleNew = () => setDraft(BLANK)

  const handleExport = () => {
    const json = exportSongs()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `lyric-scroller-export-${date}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    try {
      const text = await file.text()
      const count = importSongs(text)
      setStatusMessage(`Imported ${count} song${count === 1 ? '' : 's'}.`)
    } catch (err) {
      setStatusMessage(err.message || 'Import failed.')
    }
  }

  return (
    <div className="min-h-screen bg-stage-bg text-ink">
      {mode === 'edit' && (
        <div className="max-w-md mx-auto">
          <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-spot shadow-spotlight shrink-0" />
              <h1 className="font-display text-lg tracking-tight truncate">Lyric Scroller</h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 rounded-md border border-stage-border text-ink-dim active:scale-90 transition"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1.5M12 19.5V21M4.222 4.222l1.061 1.061M18.717 18.717l1.061 1.061M3 12h1.5M19.5 12H21M4.222 19.778l1.061-1.061M18.717 5.283l1.061-1.061M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={handleNew}
                className="text-xs text-ink-faint border border-stage-border rounded-md px-2.5 py-1.5 active:scale-95 transition"
              >
                New song
              </button>
            </div>
          </header>

          <div className="px-4 pb-2">
            <SongPicker songs={songs} onSelect={loadSong} currentId={draft.id} />
          </div>

          <div className="px-4 pb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={songs.length === 0}
              className="text-xs text-ink-faint border border-stage-border rounded-md px-2.5 py-1.5 active:scale-95 transition disabled:opacity-40"
            >
              Export all
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="text-xs text-ink-faint border border-stage-border rounded-md px-2.5 py-1.5 active:scale-95 transition"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
            {statusMessage && (
              <span className="text-xs text-spot truncate">{statusMessage}</span>
            )}
          </div>

          <LyricsEditor
            title={draft.title}
            artist={draft.artist}
            lyrics={draft.lyrics}
            onChangeTitle={(title) => setDraft((d) => ({ ...d, title }))}
            onChangeArtist={(artist) => setDraft((d) => ({ ...d, artist }))}
            onChangeLyrics={(lyrics) => setDraft((d) => ({ ...d, lyrics }))}
            onSave={handleSave}
            onDelete={handleDelete}
            onPlay={() => {
              if (isDirty) {
                const id = draft.id || crypto.randomUUID()
                const toSave = { ...draft, id }
                upsertSong(toSave)
                setDraft(toSave)
              }
              setMode('play')
            }}
            hasSavedVersion={Boolean(savedVersion)}
            isDirty={isDirty}
          />
        </div>
      )}

      {mode === 'play' && (
        <LyricsViewer
          title={draft.title}
          artist={draft.artist}
          lyrics={draft.lyrics}
          fontSize={draft.fontSize}
          speed={draft.speed}
          expandBreaks={expandBreaks}
          onChangeFontSize={(fontSize) => {
            setDraft((d) => ({ ...d, fontSize }))
            if (draft.id) upsertSong({ ...draft, fontSize })
          }}
          onChangeSpeed={(speed) => {
            setDraft((d) => ({ ...d, speed }))
            if (draft.id) upsertSong({ ...draft, speed })
          }}
          onToggleExpandBreaks={() => setExpandBreaks((v) => !v)}
          onBack={() => setMode('edit')}
        />
      )}
    </div>
  )
}
