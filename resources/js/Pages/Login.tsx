import { router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card'

export default function Login() {
  const tanganiLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Bypass login for prototype
    router.visit('/beranda')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">WebGIS BPP Telaga</CardTitle>
          <CardDescription>Masuk untuk mengelola data pertanian</CardDescription>
        </CardHeader>
        <form onSubmit={tanganiLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@bpptelaga.id" required defaultValue="admin@bpptelaga.id" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" required defaultValue="password123" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              Masuk Sistem
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
