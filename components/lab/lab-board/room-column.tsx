import { Inbox, TriangleAlert } from 'lucide-react'
import type { Room } from '@/lib/lab-data'
import type { LabBox } from '@/lib/lab-boxes'
import { BoxCard } from '@/components/lab/lab-board/box-card'

export function RoomColumn({ room, boxes }: { room: Room; boxes: LabBox[] }) {
  const alerts = boxes.filter((b) => b.status === 'perte').length
  const headingId = `col-${room.id}`

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-72 shrink-0 snap-start flex-col rounded-xl bg-white/60 ring-1 ring-black/5"
    >
      <header className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-3">
        <h2 id={headingId} className="truncate text-sm font-semibold text-brand">
          {room.name}
        </h2>
        <div className="flex items-center gap-1.5">
          {alerts > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
              <TriangleAlert className="size-3" aria-hidden="true" />
              {alerts}
              <span className="sr-only">alerte{alerts > 1 ? 's' : ''}</span>
            </span>
          )}
          <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
            {boxes.length}
            <span className="sr-only"> boîte{boxes.length > 1 ? 's' : ''}</span>
          </span>
        </div>
      </header>

      {boxes.length > 0 ? (
        <ul className="flex flex-col gap-2.5 p-3">
          {boxes.map((box) => (
            <li key={box.id}>
              <BoxCard box={box} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <Inbox className="size-5 text-slate-400" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">Aucune boîte correspondante</p>
        </div>
      )}
    </section>
  )
}
