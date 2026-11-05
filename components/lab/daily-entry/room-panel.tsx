'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Lock, PackageOpen, Plus, ShieldCheck, Trash2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  PEOPLE,
  PRODUCTS,
  expectedReste,
  getLineStatus,
  newId,
  personById,
  productById,
  roomById,
  type ConsumptionLine,
  type LineStatus,
  type RoomEntry,
} from '@/lib/lab-data'

type Props = { room: RoomEntry; onChange: (room: RoomEntry) => void; onRemove: () => void }

export function RoomPanel({ room, onChange, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false)
  const statuses = room.lines.map(getLineStatus)
  const errors = statuses.filter((s) => s === 'error').length
  const warnings = statuses.filter((s) => s === 'warning').length
  const roomName = roomById(room.roomId)?.name ?? ''

  const addLine = (line: ConsumptionLine) => onChange({ ...room, lines: [...room.lines, line] })
  const deleteLine = (id: string) => onChange({ ...room, lines: room.lines.filter((l) => l.id !== id) })
  const closeRoom = () => {
    onChange({ ...room, closed: true })
    setConfirming(false)
  }

  const canClose = room.lines.length > 0 && errors === 0

  return (
    <TooltipProvider delay={100}>
      <div className="flex min-h-0 flex-1 flex-col animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 md:p-6">
          {!room.closed && <EntryForm onAdd={addLine} />}

          <section className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-brand">
                Consommations · {roomName}
                <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs font-medium tabular-nums text-brand">
                  {room.lines.length}
                </span>
              </h3>
              <div className="flex items-center gap-3 text-xs">
                {warnings > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                    {warnings} écart{warnings > 1 ? 's' : ''}
                  </span>
                )}
                {errors > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="size-3.5" aria-hidden="true" />
                    {errors} erreur{errors > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <LinesTable lines={room.lines} readOnly={room.closed} onDelete={deleteLine} />
          </section>
        </div>

        <footer className="border-t border-border bg-white p-4 md:px-6">
          {room.closed ? (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3.5 text-emerald-800 ring-1 ring-emerald-200 animate-in fade-in-0 zoom-in-95 duration-300"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">Cette salle est clôturée et sécurisée</p>
                <p className="text-xs text-emerald-700/80">Les données sont en lecture seule.</p>
              </div>
            </div>
          ) : confirming ? (
            <div className="flex flex-col gap-3 animate-in fade-in-0 duration-200 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-slate-600">
                Confirmer la clôture de <strong className="text-brand">{roomName}</strong> ? Cette action est
                irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-11 rounded-lg px-4 text-sm font-medium text-slate-600 ring-1 ring-border hover:bg-canvas"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={closeRoom}
                  className="flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-md transition hover:bg-brand/90"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  Confirmer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={!canClose}
                onClick={() => setConfirming(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-px hover:bg-brand/90 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
              >
                <Lock className="size-4" aria-hidden="true" />
                Clôturer la salle
              </button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {room.lines.length === 0
                    ? 'Ajoutez au moins une ligne avant de clôturer.'
                    : errors > 0
                      ? 'Corrigez les restes impossibles avant de clôturer.'
                      : 'Prête à être clôturée.'}
                </span>
                {room.lines.length === 0 && (
                  <button type="button" onClick={onRemove} className="font-medium text-red-600 hover:underline">
                    Retirer la salle
                  </button>
                )}
              </div>
            </div>
          )}
        </footer>
      </div>
    </TooltipProvider>
  )
}

const productItems = PRODUCTS.map((p) => ({ value: p.id, label: p.name }))
const personItems = PEOPLE.map((p) => ({ value: p.id, label: p.name }))

function EntryForm({ onAdd }: { onAdd: (line: ConsumptionLine) => void }) {
  const [productId, setProductId] = useState<string | null>(null)
  const [lot, setLot] = useState<string | null>(null)
  const [qty, setQty] = useState('')
  const [reste, setReste] = useState('')
  const [personId, setPersonId] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const product = productId ? productById(productId) : undefined
  const lotItems = (product?.lots ?? []).map((l) => ({ value: l, label: l }))
  const qtyNum = Number(qty)
  const resteNum = Number(reste)
  const valid =
    !!product && !!lot && !!personId && qty !== '' && qtyNum > 0 && Number.isInteger(qtyNum) && reste !== '' && Number.isFinite(resteNum)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid || !product || !lot || !personId) return
    onAdd({ id: newId(), productId: product.id, lot, qty: qtyNum, reste: resteNum, personId })
    setQty('')
    setReste('')
    setTouched(false)
  }

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5" noValidate>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand">Nouvelle ligne</h3>
        {product && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in-0">
            <PackageOpen className="size-3.5" aria-hidden="true" />
            Boîte en cours : <strong className="tabular-nums text-brand">{product.boxRemaining}</strong> {product.unit}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:items-end">
        <Field label="Produit" className="col-span-2 md:col-span-3" invalid={touched && !product}>
          <Select
            items={productItems}
            value={productId}
            onValueChange={(v) => {
              const id = v as string | null
              setProductId(id)
              setLot(id ? (productById(id)?.lots[0] ?? null) : null)
            }}
          >
            <SelectTrigger className="h-9 w-full" aria-label="Produit" aria-invalid={touched && !product}>
              <SelectValue placeholder="Choisir…" />
            </SelectTrigger>
            <SelectContent>
              {productItems.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Lot" className="md:col-span-2" invalid={touched && !lot}>
          <Select items={lotItems} value={lot} onValueChange={(v) => setLot(v as string | null)} disabled={!product}>
            <SelectTrigger className="h-9 w-full font-mono text-xs" aria-label="Lot">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {lotItems.map((i) => (
                <SelectItem key={i.value} value={i.value} className="font-mono text-xs">
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Qté" htmlFor="qty" className="md:col-span-1" invalid={touched && !(qtyNum > 0)}>
          <Input
            id="qty"
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-invalid={touched && !(qtyNum > 0)}
            className="h-9 tabular-nums"
            placeholder="0"
          />
        </Field>

        <Field label="Reste" htmlFor="reste" className="md:col-span-2" invalid={touched && reste === ''}>
          <div className="relative">
            <Input
              id="reste"
              type="number"
              inputMode="numeric"
              value={reste}
              onChange={(e) => setReste(e.target.value)}
              aria-invalid={touched && reste === ''}
              aria-describedby="reste-cap"
              className="h-9 pr-12 tabular-nums"
              placeholder="0"
            />
            <span
              id="reste-cap"
              className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-muted-foreground tabular-nums"
            >
              / {product?.capacity ?? '—'}
            </span>
          </div>
        </Field>

        <Field label="Personne" className="md:col-span-2" invalid={touched && !personId}>
          <Select items={personItems} value={personId} onValueChange={(v) => setPersonId(v as string | null)}>
            <SelectTrigger className="h-9 w-full" aria-label="Personne" aria-invalid={touched && !personId}>
              <SelectValue placeholder="Choisir…" />
            </SelectTrigger>
            <SelectContent>
              {personItems.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="col-span-2 md:col-span-2">
          <button
            type="submit"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Ajouter ligne
          </button>
        </div>
      </div>
      {touched && !valid && (
        <p role="alert" className="mt-2 text-xs text-red-600 animate-in fade-in-0">
          Veuillez renseigner tous les champs avec des valeurs valides.
        </p>
      )}
    </form>
  )
}

function Field({
  label,
  htmlFor,
  className,
  invalid,
  children,
}: {
  label: string
  htmlFor?: string
  className?: string
  invalid?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className={cn('text-xs font-medium text-slate-600', invalid && 'text-red-600')}>
        {label}
      </Label>
      {children}
    </div>
  )
}

const STATUS_META: Record<LineStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  ok: { icon: CheckCircle2, className: 'text-emerald-600', label: 'Reste cohérent' },
  warning: { icon: AlertTriangle, className: 'text-amber-500', label: 'Écart avec le reste théorique' },
  error: { icon: XCircle, className: 'text-red-600', label: 'Reste impossible' },
}

function LinesTable({
  lines,
  readOnly,
  onDelete,
}: {
  lines: ConsumptionLine[]
  readOnly: boolean
  onDelete: (id: string) => void
}) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <PackageOpen className="size-8 text-slate-300" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Aucune ligne saisie pour cette salle.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">Produit</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Lot</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Qté</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Reste</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Personne</th>
            <th scope="col" className="px-3 py-2.5 text-center font-medium">Statut</th>
            {!readOnly && (
              <th scope="col" className="w-10 px-3 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {lines.map((line) => {
            const product = productById(line.productId)
            const status = getLineStatus(line)
            const meta = STATUS_META[status]
            const Icon = meta.icon
            const detail =
              status === 'error'
                ? `Le reste doit être compris entre 0 et ${product?.capacity} ${product?.unit}.`
                : status === 'warning' && product
                  ? `Reste théorique : ${expectedReste(product, line.qty)} ${product.unit}.`
                  : 'Le reste correspond à la consommation.'
            return (
              <tr
                key={line.id}
                className={cn(
                  'transition-colors animate-in fade-in-0 slide-in-from-top-1 duration-300',
                  status === 'error' ? 'bg-red-50/70' : 'hover:bg-canvas/40',
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-brand">{product?.name}</p>
                  <p className="text-xs text-muted-foreground">{product?.unit}</p>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{line.lot}</td>
                <td className="px-3 py-3 text-right tabular-nums">{line.qty}</td>
                <td className={cn('px-3 py-3 text-right tabular-nums', status === 'error' && 'font-semibold text-red-600')}>
                  {line.reste}
                  <span className="text-xs text-muted-foreground"> / {product?.capacity}</span>
                </td>
                <td className="px-3 py-3 text-slate-600">{personById(line.personId)?.name}</td>
                <td className="px-3 py-3 text-center">
                  <Tooltip>
                    <TooltipTrigger
                      render={<span tabIndex={0} className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />}
                    >
                      <Icon className={cn('size-5', meta.className)} aria-label={meta.label} />
                    </TooltipTrigger>
                    <TooltipContent className="flex-col items-start gap-0.5">
                      <span className="font-semibold">{meta.label}</span>
                      <span className="opacity-80">{detail}</span>
                    </TooltipContent>
                  </Tooltip>
                </td>
                {!readOnly && (
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onDelete(line.id)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span className="sr-only">Supprimer la ligne</span>
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
