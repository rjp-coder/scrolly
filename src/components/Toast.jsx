export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full flex justify-center">
      <div className="bg-stage-surface2 border border-stage-border text-ink text-sm px-4 py-2 rounded-full shadow-lg shadow-black/30 max-w-[90vw] truncate">
        {message}
      </div>
    </div>
  )
}
