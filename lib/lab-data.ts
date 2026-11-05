export type Room = { id: string; name: string }

export type Product = {
  id: string
  name: string
  unit: string
  capacity: number
  boxRemaining: number
  lots: string[]
}

export type Person = { id: string; name: string }

export type LineStatus = 'ok' | 'warning' | 'error'

export type ConsumptionLine = {
  id: string
  productId: string
  lot: string
  qty: number
  reste: number
  personId: string
}

export type RoomEntry = {
  roomId: string
  closed: boolean
  lines: ConsumptionLine[]
}

export type DayEntry = { rooms: RoomEntry[] }

export type DayStatus = 'future' | 'empty' | 'pending' | 'complete'

export type RoomStatus = 'open' | 'closed' | 'error'

export const ROOMS: Room[] = [
  { id: 'serologie', name: 'Sérologie' },
  { id: 'biochimie', name: 'Biochimie' },
  { id: 'hematologie', name: 'Hématologie' },
  { id: 'microbiologie', name: 'Microbiologie' },
  { id: 'immunologie', name: 'Immunologie' },
  { id: 'hormonologie', name: 'Hormonologie' },
]

export const PRODUCTS: Product[] = [
  { id: 'hbs', name: 'Ag HBs (ELISA)', unit: 'tests', capacity: 96, boxRemaining: 60, lots: ['HB2405A', 'HB2407C'] },
  { id: 'hiv', name: 'HIV 1/2 Combo', unit: 'tests', capacity: 100, boxRemaining: 72, lots: ['HV1123', 'HV1189'] },
  { id: 'glu', name: 'Glucose GOD-PAP', unit: 'mL', capacity: 500, boxRemaining: 320, lots: ['GL0912', 'GL1004'] },
  { id: 'crea', name: 'Créatinine Jaffé', unit: 'mL', capacity: 250, boxRemaining: 140, lots: ['CR3321'] },
  { id: 'nfs', name: 'Diluant NFS', unit: 'mL', capacity: 1000, boxRemaining: 610, lots: ['DL7781', 'DL7790'] },
  { id: 'crp', name: 'CRP Latex', unit: 'tests', capacity: 50, boxRemaining: 34, lots: ['CP5501'] },
  { id: 'tsh', name: 'TSH Ultrasensible', unit: 'tests', capacity: 100, boxRemaining: 48, lots: ['TS0217', 'TS0230'] },
  { id: 'gram', name: 'Kit coloration Gram', unit: 'lames', capacity: 200, boxRemaining: 155, lots: ['GR4410'] },
]

export const PEOPLE: Person[] = [
  { id: 'abenali', name: 'A. Benali' },
  { id: 'kmansouri', name: 'K. Mansouri' },
  { id: 'shaddad', name: 'S. Haddad' },
  { id: 'ytahri', name: 'Y. Tahri' },
  { id: 'nbouzid', name: 'N. Bouzid' },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const roomById = (id: string) => ROOMS.find((r) => r.id === id)
export const personById = (id: string) => PEOPLE.find((p) => p.id === id)

export function expectedReste(product: Product, qty: number) {
  let expected = product.boxRemaining - qty
  while (expected < 0) expected += product.capacity
  return expected
}

export function getLineStatus(line: ConsumptionLine): LineStatus {
  const product = productById(line.productId)
  if (!product) return 'error'
  if (line.reste < 0 || line.reste > product.capacity) return 'error'
  return line.reste === expectedReste(product, line.qty) ? 'ok' : 'warning'
}

export function getRoomStatus(room: RoomEntry): RoomStatus {
  if (room.closed) return 'closed'
  if (room.lines.some((l) => getLineStatus(l) === 'error')) return 'error'
  return 'open'
}

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayStatus(date: Date, today: Date, entry?: DayEntry): DayStatus {
  if (toDateKey(date) > toDateKey(today)) return 'future'
  if (!entry || entry.rooms.length === 0) return 'empty'
  return entry.rooms.every((r) => r.closed) ? 'complete' : 'pending'
}

export function summarizeDay(status: DayStatus, entry?: DayEntry) {
  if (status === 'future') return 'Jour à venir — saisie indisponible'
  if (!entry || entry.rooms.length === 0) return 'Aucune consommation enregistrée'
  const closed = entry.rooms.filter((r) => r.closed).length
  const open = entry.rooms.length - closed
  const parts = [`${closed} salle${closed > 1 ? 's' : ''} clôturée${closed > 1 ? 's' : ''}`]
  if (open > 0) parts.push(`${open} en attente`)
  return parts.join(', ')
}

let idCounter = 0
export const newId = () => `l${Date.now().toString(36)}${(idCounter++).toString(36)}`

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function makeLine(rand: () => number, i: number, faulty = false): ConsumptionLine {
  const product = PRODUCTS[Math.floor(rand() * PRODUCTS.length)]
  const qty = Math.max(1, Math.round(rand() * (product.capacity / 6)))
  const reste = faulty ? expectedReste(product, qty) + 3 : expectedReste(product, qty)
  return {
    id: `seed-${i}-${Math.floor(rand() * 1e6)}`,
    productId: product.id,
    lot: product.lots[Math.floor(rand() * product.lots.length)],
    qty,
    reste,
    personId: PEOPLE[Math.floor(rand() * PEOPLE.length)].id,
  }
}

export function buildSeedData(today: Date): Record<string, DayEntry> {
  const data: Record<string, DayEntry> = {}
  for (let offset = 1; offset <= 70; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const rand = seededRandom(date.getFullYear() * 1000 + date.getMonth() * 40 + date.getDate())
    const roll = rand()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    if (isWeekend && roll < 0.6) continue
    if (!isWeekend && roll < 0.12) continue

    const pending = offset <= 6 ? roll < 0.55 : roll < 0.2
    const roomCount = 2 + Math.floor(rand() * 3)
    const shuffled = [...ROOMS].sort(() => rand() - 0.5).slice(0, roomCount)
    data[toDateKey(date)] = {
      rooms: shuffled.map((room, idx) => {
        const isOpen = pending && idx === shuffled.length - 1
        const lineCount = 1 + Math.floor(rand() * 3)
        return {
          roomId: room.id,
          closed: !isOpen,
          lines: Array.from({ length: lineCount }, (_, i) => makeLine(rand, i, isOpen && i === 0)),
        }
      }),
    }
  }
  return data
}
