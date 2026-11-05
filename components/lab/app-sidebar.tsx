import {
  BarChart3,
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Settings,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Tableau de bord', icon: LayoutDashboard },
  { label: 'Réception', icon: PackagePlus },
  { label: 'Stock', icon: Boxes },
  { label: 'Consommation', icon: ClipboardList, active: true },
  { label: 'Commandes', icon: Truck },
  { label: 'Rapports', icon: BarChart3 },
]

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-brand text-white/80 lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
          <FlaskConical className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">LabStock</p>
          <p className="text-xs text-white/50">CHU · Laboratoire central</p>
        </div>
      </div>

      <nav aria-label="Navigation principale" className="flex-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">Menu</p>
        <ul className="flex flex-col gap-1">
          {NAV.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <a
                href="#"
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-white/10 font-medium text-white shadow-inner'
                    : 'hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon
                  className={cn('size-4', active ? 'text-emerald-300' : 'text-white/50 group-hover:text-white/80')}
                  aria-hidden="true"
                />
                {label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-4">
        <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white">
          <Settings className="size-4 text-white/50" aria-hidden="true" />
          Paramètres
        </a>
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-emerald-300/20 text-xs font-semibold text-emerald-200">
            DR
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-white">Dr. Rahmani</p>
            <p className="truncate text-xs text-white/50">Biologiste responsable</p>
          </div>
          <button type="button" className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" aria-hidden="true" />
            <span className="sr-only">Se déconnecter</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
