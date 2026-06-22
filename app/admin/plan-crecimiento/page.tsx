import { auth } from '@/auth'
import { GrowthPlan } from './growth-plan'

export default async function PlanCrecimientoPage() {
  const session = await auth()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Plan de Crecimiento</h1>
        <p className="text-muted-foreground">Estrategia gradual para escalar Media Loca</p>
      </div>

      <GrowthPlan />
    </div>
  )
}
