'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  ArrowRight, FileText, BrainCog, Scale, MonitorPlay, Syringe, Printer,
  Shield, Zap, CheckCircle2, ExternalLink, Clock,
  Layers, Sparkles, ArrowUpRight, HeartPulse, Cpu,
  CircleDot, GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const products = [
  {
    icon: FileText,
    title: 'ExpedienteDLM',
    color: '#2E3192',
    tagline: 'El corazón del ecosistema',
    status: 'Disponible',
    description: 'Expediente clínico electrónico con cumplimiento legal NOM-024-SSA3-2012, firma electrónica avanzada, búsqueda inteligente por NLP y trazabilidad completa.',
    features: [
      'Cumplimiento NOM-024 al 100%',
      'Firma electrónica con hash criptográfico',
      'Notas de evolución con plantillas inteligentes',
      'Búsqueda semántica por NLP',
      'Auditoría en tiempo real COFEPRIS',
      'Exportación PDF con identidad institucional',
    ],
    link: 'https://expediente-dlm.netlify.app/',
    connects: ['Escalas-DLM', 'Toxina-DLM'],
  },
  {
    icon: Scale,
    title: 'Escalas-DLM',
    color: '#41E2BA',
    tagline: 'Tu motor de investigación',
    status: 'Disponible',
    description: 'Más de 200 escalas clínicas validadas con scoring automático, interpretación con IA, generación de reportes PDF profesionales y exportación para análisis estadístico.',
    features: [
      '200+ escalas clínicas validadas',
      'Scoring automático con interpretación IA',
      'Reportes PDF con gráficas de evolución',
      'Exportación a SPSS, R, Python (.csv, .xlsx)',
      'Anonimización automática LFPDPPP',
      'Catálogo por taxonomía médica',
    ],
    link: 'https://www.escalas-dlm.com',
    connects: ['ExpedienteDLM', 'CognitivApp-DLM'],
  },
  {
    icon: Syringe,
    title: 'Toxina-DLM',
    color: '#6C63FF',
    tagline: 'Precisión en cada aplicación',
    status: 'Disponible',
    description: 'Calculadora de dosis inteligente con mapas de aplicación anatómicos interactivos, seguimiento longitudinal por músculo y alertas automáticas de re-aplicación.',
    features: [
      'Calculadora de dosis asistida por IA',
      'Mapas anatómicos interactivos 3D',
      'Seguimiento por músculo y fecha',
      'Alertas de intervalo de re-aplicación',
      'Integración directa con expediente',
      'Reportes de tratamiento para paciente',
    ],
    link: 'https://toxina.netlify.app/',
    connects: ['ExpedienteDLM', 'Physio-DLM'],
  },
  {
    icon: BrainCog,
    title: 'CognitivApp-DLM',
    color: '#FF6B6B',
    tagline: 'Neurorrehabilitación digital',
    status: 'Disponible',
    description: 'Plataforma de rehabilitación cognitiva con ejercicios adaptativos de atención, memoria y funciones ejecutivas. Métricas de progreso y reportes para familiares.',
    features: [
      'Ejercicios adaptativos multinivel',
      'Métricas de progreso cognitivo',
      'Reportes para familiares y cuidadores',
      'Gamificación clínica con evidencia',
      'Integración con escalas cognitivas',
      'Seguimiento remoto de adherencia',
    ],
    link: 'https://cognitivapp.netlify.app/',
    connects: ['Escalas-DLM', 'ExpedienteDLM'],
  },
  {
    icon: MonitorPlay,
    title: 'Physio-DLM',
    color: '#FFA600',
    tagline: 'Telerehabilitación y educación',
    status: 'Próximamente',
    description: 'Videos de fisioterapia personalizados, seguimiento remoto de adherencia, cursos de educación médica continua (CME) con créditos verificables.',
    features: [
      'Biblioteca de ejercicios por patología',
      'Prescripción de programas personalizada',
      'Seguimiento remoto de adherencia',
      'Cursos CME con créditos verificables',
      'Videoconsulta integrada',
      'Portal del paciente con instrucciones',
    ],
    link: null,
    connects: ['ExpedienteDLM', 'Toxina-DLM'],
  },
  {
    icon: Printer,
    title: 'Portal Manufactura 3D',
    color: '#00C9A7',
    tagline: 'Del expediente al implante',
    status: 'Próximamente',
    description: 'Modelos anatómicos de precisión, prótesis, ortesis e implantes a medida integrados directamente al expediente clínico del paciente.',
    features: [
      'Modelos anatómicos de estudio',
      'Prótesis y ortesis personalizadas',
      'Implantes a medida bajo pedido',
      'Materiales biocompatibles certificados',
      'Integración directa con expediente',
      'Tracing de producción en tiempo real',
    ],
    link: null,
    connects: ['ExpedienteDLM'],
  },
];

