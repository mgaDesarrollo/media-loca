import { auth } from '@/auth'
import { TasksDashboard } from './tasks-dashboard'

export default async function TareasPage() {
  const session = await auth()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Tareas</h1>
        <p className="text-muted-foreground">Gestiona tus notas y listas de tareas</p>
      </div>

      <TasksDashboard />
    </div>
  )
}
