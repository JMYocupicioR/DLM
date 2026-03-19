'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  ArrowRight, FileText, BrainCog, Scale, Syringe,
  Shield, Stethoscope, GraduationCap, ChevronRight,
  CheckCircle2, Star, Zap, Activity, BarChart3,
  Lock, Layers, Database, Sparkles, Users,
  ClipboardList, TrendingUp, HeartPulse
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: '200+', label: 'Escalas validadas' },
  { value: 'NOM-024', label: 'Cumplimiento total' },
  { value: '50%', label: 'Menos tiempo admin.' },
  { value: '100%', label: 'Datos encriptados' },
];

const segments = [
  {
    icon: Stethoscope,
    title: 'Médicos Especialistas',
    subtitle: 'Neurología, Rehabilitación, Traumatología',
    problem: 'Consultas saturadas y dificultad para cuantificar el progreso del paciente con precisión.',
    solution: 'Reportes de alta calidad visual que justifican honorarios premium. Módulos de Toxina DLM y análisis de marcha con IA.',
    features: [
      'Medicina de precisión asistida por IA',
      'Reportes visuales para pacientes',
      'Seguimiento longitudinal automatizado',
    ],
    gradient: 'from-accent/15 to-accent/5',
    badgeClass: 'bg-accent/20 text-accent border-accent/30',
  },
  {
    icon: HeartPulse,
    title: 'Médicos Generales',
    subtitle: 'Primer contacto y consulta privada',
    problem: 'Miedo a auditorías de COFEPRIS y horas perdidas en papeleo administrativo.',
    solution: 'ExpedienteDLM con cumplimiento total NOM-024-SSA3-2012. Tu consulta blindada y digitalizada en 5 minutos.',
    features: [
      'NOM-024 compliance garantizado',
      'Migración gratuita de base de datos',
      'Activación inmediata sin capacitación',
    ],
    gradient: 'from-blue-500/15 to-blue-500/5',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    icon: GraduationCap,
    title: 'Residentes e Investigadores',
    subtitle: 'El motor de tesis',
    problem: 'Recolección manual de datos en Excel para tesis que toma meses o años.',
    solution: 'Captura datos clínicos validados y expórtalos en formatos listos para SPSS, R y Python. Tu tesis se escribe sola.',
    features: [
      'Exportación .csv, .xlsx, .json',
      'Anonimización automática LFPDPPP',
      'Escalas médicas gratuitas',
    ],
    gradient: 'from-purple-500/15 to-purple-500/5',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
];

const features = [
  {
    icon: FileText,
    title: 'ExpedienteDLM',
    color: '#2E3192',
    description: 'Expediente clínico electrónico con cumplimiento legal NOM-024, firma digital, búsqueda inteligente y trazabilidad completa para COFEPRIS.',
    highlights: ['NOM-024 compliance', 'Firma electrónica', 'Auditoría en tiempo real', 'Búsqueda por NLP'],
  },
  {
    icon: Scale,
    title: 'Escalas-DLM',
    color: '#41E2BA',
    description: 'Más de 200 escalas clínicas validadas con scoring automático, interpretación con IA y exportación estructurada para análisis estadístico.',
    highlights: ['200+ escalas validadas', 'Scoring automático', 'Exportación para investigación', 'Interpretación IA'],
  },
  {
    icon: Syringe,
    title: 'Toxina-DLM',
    color: '#6C63FF',
    description: 'Calculadora de dosis inteligente, mapas de aplicación anatómicos y seguimiento longitudinal de toxina botulínica por músculo.',
    highlights: ['Calculadora de dosis IA', 'Mapas anatómicos interactivos', 'Seguimiento por músculo', 'Alertas de re-aplicación'],
  },
  {
    icon: BrainCog,
    title: 'CognitivApp-DLM',
    color: '#FF6B6B',
    description: 'Plataforma de neurorrehabilitación con ejercicios adaptativos, métricas de progreso cognitivo y reportes para familiares.',
    highlights: ['Ejercicios adaptativos', 'Métricas de progreso', 'Reportes familiares', 'Gamificación clínica'],
  },
];

const engineSteps = [
  {
    icon: Database,
    step: '01',
    title: 'Ingesta de Datos',
    description: 'Recopila información del expediente, escalas funcionales y biometría en formato estandarizado.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Normalización Inteligente',
    description: 'Convierte datos cualitativos en cuantitativos mediante escalas validadas procesadas por IA.',
  },
  {
    icon: Activity,
    step: '03',
    title: 'Detección de Correlaciones',
    description: 'Identifica patrones entre tratamientos y resultados, generando insights clínicos automáticos.',
  },
  {
    icon: BarChart3,
    step: '04',
    title: 'Exportación Segura',
    description: 'Exporta datos anonimizados para investigación cumpliendo LFPDPPP con validez clínica preservada.',
  },
];

const testimonials = [
  {
    name: 'Dra. Patricia Gutiérrez',
    role: 'Neuróloga · Hospital Médica Sur, CDMX',
    avatar: 'PG',
    color: 'from-accent/30 to-accent/10',
    quote: 'Reducí el tiempo de llenado de expedientes de 20 a 8 minutos por paciente. Las escalas integradas han mejorado la calidad de mis notas de evolución de forma radical.',
  },
  {
    name: 'Dr. Alejandro Reyes',
    role: 'Director · Clínica Reyes Rehabilitación, GDL',
    avatar: 'AR',
    color: 'from-blue-500/30 to-blue-500/10',
    quote: 'Por primera vez tengo visibilidad total de lo que pasa en mis 3 consultorios. El panel de director es exactamente lo que necesitábamos para crecer sin perder control.',
  },
  {
    name: 'R3. Carlos Mendoza',
    role: 'Residente de Rehabilitación · INR, CDMX',
    avatar: 'CM',
    color: 'from-purple-500/30 to-purple-500/10',
    quote: 'Gracias a Escalas-DLM capturé los datos de mi tesis en la mitad de tiempo. La exportación a SPSS me ahorró semanas de trabajo manual en Excel.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative py-28 md:py-40 overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-5 text-sm px-4 py-1.5">
              <Stethoscope className="h-4 w-4 mr-2" />
              DeepLux MED
            </Badge>

            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[1.1]">
              La <span className="text-accent">suite médica</span> más completa de{' '}
              <span className="bg-gradient-to-r from-accent via-blue-400 to-purple-400 bg-clip-text text-transparent">
                México
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Expediente electrónico, escalas médicas, toxina botulínica e inteligencia artificial —
              todo integrado para especialistas, generales, residentes e investigadores.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button size="lg" asChild className="shadow-lg shadow-accent/20 px-8">
                <Link href="/registro/profesional">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver planes y precios</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-12">
              Sin tarjeta de crédito · 14 días gratis · Cancela cuando quieras
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {heroStats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-headline text-2xl md:text-3xl font-bold text-accent">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Segmentos ───────────────────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Para cada tipo de médico
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Tu problema → Nuestra solución
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada flujo está diseñado para el dolor específico de tu práctica.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {segments.map((seg) => {
                const Icon = seg.icon;
                return (
                  <div
                    key={seg.title}
                    className={cn(
                      'relative rounded-2xl border border-border/60 bg-gradient-to-br p-6 flex flex-col group hover:border-accent/40 transition-all duration-300',
                      seg.gradient
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <Badge variant="outline" className={cn('text-xs mb-1 border', seg.badgeClass)}>
                          {seg.subtitle}
                        </Badge>
                        <h3 className="font-headline text-lg font-bold text-foreground leading-tight">
                          {seg.title}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive mb-1 uppercase tracking-wide">El problema</p>
                      <p className="text-sm text-foreground/80">{seg.problem}</p>
                    </div>

                    <div className="mb-5 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs font-semibold text-accent mb-1 uppercase tracking-wide">La solución DeepLux</p>
                      <p className="text-sm text-foreground/80">{seg.solution}</p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-grow">
                      {seg.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full mt-auto">
                      <Link href="/registro/profesional">
                        Empezar gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                Herramientas clínicas
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Cuatro módulos. Una sola cuenta.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada módulo resuelve un aspecto crítico de tu flujo de trabajo clínico.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {features.map(({ icon: FIcon, title, color, description, highlights }) => (
                <Card
                  key={title}
                  className="bg-card border-border/60 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${color}22` }}
                      >
                        <FIcon className="h-6 w-6" style={{ color }} />
                      </div>
                      <h3 className="font-headline text-xl font-bold text-foreground">{title}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {description}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-center gap-1.5 text-xs text-foreground/70 bg-background/60 rounded-lg px-2.5 py-1.5"
                        >
                          <ChevronRight className="h-3 w-3 text-accent flex-shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Motor de Inteligencia ───────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Inteligencia Clínica
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                El motor detrás de DeepLux MED
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                No solo almacena datos — los procesa para generar inteligencia clínica real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
              {/* Connector line desktop */}
              <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20" />

              {engineSteps.map(({ icon: EIcon, step, title, description }) => (
                <div key={step} className="relative text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-5 relative z-10 group hover:bg-accent/20 transition-all">
                    <EIcon className="h-10 w-10 text-accent" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimoniales ───────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Voces de la comunidad
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Lo que dicen los profesionales
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map(({ name, role, avatar, color, quote }) => (
                <Card key={name} className="bg-card border-border/60 flex flex-col hover:border-accent/40 transition-all">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed flex-grow mb-5">
                      &ldquo;{quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0', color)}>
                        {avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────────────────────── */}
        <section className="py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-background p-12 md:p-20 max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
              </div>
              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Empieza hoy
              </Badge>
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Tu práctica clínica merece<br className="hidden md:block" /> tecnología de primer nivel
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Únete a cientos de médicos que ya digitalizaron su práctica con DeepLux MED. 14 días gratis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="shadow-xl shadow-accent/20 px-10">
                  <Link href="/registro/profesional">
                    Crear mi cuenta médica
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">Comparar planes</Link>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                {[
                  { icon: Lock, text: 'Cifrado TLS 256' },
                  { icon: Shield, text: 'NOM-024 compliant' },
                  { icon: ClipboardList, text: 'LFPDPPP cumplida' },
                  { icon: TrendingUp, text: 'Mejora continua' },
                ].map(({ icon: TIcon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TIcon className="h-3.5 w-3.5 text-accent" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
