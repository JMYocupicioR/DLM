'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  ArrowRight, FileText, BrainCog, Scale, MonitorPlay, Syringe, Printer,
  Shield, Users, Zap, Stethoscope, Building2, Briefcase, CheckCircle2,
  Star, ChevronDown, ChevronUp, Lock, Receipt, HeartPulse, FlaskConical,
  TrendingUp, UserCheck, BadgeCheck, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const audiences = [
  { id: 'medicos',   label: 'Soy Médico',     icon: Stethoscope },
  { id: 'clinicas',  label: 'Tengo Clínica',  icon: Building2   },
  { id: 'empresas',  label: 'Soy Empresa',    icon: Briefcase   },
];

const heroContent: Record<string, { headline: string; sub: string; cta: string; href: string }> = {
  medicos: {
    headline: 'La inteligencia que tu práctica clínica merece',
    sub: 'Expediente electrónico, escalas médicas y herramientas de IA para especialistas, generales, residentes e investigadores.',
    cta: 'Empezar gratis',
    href: '/registro/profesional',
  },
  clinicas: {
    headline: 'Centraliza, estandariza y escala tu operación médica',
    sub: 'La base de datos es tuya. Gestión de equipo, auditoría COFEPRIS en tiempo real y facturación CFDI integrada.',
    cta: 'Registrar mi clínica',
    href: '/registro/clinica',
  },
  empresas: {
    headline: 'Blindaje legal y ROI en salud ocupacional',
    sub: 'Evita multas STPS/NOM-030. Reduce tu prima IMSS. Certifica a tu empresa con tecnología médica de clase mundial.',
    cta: 'Ver planes empresariales',
    href: '/registro/empresa',
  },
};

const stats = [
  { value: '6',         label: 'Apps clínicas integradas' },
  { value: 'NOM-024',   label: 'Cumplimiento SSA certificado' },
  { value: '14 días',   label: 'Prueba gratuita, sin tarjeta' },
  { value: 'TLS 256',   label: 'Cifrado de grado médico' },
];

const segments = [
  {
    id: 'medicos',
    icon: Stethoscope,
    audience: 'Médicos y Especialistas',
    badge: 'Para Profesionales',
    badgeClass: 'bg-accent/20 text-accent border-accent/30',
    problem: 'Consultas saturadas, miedo a auditorías COFEPRIS y horas perdidas en papeleo.',
    solution: 'Tu consulta privada, blindada y digitalizada. ExpedienteDLM cumple la NOM-024-SSA3-2012 al 100% y reduce el tiempo administrativo en un 50%.',
    bullets: [
      { icon: FileText,   text: 'Expediente electrónico con cumplimiento NOM-024' },
      { icon: Scale,      text: 'Escalas validadas con exportación a SPSS/R para tu tesis' },
      { icon: BadgeCheck, text: 'Cédula profesional verificada con la SEP' },
    ],
    cta: 'Crear cuenta de médico',
    href: '/registro/profesional',
    gradient: 'from-accent/10 to-accent/5',
  },
  {
    id: 'clinicas',
    icon: Building2,
    audience: 'Clínicas e Instituciones',
    badge: 'Para Equipos',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    problem: 'Los médicos se van y se llevan "sus" expedientes. Cada uno usa formatos distintos. COFEPRIS puede aparecer en cualquier momento.',
    solution: 'La clínica es dueña absoluta de su base de datos. Dashboard de director con métricas de productividad y auditoría de cumplimiento en tiempo real.',
    bullets: [
      { icon: Shield,    text: 'Base de datos institucional protegida con roles jerárquicos' },
      { icon: UserCheck, text: 'Auditoría COFEPRIS automática en cada expediente' },
      { icon: TrendingUp,text: 'Panel de productividad por médico y por servicio' },
    ],
    cta: 'Registrar mi clínica',
    href: '/registro/clinica',
    gradient: 'from-blue-500/10 to-blue-500/5',
  },
  {
    id: 'empresas',
    icon: Briefcase,
    audience: 'Empresas y Corporativos',
    badge: 'Para Empresas',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    problem: 'Multas de hasta $565,000 MXN por incumplimiento de NOM-030 y NOM-035. Prima IMSS que sube cada año.',
    solution: 'Compliance-as-a-Service. Digitaliza la salud ocupacional de tu equipo, demuestra cumplimiento STPS y proyecta el ahorro en tu prima de riesgo IMSS.',
    bullets: [
      { icon: Shield,     text: 'Blindaje NOM-030, NOM-035 y LFPDPPP en un solo sistema' },
      { icon: TrendingUp, text: 'Simulador de ahorro en prima IMSS por empleado' },
      { icon: Receipt,    text: 'Sello "Empresa DeepLux-Protected" para tu reporte ESG' },
    ],
    cta: 'Explorar planes empresariales',
    href: '/registro/empresa',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
  },
];

