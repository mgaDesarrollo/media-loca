import { auth } from '@/auth'
import { AnalysisDashboard } from './analysis-dashboard'

export default async function AnalisisPage() {
  const session = await auth()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Análisis de Ventas</h1>
        <p className="text-muted-foreground">Consultas y métricas para tomar decisiones informadas</p>
      </div>

      <AnalysisDashboard />
    </div>
  )
}
