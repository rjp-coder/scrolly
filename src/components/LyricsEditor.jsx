import { inferTitleFromText } from "../utils/lyricsFormatting.js";

export default function LyricsEditor({
  title,
  artist,
  lyrics,
  onChangeTitle,
  onChangeArtist,
  onChangeLyrics,
  onSave,
  onDelete,
  onPlay,
  hasSavedVersion,
  isDirty,
}) {
  // Infer the title from the first line of pasted lyrics, but only when the
  // title field is currently empty — never overwrite something the user typed.
  const handleLyricsPaste = (e) => {
    if (title.trim()) return;
    const pastedText = e.clipboardData?.getData("text");
    if (!pastedText) return;
    const inferred = inferTitleFromText(pastedText);
    if (inferred) onChangeTitle(inferred);
  };

  return (
    <div className="flex flex-col gap-3 px-4 pb-28 pt-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Song title"
          className="rounded-lg bg-stage-surface border border-stage-border px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-spot font-display"
        />
        <input
          value={artist}
          onChange={(e) => onChangeArtist(e.target.value)}
          placeholder="Artist (optional)"
          className="rounded-lg bg-stage-surface border border-stage-border px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-spot"
        />
      </div>

      <textarea
        value={lyrics}
        onChange={(e) => onChangeLyrics(e.target.value)}
        onPaste={handleLyricsPaste}
        placeholder="Paste your lyrics here…"
        rows={14}
        className="w-full rounded-lg bg-stage-surface border border-stage-border px-3 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-spot resize-y"
      />

      <div className="flex items-center gap-2 text-xs text-ink-faint">
        <span>
          {lyrics.trim()
            ? `${lyrics.trim().split(/\s+/).length} words`
            : "No lyrics yet"}
        </span>
        {isDirty && <span className="text-spot">· unsaved changes</span>}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-stage-border bg-stage-bg/95 backdrop-blur px-4 py-3 flex gap-2">
        {hasSavedVersion && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-stage-border px-3.5 py-2.5 text-sm text-ink-dim active:scale-[0.97] transition"
            aria-label="Delete song"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!lyrics.trim()}
          className="flex-1 rounded-lg border border-stage-border bg-stage-surface px-3.5 py-2.5 text-sm text-ink disabled:opacity-40 active:scale-[0.97] transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onPlay}
          disabled={!lyrics.trim()}
          className="flex-[1.4] rounded-lg bg-spot px-3.5 py-2.5 text-sm font-medium text-stage-bg disabled:opacity-40 active:scale-[0.97] transition shadow-spotlight"
        >
          Start scrolling
        </button>
      </div>
    </div>
  );
}
