'use client'

import { useState } from 'react'
import { CalendarDays, DoorOpen, Lock, Plus, X } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  ROOMS,
  getRoomStatus,
  roomById,
  summarizeDay,
  toDateKey,
  type DayEntry,
  type RoomEntry,
  type RoomStatus,
} from '@/lib/lab-data'
import { RoomPanel } from './room-panel'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  entry?: DayEntry
  onEntryChange: (entry: DayEntry) => void
}

export function DaySheet({ open, onOpenChange, date, entry, onEntryChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 bg-[#F7FAFA] p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"
      >
        {date && <DaySheetBody key={toDateKey(date)} date={date} entry={entry} onEntryChange={onEntryChange} />}
      </SheetContent>
    </Sheet>
  )
}

const DOT: Record<RoomStatus, string> = {
  open: 'bg-orange-400',
  closed: 'bg-emerald-500',
  error: 'bg-red-500',
}

function DaySheetBody({
  date,
  entry,
  onEntryChange,
}: {
  date: Date
  entry?: DayEntry
  onEntryChange: (entry: DayEntry) => void
}) {
  const rooms = entry?.rooms ?? []
  const [active, setActive] = useState<string>(
    () => rooms.find((r) => !r.closed)?.roomId ?? rooms[0]?.roomId ?? 'add',
  )

  const title = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const available = ROOMS.filter((r) => !rooms.some((x) => x.roomId === r.id))
  const activeRoom = rooms.find((r) => r.roomId === active)

  const addRoom = (roomId: string) => {
    onEntryChange({ rooms: [...rooms, { roomId, closed: false, lines: [] }] })
    setActive(roomId)
  }

  const updateRoom = (next: RoomEntry) => {
    onEntryChange({ rooms: rooms.map((r) => (r.roomId === next.roomId ? next : r)) })
  }

  const removeRoom = (roomId: string) => {
    const remaining = rooms.filter((r) => r.roomId !== roomId)
    onEntryChange({ rooms: remaining })
    setActive(remaining[0]?.roomId ?? 'add')
  }

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-border bg-white px-5 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-brand text-white">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
          <div>
            <SheetTitle className="text-lg font-semibold capitalize text-brand">{title}</SheetTitle>
            <SheetDescription className="text-xs">
              {summarizeDay(rooms.length && rooms.every((r) => r.closed) ? 'complete' : 'pending', entry)}
            </SheetDescription>
          </div>
        </div>
        <SheetClose className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-canvas hover:text-brand">
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Fermer</span>
        </SheetClose>
      </header>

      <div className="border-b border-border bg-white px-5 md:px-6">
        <div role="tablist" aria-label="Salles" className="-mb-px flex gap-1 overflow-x-auto pt-2">
          {rooms.map((r) => {
            const status = getRoomStatus(r)
            const selected = active === r.roomId
            return (
              <button
                key={r.roomId}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(r.roomId)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-brand bg-canvas/60 text-brand'
                    : 'border-transparent text-slate-500 hover:bg-canvas/40 hover:text-brand',
                )}
              >
                {roomById(r.roomId)?.name}
                {status === 'closed' ? (
                  <Lock className="size-3.5 text-emerald-600" aria-label="clôturée" />
                ) : (
                  <span
                    className={cn('size-2 rounded-full', DOT[status], status === 'error' && 'animate-pulse')}
                    aria-label={status === 'error' ? 'erreur de reste' : 'ouverte'}
                  />
                )}
              </button>
            )
          })}
          {available.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={active === 'add'}
              onClick={() => setActive('add')}
              className={cn(
                'my-1.5 ml-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-colors',
                active === 'add'
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-300 text-slate-600 hover:border-brand hover:text-brand',
              )}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Ajouter une salle
            </button>
          )}
        </div>
      </div>

      {activeRoom ? (
        <RoomPanel
          key={activeRoom.roomId}
          room={activeRoom}
          onChange={updateRoom}
          onRemove={() => removeRoom(activeRoom.roomId)}
        />
      ) : (
        <AddRoomPanel available={available} onAdd={addRoom} />
      )}
    </>
  )
}

function AddRoomPanel({ available, onAdd }: { available: typeof ROOMS; onAdd: (id: string) => void }) {
  const items = available.map((r) => ({ value: r.id, label: r.name }))
  return (
    <div className="flex flex-1 items-center justify-center p-6 animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <div className="flex size-12 items-center justify-center rounded-full bg-canvas text-brand">
          <DoorOpen className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-brand">Ouvrir une salle</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez la salle pour commencer la saisie de ses consommations.
          </p>
        </div>
        {available.length > 0 ? (
          <Select items={items} value={null} onValueChange={(v) => v && onAdd(v as string)}>
            <SelectTrigger className="h-10 w-full bg-white" aria-label="Choisir une salle">
              <SelectValue placeholder="Choisir une salle…" />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">Toutes les salles ont été ajoutées.</p>
        )}
      </div>
    </div>
  )
}
