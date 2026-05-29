import { auth } from '@/auth'
import { getCashRegisterByUser } from '@/lib/db/queries'
import { CashManager } from './cash-manager'

export default async function CajaPage() {
  const session = await auth()
  const entries = await getCashRegisterByUser(session!.user!.id)

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Registro de Caja</h1>
        <p className="text-muted-foreground">Controla los ingresos y gastos de tu negocio</p>
      </div>

      <CashManager initialEntries={entries} />
    </div>
  )
}