const roadmap = [
  { quarter: 'Q1 2025', title: 'ExpedienteDLM', subtitle: 'Lanzamiento del expediente electrónico', status: 'done', color: '#2E3192' },
  { quarter: 'Q2 2025', title: 'Escalas-DLM', subtitle: 'Más de 200 escalas clínicas validadas', status: 'done', color: '#41E2BA' },
  { quarter: 'Q3 2025', title: 'Toxina-DLM', subtitle: 'Calculadora y mapas de aplicación', status: 'done', color: '#6C63FF' },
  { quarter: 'Q4 2025', title: 'CognitivApp-DLM', subtitle: 'Rehabilitación cognitiva digital', status: 'done', color: '#FF6B6B' },
  { quarter: 'Q1 2026', title: 'Physio-DLM', subtitle: 'Telerehabilitación y CME', status: 'next', color: '#FFA600' },
  { quarter: 'Q2 2026', title: 'Manufactura 3D', subtitle: 'Prótesis e implantes a medida', status: 'next', color: '#00C9A7' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PortafolioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[800px] h-[500px] bg-accent/6 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-5 text-sm px-4 py-1.5">
              <Layers className="h-4 w-4 mr-2" />
              Ecosistema DeepLux
            </Badge>

            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[1.1]">
              <span className="text-accent">6</span> aplicaciones.{' '}
              <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Un ecosistema.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Desde el expediente clínico hasta la manufactura de prótesis —
              todo conectado, todo diseñado para el flujo de trabajo médico real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="shadow-lg shadow-accent/20 px-8">
                <Link href="/registro">
                  Accede a todo el ecosistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Comparar planes</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Products Grid ───────────────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <HeartPulse className="h-3.5 w-3.5 mr-1.5" />
                Portafolio completo
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Cada app resuelve un problema clínico real
              </h2>
            </div>

            <div className="space-y-8 max-w-5xl mx-auto">
              {products.map(({ icon: PIcon, title, color, tagline, status, description, features, link, connects }, idx) => (
                <Card
                  key={title}
                  className={cn(
                    'bg-card border-border/60 hover:border-accent/40 transition-all duration-300 overflow-hidden group',
                    idx === 0 && 'ring-1 ring-accent/30'
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Info */}
                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${color}22` }}
                          >
                            <PIcon className="h-7 w-7" style={{ color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-headline text-xl font-bold text-foreground">{title}</h3>
                              <Badge
                                variant={status === 'Disponible' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {status === 'Disponible' ? (
                                  <><CheckCircle2 className="h-3 w-3 mr-1" />{status}</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" />{status}</>
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-accent font-medium">{tagline}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                          {description}
                        </p>

                        {/* Connects to */}
                        <div className="flex items-center gap-2 mb-4">
                          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Se conecta con:</span>
                          {connects.map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>

                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                          >
                            Abrir aplicación <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground/50 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Disponible próximamente
                          </span>
                        )}
                      </div>

                      {/* Right: Features */}
                      <div className="lg:w-80 bg-background/40 border-t lg:border-t-0 lg:border-l border-border/40 p-6 lg:p-8">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Funcionalidades</p>
                        <ul className="space-y-2.5">
                          {features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roadmap ─────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Roadmap
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Evolución del ecosistema
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada trimestre lanzamos nuevas herramientas. Con una sola cuenta, accedes a todo.
              </p>
            </div>

            <div className="max-w-4xl mx-auto relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border/60" />

              <div className="space-y-8">
                {roadmap.map(({ quarter, title, subtitle, status, color }, idx) => (
                  <div
                    key={title}
                    className={cn(
                      'relative flex items-center gap-6',
                      idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2',
                          status === 'done'
                            ? 'bg-accent border-accent'
                            : status === 'current'
                              ? 'bg-accent/50 border-accent animate-pulse'
                              : 'bg-background border-border'
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className={cn(
                      'ml-12 md:ml-0 md:w-[calc(50%-2rem)]',
                      idx % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                    )}>
                      <span className="text-xs text-muted-foreground font-medium">{quarter}</span>
                      <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2"
                        style={idx % 2 !== 0 ? {} : { justifyContent: 'flex-end' }}
                      >
                        {idx % 2 !== 0 && <CircleDot className="h-4 w-4 flex-shrink-0" style={{ color }} />}
                        {title}
                        {idx % 2 === 0 && <CircleDot className="h-4 w-4 flex-shrink-0" style={{ color }} />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                      {status === 'done' && (
                        <Badge className="mt-1 bg-accent/20 text-accent border-accent/30 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Lanzado
                        </Badge>
                      )}
                      {status === 'current' && (
                        <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          <Cpu className="h-3 w-3 mr-1" /> En desarrollo
                        </Badge>
                      )}
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Integration Diagram ─────────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                Integración total
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Todo se conecta con todo
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Una sola cuenta. Un solo login. Tus datos fluyen entre las 6 aplicaciones sin fricción.
              </p>
            </div>

            {/* Visual integration hub */}
            <div className="max-w-3xl mx-auto">
              <div className="relative bg-card rounded-3xl border border-border/60 p-8 md:p-12">
                {/* Center hub */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="font-headline text-lg font-bold text-foreground">DeepLux Core</h3>
                  <p className="text-xs text-muted-foreground">Autenticación · Datos · Seguridad</p>
                </div>

                {/* Connected apps grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(({ icon: CIcon, title, color, status }) => (
                    <div
                      key={title}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                        status === 'Disponible'
                          ? 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                          : 'border-border/40 bg-background/40 opacity-60 hover:opacity-80'
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}22` }}
                      >
                        <CIcon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {status === 'Disponible' ? '● Conectado' : '○ Próximamente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────────────────────── */}
        <section className="py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-purple-500/10 via-background to-accent/5 p-12 md:p-20 max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-60 h-60 bg-accent/6 rounded-full blur-3xl" />
              </div>

              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Un solo acceso
              </Badge>
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Todo el ecosistema<br className="hidden md:block" /> con una sola cuenta
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Regístrate una vez y accede a las 6 aplicaciones. Sin configuraciones adicionales.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="shadow-xl shadow-accent/20 px-10">
                  <Link href="/registro">
                    Crear mi cuenta gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/med">
                    Explorar DeepLux MED
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
