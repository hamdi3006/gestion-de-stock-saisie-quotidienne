import { AppSidebar } from '@/components/lab/app-sidebar'
import { ConsommationPage } from '@/components/lab/consommation-page'

export default function Page() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <ConsommationPage />
      </main>
    </div>
  )
}
