import { useState, useMemo } from 'react'
import { useSongLibrary } from './hooks/useSongLibrary.js'
import SongPicker from './components/SongPicker.jsx'
import LyricsEditor from './components/LyricsEditor.jsx'
import LyricsViewer from './components/LyricsViewer.jsx'

const BLANK = { id: null, title: '', artist: '', lyrics: '', fontSize: 28, speed: 30 }

export default function App() {
  const { songs, upsertSong, deleteSong } = useSongLibrary()
  const [draft, setDraft] = useState(BLANK)
  const [mode, setMode] = useState('edit') // 'edit' | 'play'

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

  return (
    <div className="min-h-screen bg-stage-bg text-ink">
      {mode === 'edit' && (
        <div className="max-w-md mx-auto">
          <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spot shadow-spotlight" />
              <h1 className="font-display text-lg tracking-tight">Lyric Scroller</h1>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="text-xs text-ink-faint border border-stage-border rounded-md px-2.5 py-1.5 active:scale-95 transition"
            >
              New song
            </button>
          </header>

          <div className="px-4 pb-2">
            <SongPicker songs={songs} onSelect={loadSong} currentId={draft.id} />
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
          onChangeFontSize={(fontSize) => {
            setDraft((d) => ({ ...d, fontSize }))
            if (draft.id) upsertSong({ ...draft, fontSize })
          }}
          onChangeSpeed={(speed) => {
            setDraft((d) => ({ ...d, speed }))
            if (draft.id) upsertSong({ ...draft, speed })
          }}
          onBack={() => setMode('edit')}
        />
      )}
    </div>
  )
}
