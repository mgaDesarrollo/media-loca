import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <span className="text-lg font-bold text-primary-foreground">M</span>
        </div>
        <span className="text-2xl font-bold">Media Loca</span>
      </div>

      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Te enviamos un link de confirmacion a tu correo electronico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Haz click en el link del email para activar tu cuenta y poder acceder al panel de administracion.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Volver al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
