'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { buildSeedData, getDayStatus, toDateKey, type DayEntry } from '@/lib/lab-data'
import { MonthCalendar } from './month-calendar'
import { MonthStats } from './month-stats'
import { DaySheet } from './day-sheet'

const subscribe = () => () => {}

// "Today" depends on the user's local clock and timezone, so the calendar is rendered client-side only.
export function DailyEntry() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  if (!mounted) return <DailyEntrySkeleton />
  return <DailyEntryClient />
}

function DailyEntrySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Chargement du calendrier">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/5" />
        ))}
      </div>
      <div className="h-[640px] animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/5" />
    </div>
  )
}

function DailyEntryClient() {
  const [today] = useState(() => new Date())
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [days, setDays] = useState<Record<string, DayEntry>>(() => buildSeedData(today))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const monthStats = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const count = new Date(year, month + 1, 0).getDate()
    const stats = { complete: 0, pending: 0, empty: 0, lines: 0, rooms: 0 }
    for (let d = 1; d <= count; d++) {
      const date = new Date(year, month, d)
      const entry = days[toDateKey(date)]
      const status = getDayStatus(date, today, entry)
      if (status === 'complete') stats.complete++
      if (status === 'pending') stats.pending++
      if (status === 'empty') stats.empty++
      if (entry) {
        stats.rooms += entry.rooms.length
        stats.lines += entry.rooms.reduce((sum, r) => sum + r.lines.length, 0)
      }
    }
    return stats
  }, [cursor, days, today])

  const openDay = (date: Date) => {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null

  return (
    <div className="flex flex-col gap-6">
      <MonthStats {...monthStats} />
      <MonthCalendar
        cursor={cursor}
        today={today}
        days={days}
        selectedKey={sheetOpen ? selectedKey : null}
        onCursorChange={setCursor}
        onSelectDay={openDay}
      />
      <DaySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDate}
        entry={selectedKey ? days[selectedKey] : undefined}
        onEntryChange={(entry) => {
          if (!selectedKey) return
          setDays((prev) => ({ ...prev, [selectedKey]: entry }))
        }}
      />
    </div>
  )
}
