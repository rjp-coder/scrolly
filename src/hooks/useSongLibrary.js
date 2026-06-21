import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lyric-scroller:songs'

function loadSongs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSongs(songs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
  } catch {
    // localStorage may be full or unavailable (private browsing) — fail quietly
  }
}

export function useSongLibrary() {
  const [songs, setSongs] = useState(loadSongs)

  useEffect(() => {
    saveSongs(songs)
  }, [songs])

  const upsertSong = useCallback((song) => {
    setSongs((prev) => {
      const id = song.id || crypto.randomUUID()
      const now = Date.now()
      const existingIndex = prev.findIndex((s) => s.id === id)
      const next = {
        id,
        title: song.title?.trim() || 'Untitled',
        artist: song.artist?.trim() || '',
        lyrics: song.lyrics ?? '',
        fontSize: song.fontSize ?? 28,
        speed: song.speed ?? 30,
        updatedAt: now,
        createdAt: existingIndex >= 0 ? prev[existingIndex].createdAt : now,
      }
      if (existingIndex >= 0) {
        const copy = [...prev]
        copy[existingIndex] = next
        return copy
      }
      return [next, ...prev]
    })
  }, [])

  const deleteSong = useCallback((id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { songs, upsertSong, deleteSong }
}
