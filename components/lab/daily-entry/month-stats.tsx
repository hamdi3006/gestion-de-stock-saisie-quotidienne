import { CheckCircle2, Hourglass, ListChecks, DoorOpen } from 'lucide-react'

type Props = { complete: number; pending: number; empty: number; lines: number; rooms: number }

export function MonthStats({ complete, pending, lines, rooms }: Props) {
  const items = [
    { label: 'Jours complétés', value: complete, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Jours en attente', value: pending, icon: Hourglass, tone: 'bg-orange-50 text-orange-600' },
    { label: 'Salles saisies', value: rooms, icon: DoorOpen, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Lignes de consommation', value: lines, icon: ListChecks, tone: 'bg-canvas text-brand' },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
        >
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <dt className="truncate text-xs text-muted-foreground">{label}</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