const steps = [
  {
    number: '01',
    icon: UserCheck,
    title: 'Regístrate y verifica tu identidad',
    description: 'Crea tu cuenta en 5 minutos. Verifica tu cédula profesional con la Dirección General de Profesiones (SEP) o tus datos fiscales si eres clínica o empresa.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Elige tu plan y activa 14 días gratis',
    description: 'Sin tarjeta de crédito. Sin permanencia. Elige el plan que se adapta a tu etapa: desde el plan Libre para estudiantes hasta Enterprise para hospitales.',
  },
  {
    number: '03',
    icon: HeartPulse,
    title: 'Accede a las 6 apps con una sola cuenta',
    description: 'Un solo login para todo el ecosistema. Expediente, escalas, toxina botulínica, rehabilitación cognitiva, fisioterapia y manufactura 3D. Todo conectado.',
  },
];

const apps = [
  {
    icon: Scale,
    title: 'Escalas-DLM',
    color: '#41E2BA',
    tagline: 'Para médicos, investigadores y residentes',
    description: 'Más de 200 escalas clínicas validadas con exportación estructurada para análisis estadístico.',
    status: 'Disponible',
    link: 'https://www.escalas-dlm.com',
  },
  {
    icon: FileText,
    title: 'Expediente-DLM',
    color: '#2E3192',
    tagline: 'NOM-024 compliance garantizado',
    description: 'Expediente clínico electrónico con cumplimiento legal, firma digital y búsqueda inteligente.',
    status: 'Disponible',
    link: 'https://expediente-dlm.netlify.app/',
  },
  {
    icon: Syringe,
    title: 'Toxina-DLM',
    color: '#6C63FF',
    tagline: 'Para especialistas en neurología y rehabilitación',
    description: 'Calculadora de dosis, mapas de aplicación y seguimiento longitudinal de toxina botulínica.',
    status: 'Próximamente',
    link: null,
  },
  {
    icon: BrainCog,
    title: 'CognitivApp-DLM',
    color: '#FF6B6B',
    tagline: 'Rehabilitación cognitiva digital',
    description: 'Plataforma de neurorrehabilitación con ejercicios adaptativos y métricas de progreso.',
    status: 'Próximamente',
    link: null,
  },
  {
    icon: MonitorPlay,
    title: 'Physio-DLM',
    color: '#FFA600',
    tagline: 'Telerehabilitación y educación médica continua',
    description: 'Videos de fisioterapia, seguimiento remoto y cursos CME con créditos verificables.',
    status: 'Próximamente',
    link: null,
  },
  {
    icon: Printer,
    title: 'Portal Manufactura 3D',
    color: '#00C9A7',
    tagline: 'Exclusivo para clínicas y hospitales',
    description: 'Modelos anatómicos, prótesis e implantes a medida integrados directamente al expediente.',
    status: 'Próximamente',
    link: null,
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
    role: 'Director · Clínica Reyes Rehabilitación, Guadalajara',
    avatar: 'AR',
    color: 'from-blue-500/30 to-blue-500/10',
    quote: 'Por primera vez tengo visibilidad total de lo que pasa en mis 3 consultorios. El panel de director es exactamente lo que necesitábamos para crecer sin perder control.',
  },
  {
    name: 'Lic. Sandra Morales',
    role: 'Directora de RH · Grupo Industrial Norteño, Monterrey',
    avatar: 'SM',
    color: 'from-emerald-500/30 to-emerald-500/10',
    quote: 'Superamos la última inspección de la STPS sin ningún hallazgo. Proyectamos un ahorro del 18% en nuestra prima IMSS este año gracias al seguimiento preventivo de DeepLux.',
  },
];

const pricingPreview = [
  {
    id: 'medicos',
    tab: 'Profesionales',
    plan: 'Suite Médica',
    price: '$599',
    period: 'MXN/mes',
    tag: 'Más popular',
    features: ['Todas las apps del ecosistema', 'Perfil público verificado + QR', 'Exportación de datos clínicos', 'Soporte prioritario'],
    cta: 'Comenzar prueba',
    href: '/registro/profesional?plan=suite-medica',
  },
  {
    id: 'clinicas',
    tab: 'Clínicas',
    plan: 'Clínica Pro',
    price: '$2,499',
    period: 'MXN/mes',
    tag: 'Recomendado',
    features: ['Hasta 10 asientos médicos', 'Todas las apps del ecosistema', 'CFDI automático por paciente', 'Gerente de cuenta dedicado'],
    cta: 'Comenzar prueba',
    href: '/registro/clinica?plan=clinica-pro',
  },
  {
    id: 'empresas',
    tab: 'Empresas',
    plan: 'Empresa Pro',
    price: '$3,499',
    period: 'MXN/mes',
    tag: 'Para equipos',
    features: ['Hasta 25 profesionales de salud', 'Reportes de cumplimiento NOM', 'CFDI automático', 'Soporte dedicado'],
    cta: 'Comenzar prueba',
    href: '/registro/empresa?plan=empresa-pro',
  },
];

