'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const supabase = createClient();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast({
        title: 'Supabase no configurado',
        description: 'Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local para activar el login.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Error al iniciar sesión', description: error.message, variant: 'destructive' });
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'Verifica que Supabase esté configurado en .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast({
        title: 'Supabase no configurado',
        description: 'Configura las variables de Supabase en .env.local para usar esta función.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/perfil`,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Correo enviado', description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.' });
        setResetMode(false);
      }
    } catch {
      toast({ title: 'Error de conexión', description: 'Verifica la configuración de Supabase en .env.local.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Stethoscope className="h-8 w-8 text-accent" />
          <span className="font-headline text-2xl font-bold text-foreground">DeepLux</span>
        </div>

        <Card className="bg-card border-border/60">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              {resetMode ? 'Recuperar contraseña' : 'Iniciar sesión'}
            </CardTitle>
            <CardDescription>
              {resetMode
                ? 'Te enviaremos un correo para restablecer tu contraseña'
                : 'Accede a tu ecosistema DeepLux'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured() && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm">
                Supabase no está configurado. Añade <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code className="text-xs">.env.local</code> para activar el inicio de sesión.
              </div>
            )}
            <form onSubmit={resetMode ? handleReset : handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dr.garcia@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {!resetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetMode ? 'Enviar correo de recuperación' : 'Iniciar sesión'}
              </Button>
            </form>

            <Separator className="my-4" />

            <div className="space-y-2 text-center text-sm">
              <button
                type="button"
                onClick={() => setResetMode(!resetMode)}
                className="text-accent hover:underline block w-full"
              >
                {resetMode ? '← Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
              </button>
              <p className="text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-accent hover:underline font-medium">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al iniciar sesión aceptas los{' '}
          <Link href="/legal/terminos" className="hover:underline">Términos de Servicio</Link>
          {' '}y la{' '}
          <Link href="/legal/privacidad" className="hover:underline">Política de Privacidad</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
