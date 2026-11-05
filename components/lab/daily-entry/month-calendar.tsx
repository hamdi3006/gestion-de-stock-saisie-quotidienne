'use client'

import { CheckCircle2, ChevronLeft, ChevronRight, Hourglass, Lock, Plus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getDayStatus, summarizeDay, toDateKey, type DayEntry, type DayStatus } from '@/lib/lab-data'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const DAY_STYLES: Record<DayStatus, { cell: string; icon: string; label: string; swatch: string }> = {
  future: {
    cell: 'bg-slate-100/80 text-slate-400 cursor-not-allowed',
    icon: 'text-slate-300',
    label: 'Jour à venir',
    swatch: 'bg-slate-200',
  },
  empty: {
    cell: 'bg-sky-50 text-sky-900 ring-sky-100 hover:bg-sky-100 hover:ring-sky-200',
    icon: 'text-sky-400',
    label: 'Aucune consommation',
    swatch: 'bg-sky-200',
  },
  pending: {
    cell: 'bg-orange-50 text-orange-900 ring-orange-100 hover:bg-orange-100 hover:ring-orange-200',
    icon: 'text-orange-500',
    label: 'En attente de clôture',
    swatch: 'bg-orange-300',
  },
  complete: {
    cell: 'bg-emerald-50 text-emerald-900 ring-emerald-100 hover:bg-emerald-100 hover:ring-emerald-200',
    icon: 'text-emerald-600',
    label: 'Journée complète',
    swatch: 'bg-emerald-300',
  },
}

const ICONS: Record<DayStatus, typeof Lock> = {
  future: Lock,
  empty: Plus,
  pending: Hourglass,
  complete: CheckCircle2,
}

type Props = {
  cursor: Date
  today: Date
  days: Record<string, DayEntry>
  selectedKey: string | null
  onCursorChange: (d: Date) => void
  onSelectDay: (d: Date) => void
}

export function MonthCalendar({ cursor, today, days, selectedKey, onCursorChange, onSelectDay }: Props) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (new Date(year, month, 1).getDay() + 6) % 7
  const todayKey = toDateKey(today)
  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <TooltipProvider delay={150}>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize text-brand">{monthLabel}</h2>
            <p className="text-xs text-muted-foreground">Cliquez sur un jour pour saisir ou consulter les consommations.</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={() => onCursorChange(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand ring-1 ring-border transition-colors hover:bg-canvas"
              >
                {"Aujourd'hui"}
              </button>
            )}
            <div className="flex items-center rounded-lg ring-1 ring-border">
              <button
                type="button"
                onClick={() => onCursorChange(new Date(year, month - 1, 1))}
                className="rounded-l-lg p-2 text-brand transition-colors hover:bg-canvas"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="sr-only">Mois précédent</span>
              </button>
              <button
                type="button"
                onClick={() => onCursorChange(new Date(year, month + 1, 1))}
                className="rounded-r-lg border-l border-border p-2 text-brand transition-colors hover:bg-canvas"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
                <span className="sr-only">Mois suivant</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-2.5" role="grid" aria-label={`Calendrier ${monthLabel}`}>
          {WEEKDAYS.map((d) => (
            <div key={d} role="columnheader" className="pb-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {d}
            </div>
          ))}

          {Array.from({ length: leading }, (_, i) => (
            <div key={`pad-${i}`} aria-hidden="true" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1)
            const key = toDateKey(date)
            const entry = days[key]
            const status = getDayStatus(date, today, entry)
            const style = DAY_STYLES[status]
            const Icon = ICONS[status]
            const summary = summarizeDay(status, entry)
            const isToday = key === todayKey
            const isSelected = key === selectedKey
            const isFuture = status === 'future'
            const fullLabel = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

            return (
              <Tooltip key={key}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-disabled={isFuture}
                      aria-label={`${fullLabel} — ${summary}`}
                      onClick={() => !isFuture && onSelectDay(date)}
                      className={cn(
                        'group relative flex h-16 flex-col justify-between rounded-lg p-2 text-left ring-1 ring-transparent transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-20 md:h-24 md:p-3',
                        style.cell,
                        !isFuture && 'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
                        isSelected && 'ring-2 ring-brand shadow-md',
                      )}
                    />
                  }
                >
                  <span className="flex items-start justify-between">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-sm font-semibold tabular-nums md:size-7',
                        isToday && 'bg-brand text-white',
                      )}
                    >
                      {i + 1}
                    </span>
                    <Icon
                      className={cn(
                        'size-3.5 transition-transform duration-200 md:size-4',
                        style.icon,
                        !isFuture && 'group-hover:scale-110',
                        status === 'empty' && 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                      )}
                      aria-hidden="true"
                    />
                  </span>
                  {isToday && (
                    <span className="hidden text-[10px] font-medium uppercase tracking-wider text-brand/70 md:block">
                      {"Aujourd'hui"}
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent className="flex-col items-start gap-0.5 px-3 py-2">
                  <span className="font-semibold capitalize">{fullLabel}</span>
                  <span className="opacity-80">{summary}</span>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <Legend />
      </div>
    </TooltipProvider>
  )
}

function Legend() {
  const order: DayStatus[] = ['future', 'empty', 'pending', 'complete']
  return (
    <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4" aria-label="Légende">
      <li className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Légende</li>
      {order.map((s) => {
        const Icon = ICONS[s]
        return (
          <li key={s} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={cn('flex size-5 items-center justify-center rounded', DAY_STYLES[s].cell)}>
              <Icon className={cn('size-3', DAY_STYLES[s].icon)} aria-hidden="true" />
            </span>
            {DAY_STYLES[s].label}
          </li>
        )
      })}
    </ul>
  )
}
