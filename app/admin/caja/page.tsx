import { createClient } from '@/lib/supabase/server'
import { CashManager } from './cash-manager'
import type { CashRegisterEntry } from '@/lib/types'

export default async function CajaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('cash_register')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Registro de Caja</h1>
        <p className="text-muted-foreground">
          Controla los ingresos y gastos de tu negocio
        </p>
      </div>

      <CashManager 
        initialEntries={(entries as CashRegisterEntry[]) || []} 
        userId={user!.id}
      />
    </div>
  )
}
