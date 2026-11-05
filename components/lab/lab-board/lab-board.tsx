'use client'

import { useMemo, useState } from 'react'
import { Archive, PackageOpen, Search, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROOMS, productById } from '@/lib/lab-data'
import { LAB_BOXES, sortBoxes } from '@/lib/lab-boxes'
import { RoomColumn } from '@/components/lab/lab-board/room-column'

export function LabBoard() {
  const [query, setQuery] = useState('')
  const [roomFilter, setRoomFilter] = useState('all')
  const [hideStored, setHideStored] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LAB_BOXES.filter((box) => {
      if (hideStored && box.status === 'stockee') return false
      if (!q) return true
      const name = productById(box.productId)?.name.toLowerCase() ?? ''
      return name.includes(q) || box.lot.toLowerCase().includes(q)
    })
  }, [query, hideStored])

  const rooms = roomFilter === 'all' ? ROOMS : ROOMS.filter((r) => r.id === roomFilter)
  const counts = {
    perte: filtered.filter((b) => b.status === 'perte').length,
    entamee: filtered.filter((b) => b.status === 'entamee').length,
    stockee: filtered.filter((b) => b.status === 'stockee').length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par produit ou lot"
            aria-label="Rechercher par produit ou lot"
            className="pl-9"
          />
        </div>

        <Select
          value={roomFilter}
          onValueChange={(value) => setRoomFilter(value ?? 'all')}
          items={[{ value: 'all', label: 'Toutes les salles' }, ...ROOMS.map((r) => ({ value: r.id, label: r.name }))]}
        >
          <SelectTrigger className="w-full md:w-52" aria-label="Filtrer par salle">
            <SelectValue placeholder="Toutes les salles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les salles</SelectItem>
            {ROOMS.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <button
            type="button"
            role="switch"
            aria-checked={hideStored}
            onClick={() => setHideStored((v) => !v)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              hideStored ? 'bg-brand' : 'bg-slate-300',
            )}
          >
            <span
              className={cn(
                'inline-block size-4 rounded-full bg-white shadow transition-transform',
                hideStored ? 'translate-x-4.5' : 'translate-x-0.5',
              )}
            />
          </button>
          <span className="whitespace-nowrap">Masquer les boîtes non ouvertes</span>
        </label>
      </div>

      <ul className="flex flex-wrap items-center gap-2 text-xs" aria-label="Résumé des boîtes">
        <Legend icon={TriangleAlert} tone="bg-red-100 text-red-700" label="Pertes provisoires" value={counts.perte} />
        <Legend icon={PackageOpen} tone="bg-amber-100 text-amber-800" label="Entamées" value={counts.entamee} />
        <Legend icon={Archive} tone="bg-slate-200/70 text-slate-600" label="Stockées" value={counts.stockee} />
      </ul>

      <div className="-mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        {rooms.map((room) => (
          <RoomColumn key={room.id} room={room} boxes={sortBoxes(filtered.filter((b) => b.roomId === room.id))} />
        ))}
      </div>
    </div>
  )
}

function Legend({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: string
  label: string
  value: number
}) {
  return (
    <li className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium', tone)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
      <span className="font-semibold tabular-nums">{value}</span>
    </li>
  )
}