const faqs = [
  {
    q: '¿Qué es DeepLux y para quién es?',
    a: 'DeepLux es un ecosistema de tecnología médica con 6 aplicaciones integradas. Está diseñado para médicos y especialistas independientes, clínicas e instituciones de salud, y empresas que necesitan gestionar la salud ocupacional de sus empleados.',
  },
  {
    q: '¿Necesito tarjeta de crédito para la prueba gratuita?',
    a: 'No. Los 14 días de prueba son completamente gratuitos y sin necesidad de ingresar datos de pago. Al terminar el periodo puedes elegir continuar con un plan o cancelar sin cargo.',
  },
  {
    q: '¿DeepLux cumple con la NOM-024-SSA3-2012?',
    a: 'Sí. ExpedienteDLM fue diseñado específicamente para cumplir con la norma oficial mexicana NOM-024-SSA3-2012 sobre sistemas de información de salud. Todos los expedientes incluyen los campos obligatorios y la trazabilidad requerida por COFEPRIS.',
  },
  {
    q: '¿Mis datos y los de mis pacientes están seguros?',
    a: 'Absolutamente. Todos los datos están cifrados con TLS 256-bit en tránsito y AES-256 en reposo. Las bases de datos son propietarias: en planes de clínica, la institución es dueña absoluta de sus expedientes. Cumplimos con la LFPDPPP.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin penalizaciones ni periodos de permanencia. Puedes cancelar desde el panel de suscripción en cualquier momento. Si cancelas antes del vencimiento del periodo, conservas el acceso hasta la fecha de renovación.',
  },
  {
    q: '¿Cuál es la diferencia entre un plan individual y uno de clínica?',
    a: 'Los planes individuales son para un solo profesional de salud con su propio perfil y expedientes. Los planes de clínica incluyen múltiples asientos (médicos), un panel de administración centralizado, gestión de roles y la propiedad institucional de los datos.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [activeAudience, setActiveAudience] = useState<keyof typeof heroContent>('medicos');
  const [pricingTab, setPricingTab] = useState('medicos');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const hero = heroContent[activeAudience];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="home" className="relative py-24 md:py-36 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/8 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            {/* Audience selector pills */}
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {audiences.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveAudience(id as keyof typeof heroContent)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                    activeAudience === id
                      ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20'
                      : 'bg-card/50 text-muted-foreground border-border/60 hover:border-accent/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Headline */}
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-5 max-w-4xl mx-auto leading-tight transition-all duration-300">
              {hero.headline}
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 transition-all duration-300">
              {hero.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="shadow-lg shadow-accent/20 px-8">
                <Link href={hero.href}>
                  {hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver todos los planes</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-5">
              Sin tarjeta de crédito · 14 días gratis · Cancela cuando quieras
            </p>

            {/* Scroll hints */}
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {[
                { icon: Lock,    text: 'Datos cifrados TLS 256' },
                { icon: Receipt, text: 'Factura CFDI incluida' },
                { icon: Clock,   text: 'Activación inmediata' },
                { icon: Shield,  text: 'NOM-024 compliant' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────────────── */}
        <section className="py-8 border-y border-border/40 bg-card/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="font-headline text-2xl md:text-3xl font-bold text-accent">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Segments ─────────────────────────────────────────────────── */}
        <section id="segmentos" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                ¿Para quién es DeepLux?
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Una plataforma, tres soluciones
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada audiencia tiene su propio flujo de registro, dashboard y planes diseñados para sus necesidades.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="medicos">
              {segments.map((seg) => {
                const Icon = seg.icon;
                return (
                  <div
                    key={seg.id}
                    id={seg.id === 'medicos' ? 'medicos' : seg.id === 'clinicas' ? 'clinicas' : 'empresas'}
                    className={cn(
                      'relative rounded-2xl border border-border/60 bg-gradient-to-br p-6 flex flex-col',
                      seg.gradient
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <Badge variant="outline" className={cn('text-xs mb-1 border', seg.badgeClass)}>
                          {seg.badge}
                        </Badge>
                        <h3 className="font-headline text-lg font-bold text-foreground leading-tight">
                          {seg.audience}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive mb-1 uppercase tracking-wide">El problema</p>
                      <p className="text-sm text-foreground/80">{seg.problem}</p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-5 flex-grow">{seg.solution}</p>

                    <ul className="space-y-2.5 mb-6">
                      {seg.bullets.map(({ icon: BIcon, text }) => (
                        <li key={text} className="flex items-center gap-2.5 text-sm text-foreground/80">
                          <div className="w-7 h-7 rounded-lg bg-background/60 flex items-center justify-center flex-shrink-0">
                            <BIcon className="h-3.5 w-3.5 text-accent" />
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full">
                      <Link href={seg.href}>
                        {seg.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ────────────────────────────────────────────── */}
        <section className="py-24 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Así de simple
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Activo en menos de 5 minutos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {/* Connector line desktop */}
              <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20" />
              {steps.map(({ number, icon: StepIcon, title, description }) => (
                <div key={number} className="relative text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mb-5 relative z-10">
                    <StepIcon className="h-8 w-8 text-accent" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {number.replace('0', '')}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link href="/registro">
                  Crear mi cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Ecosistema de Apps ───────────────────────────────────────── */}
        <section id="services" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <HeartPulse className="h-3.5 w-3.5 mr-1.5" />
                Ecosistema completo
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                6 aplicaciones. Una sola cuenta.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Desde el expediente clínico hasta la manufactura de prótesis. Todo diseñado para el flujo de trabajo médico real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {apps.map(({ icon: AppIcon, title, color, tagline, description, status, link }) => (
                <Card
                  key={title}
                  className="bg-card border-border/60 hover:border-accent/60 transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}22` }}
                      >
                        <AppIcon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-foreground text-sm">{title}</p>
                        <Badge
                          variant={status === 'Disponible' ? 'default' : 'outline'}
                          className="text-xs mt-0.5"
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-accent font-medium mb-1.5">{tagline}</p>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{description}</p>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        Abrir app <ArrowRight className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">Disponible pronto</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" asChild>
                <Link href="/pricing">Ver qué apps incluye cada plan <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Testimoniales ────────────────────────────────────────────── */}
        <section className="py-24 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Lo que dicen nuestros usuarios
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Resultados reales en la práctica clínica
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map(({ name, role, avatar, color, quote }) => (
                <Card key={name} className="bg-card border-border/60 flex flex-col">
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

        {/* ── Preview de precios ───────────────────────────────────────── */}
        <section id="precios" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-3">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Precios transparentes
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Un plan para cada etapa
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                14 días de prueba gratuita en todos los planes de pago. Sin tarjeta de crédito.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-1 mb-10 bg-card rounded-lg p-1 w-fit mx-auto border border-border/60">
              {pricingPreview.map(({ id, tab }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPricingTab(id)}
                  className={cn(
                    'px-5 py-2 rounded-md text-sm font-medium transition-all',
                    pricingTab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {pricingPreview.filter(p => p.id === pricingTab).map(({ plan, price, period, tag, features, cta, href }) => (
              <div key={plan} className="max-w-sm mx-auto">
                <Card className="bg-card border-accent shadow-xl shadow-accent/10">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-headline text-xl font-bold">{plan}</h3>
                      <Badge className="bg-accent text-accent-foreground text-xs">{tag}</Badge>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{price}</span>
                      <span className="text-muted-foreground text-sm ml-1">{period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-8">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" asChild>
                      <Link href={href}>
                        {cta} — 14 días gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Sin tarjeta de crédito · Sin permanencia
                </p>
              </div>
            ))}

            <div className="text-center mt-8">
              <Link href="/pricing" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                Ver todos los planes y comparativa completa <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-24 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">
                <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                Preguntas frecuentes
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Todo lo que necesitas saber
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <div
                  key={q}
                  className="rounded-xl border border-border/60 bg-card overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-medium text-sm text-foreground pr-4">{q}</span>
                    {openFaq === i
                      ? <ChevronUp className="h-4 w-4 text-accent flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ────────────────────────────────────────────────── */}
        <section className="py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-background p-12 md:p-20 max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
              </div>
              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Empieza hoy
              </Badge>
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                La tecnología médica que<br className="hidden md:block" /> tu práctica merece
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Únete a médicos, clínicas y empresas que ya digitalizaron su práctica con DeepLux. Gratis los primeros 14 días.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="shadow-xl shadow-accent/20 px-10">
                  <Link href="/registro">
                    Empezar gratis ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollTo('contact')}>
                  Hablar con un asesor
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contacto ─────────────────────────────────────────────────── */}
        <section id="contact" className="py-20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <h2 className="font-headline text-2xl font-bold text-foreground mb-2">¿Tienes preguntas?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Nuestro equipo de especialistas en salud digital está listo para ayudarte.
            </p>
            <Button size="lg" variant="outline" asChild>
              <a href="mailto:hola@deeplux.org">
                Escribir a hola@deeplux.org
              </a>
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
