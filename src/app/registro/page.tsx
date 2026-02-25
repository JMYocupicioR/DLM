import Link from 'next/link';
import { Building2, Stethoscope, ArrowRight, CheckCircle2, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const registroOptions = [
  {
    type: 'profesional',
    href: '/registro/profesional',
    icon: Stethoscope,
    title: 'Soy Profesional de la Salud',
    subtitle: 'Médico, especialista, residente, investigador o estudiante',
    description: 'Crea tu identidad profesional verificada, accede a las herramientas clínicas y conecta con tu ecosistema médico.',
    features: [
      'Perfil profesional verificado',
      'Cédula y credenciales verificadas',
      'Expediente, escalas, toxina y más',
      '14 días de prueba gratuita',
    ],
    gradient: 'from-primary/20 to-primary/5',
    badge: 'Más popular',
    badgeColor: 'bg-accent text-accent-foreground',
  },
  {
    type: 'clinica',
    href: '/registro/clinica',
    icon: Building2,
    title: 'Soy una Clínica / Institución',
    subtitle: 'Hospital, clínica, consultorio o laboratorio',
    description: 'Gestiona a todo tu equipo médico con un solo plan. Expedientes, escalas, facturación y más para toda tu clínica.',
    features: [
      'Panel de administración',
      'Múltiples asientos médicos',
      'Registro COFEPRIS y fiscal',
      'Facturación CFDI incluida',
    ],
    gradient: 'from-secondary/20 to-secondary/5',
    badge: 'Para equipos',
    badgeColor: 'bg-secondary/30 text-secondary',
  },
  {
    type: 'empresa',
    href: '/registro/empresa',
    icon: Briefcase,
    title: 'Soy una Empresa / Corporativo',
    subtitle: 'Startup, PyME, corporativo, aseguradora o red hospitalaria',
    description: 'Ofrece herramientas médicas de primer nivel a tu equipo de salud. Gestiona asientos, reportes y facturación desde un panel empresarial.',
    features: [
      'Panel de salud corporativa',
      'Asientos para múltiples profesionales',
      'Reportes de uso y cumplimiento',
      'Integraciones y SLA garantizado',
    ],
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    badge: 'Para empresas',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
  },
];

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-accent" />
            <span className="font-headline text-xl font-bold">DeepLux</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Inicia sesión
            </Link>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-3">
              Bienvenido a DeepLux
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Crea tu cuenta en segundos. ¿Cómo quieres usar DeepLux?
            </p>
          </div>

          {/* Options grid — 3 columns on large screens, 1 on mobile */}
          <div className="grid md:grid-cols-3 gap-6">
            {registroOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link key={option.type} href={option.href} className="group block">
                  <Card className={`relative bg-gradient-to-br ${option.gradient} border-border/60 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 h-full`}>
                    {option.badge && (
                      <span className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full ${option.badgeColor}`}>
                        {option.badge}
                      </span>
                    )}
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                          <Icon className="h-7 w-7 text-accent" />
                        </div>
                        <div>
                          <h2 className="font-headline text-lg font-bold text-foreground leading-tight">
                            {option.title}
                          </h2>
                          <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-5 flex-grow">
                        {option.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button className="w-full group-hover:bg-primary/80" variant="default">
                        Comenzar registro
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Al registrarte aceptas los{' '}
            <Link href="/legal/terminos" className="hover:underline text-accent">Términos de Servicio</Link>
            {' '}y la{' '}
            <Link href="/legal/privacidad" className="hover:underline text-accent">Política de Privacidad</Link>
            {' '}de DeepLux.
          </p>
        </div>
      </main>
    </div>
  );
}
