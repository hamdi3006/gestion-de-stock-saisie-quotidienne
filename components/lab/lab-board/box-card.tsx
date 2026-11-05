import { Archive, PackageOpen, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { productById } from '@/lib/lab-data'
import type { LabBox } from '@/lib/lab-boxes'

export function BoxCard({ box }: { box: LabBox }) {
  const product = productById(box.productId)
  if (!product) return null

  if (box.status === 'perte') {
    return (
      <article className="animate-subtle-pulse relative overflow-hidden rounded-lg border-l-4 border-red-500 bg-white p-3 shadow-sm ring-1 ring-red-200 motion-reduce:animate-none">
        <CardHeader
          icon={<TriangleAlert className="size-4" aria-hidden="true" />}
          iconClass="bg-red-100 text-red-600"
          name={product.name}
          lot={box.lot}
          badge={<span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Perte provisoire</span>}
        />
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-2.5 py-2 text-xs leading-relaxed text-red-700">
          <span className="font-semibold">Attention :</span> Nouvelle boîte ouverte alors qu&apos;il reste{' '}
          <span className="font-semibold tabular-nums">
            {box.previousRemaining} {product.unit}
          </span>{' '}
          dans l&apos;ancienne !
        </p>
      </article>
    )
  }

  if (box.status === 'entamee') {
    const percent = Math.round((box.remaining / product.capacity) * 100)
    const low = percent <= 20
    return (
      <article className="rounded-lg border-l-4 border-amber-400 bg-white p-3 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
        <CardHeader
          icon={<PackageOpen className="size-4" aria-hidden="true" />}
          iconClass="bg-amber-100 text-amber-700"
          name={product.name}
          lot={box.lot}
        />
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Reste</span>
            <span className={cn('font-semibold tabular-nums', low ? 'text-red-600' : 'text-brand')}>
              {box.remaining} / {product.capacity} <span className="font-normal text-muted-foreground">{product.unit}</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`Reste ${box.remaining} sur ${product.capacity} ${product.unit}`}
            aria-valuenow={box.remaining}
            aria-valuemin={0}
            aria-valuemax={product.capacity}
            className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100"
          >
            <div
              className={cn('h-full rounded-full transition-all', low ? 'bg-red-500' : 'bg-amber-400')}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
      <CardHeader
        icon={<Archive className="size-4" aria-hidden="true" />}
        iconClass="bg-slate-200/70 text-slate-500"
        name={product.name}
        lot={box.lot}
        muted
        badge={<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600">Stockée</span>}
      />
    </article>
  )
}

function CardHeader({
  icon,
  iconClass,
  name,
  lot,
  badge,
  muted,
}: {
  icon: React.ReactNode
  iconClass: string
  name: string
  lot: string
  badge?: React.ReactNode
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', iconClass)}>{icon}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn('min-w-0 text-pretty text-sm font-semibold', muted ? 'text-slate-600' : 'text-brand')}>
            {name}
          </h3>
          {badge && <div className="shrink-0 whitespace-nowrap">{badge}</div>}
        </div>
        <p className="font-mono text-xs text-muted-foreground">Lot {lot}</p>
      </div>
    </div>
  )
}
