'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, X, Stethoscope, ArrowRight, Zap } from 'lucide-react';

const individualPlans = [
  {
    slug: 'libre',
    name: 'Libre',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Para estudiantes y pasantes. Acceso esencial sin costo.',
    features: [
      { text: 'EscalasDLM (solo lectura)', included: true },
      { text: '14 días de prueba de apps', included: false },
      { text: 'ExpedienteDLM', included: false },
      { text: 'ToxinaDLM', included: false },
      { text: 'CognitivApp y Physio', included: false },
      { text: 'Perfil público', included: false },
      { text: 'Soporte', included: false },
    ],
    cta: 'Comenzar gratis',
    highlight: false,
    badge: null,
    targetTypes: ['Estudiantes', 'Pasantes'],
  },
  {
    slug: 'profesional-basico',
    name: 'Profesional Básico',
    priceMonthly: 299,
    priceAnnual: 2990,
    description: 'Expediente y escalas para médicos generales y residentes.',
    features: [
      { text: 'EscalasDLM completo', included: true },
      { text: 'ExpedienteDLM completo', included: true },
      { text: '14 días de prueba gratis', included: true },
      { text: 'ToxinaDLM', included: false },
      { text: 'CognitivApp y Physio', included: false },
      { text: 'Perfil público (sin badge)', included: true },
      { text: 'Soporte por email', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: false,
    badge: null,
    targetTypes: ['Médicos generales', 'Residentes', 'Internistas'],
  },
  {
    slug: 'suite-medica',
    name: 'Suite Médica',
    priceMonthly: 599,
    priceAnnual: 5990,
    description: 'Todas las apps del ecosistema para especialistas.',
    features: [
      { text: 'EscalasDLM completo', included: true },
      { text: 'ExpedienteDLM completo', included: true },
      { text: 'ToxinaDLM completo', included: true },
      { text: 'CognitivApp-DLM', included: true },
      { text: 'Physio-DLM + cursos CME', included: true },
      { text: 'Perfil público verificado + QR', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: true,
    badge: 'Más popular',
    targetTypes: ['Especialistas', 'Médicos'],
  },
  {
    slug: 'investigador',
    name: 'Investigador',
    priceMonthly: 399,
    priceAnnual: 3990,
    description: 'Suite Médica más herramientas avanzadas de investigación.',
    features: [
      { text: 'Todo en Suite Médica', included: true },
      { text: 'Exportación de datos anonimizados', included: true },
      { text: 'Plantillas de investigación', included: true },
      { text: 'Análisis estadístico básico', included: true },
      { text: 'Perfil público investigador', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: false,
    badge: 'Para investigadores',
    targetTypes: ['Investigadores', 'Académicos'],
  },
];

const clinicPlans = [
  {
    slug: 'clinica-starter',
    name: 'Clínica Starter',
    priceMonthly: 899,
    priceAnnual: 8990,
    seats: 3,
    description: 'Para consultorios pequeños. Hasta 3 médicos.',
    features: [
      { text: 'Hasta 3 asientos médicos', included: true },
      { text: 'ExpedienteDLM + EscalasDLM', included: true },
      { text: 'Panel de administración', included: true },
      { text: '14 días de prueba gratis', included: true },
      { text: 'ToxinaDLM y demás apps', included: false },
      { text: 'CFDI automático', included: false },
      { text: 'Soporte por email', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: false,
    badge: null,
  },
  {
    slug: 'clinica-pro',
    name: 'Clínica Pro',
    priceMonthly: 2499,
    priceAnnual: 24990,
    seats: 10,
    description: 'Para clínicas en crecimiento. Hasta 10 médicos y todas las apps.',
    features: [
      { text: 'Hasta 10 asientos médicos', included: true },
      { text: 'Todas las apps del ecosistema', included: true },
      { text: 'Portal Manufactura 3D', included: true },
      { text: 'CFDI automático por paciente', included: true },
      { text: 'Panel de administración avanzado', included: true },
      { text: '14 días de prueba gratis', included: true },
      { text: 'Soporte dedicado', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: true,
    badge: 'Recomendado',
  },
  {
    slug: 'clinica-enterprise',
    name: 'Enterprise',
    priceMonthly: 0,
    priceAnnual: 0,
    seats: null,
    description: 'Hospitales y grandes redes médicas. Precio personalizado.',
    features: [
      { text: 'Asientos ilimitados', included: true },
      { text: 'Todas las apps del ecosistema', included: true },
      { text: 'Integraciones personalizadas', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Gerente de cuenta dedicado', included: true },
      { text: 'Migración de datos asistida', included: true },
      { text: 'Soporte 24/7', included: true },
    ],
    cta: 'Contactar ventas',
    highlight: false,
    badge: 'Para hospitales',
  },
];

const empresaPlans = [
  {
    slug: 'empresa-basico',
    name: 'Empresa Básico',
    priceMonthly: 1499,
    priceAnnual: 14990,
    seats: 5,
    description: 'Para empresas pequeñas. Hasta 5 profesionales de salud.',
    features: [
      { text: 'Hasta 5 asientos médicos', included: true },
      { text: 'ExpedienteDLM + EscalasDLM', included: true },
      { text: 'Panel de empresa', included: true },
      { text: '14 días de prueba gratis', included: true },
      { text: 'Reportes de cumplimiento NOM', included: false },
      { text: 'CFDI automático', included: false },
      { text: 'Soporte por email', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: false,
    badge: null,
  },
  {
    slug: 'empresa-pro',
    name: 'Empresa Pro',
    priceMonthly: 3499,
    priceAnnual: 34990,
    seats: 25,
    description: 'Para equipos medianos. Hasta 25 profesionales y todas las apps.',
    features: [
      { text: 'Hasta 25 asientos médicos', included: true },
      { text: 'Todas las apps del ecosistema', included: true },
      { text: 'Reportes de cumplimiento NOM', included: true },
      { text: 'CFDI automático', included: true },
      { text: 'Panel empresarial avanzado', included: true },
      { text: '14 días de prueba gratis', included: true },
      { text: 'Soporte dedicado', included: true },
    ],
    cta: 'Comenzar prueba',
    highlight: true,
    badge: 'Más popular',
  },
  {
    slug: 'empresa-enterprise',
    name: 'Empresa Enterprise',
    priceMonthly: 0,
    priceAnnual: 0,
    seats: null,
    description: 'Asientos ilimitados para corporativos, aseguradoras y redes hospitalarias.',
    features: [
      { text: 'Asientos ilimitados', included: true },
      { text: 'Todas las apps del ecosistema', included: true },
      { text: 'Integraciones personalizadas (HL7/DICOM)', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Gerente de cuenta dedicado', included: true },
      { text: 'Sello Empresa DeepLux-Protected', included: true },
      { text: 'Soporte 24/7', included: true },
    ],
    cta: 'Contactar ventas',
    highlight: false,
    badge: 'Para corporativos',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [tab, setTab] = useState<'individual' | 'clinica' | 'empresa'>('individual');

  const savingsPercent = 17; // ~2 months free with annual

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-accent" />
            <span className="font-headline text-xl font-bold">DeepLux</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/registro">Registrarse gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            14 días de prueba gratis en todos los planes de pago
          </Badge>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
            Planes para médicos, clínicas<br />y empresas
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sin tarjeta de crédito para el periodo de prueba. Cancela cuando quieras.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 mb-8 bg-card rounded-lg p-1 w-fit mx-auto border border-border/60">
          <button
            type="button"
            onClick={() => setTab('individual')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${tab === 'individual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Profesional
          </button>
          <button
            type="button"
            onClick={() => setTab('clinica')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${tab === 'clinica' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Clínica
          </button>
          <button
            type="button"
            onClick={() => setTab('empresa')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${tab === 'empresa' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Empresa
          </button>
        </div>

        {/* Billing toggle — only show for individual and clinic */}
        {tab !== 'empresa' && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <Label className={`text-sm ${!annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Mensual</Label>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <Label className={`text-sm ${annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Anual
              <Badge variant="secondary" className="ml-2 text-xs">Ahorra {savingsPercent}%</Badge>
            </Label>
          </div>
        )}

        {/* Plans grid */}
        {tab === 'empresa' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {empresaPlans.map((plan) => (
              <Card
                key={plan.slug}
                className={`bg-card flex flex-col relative ${plan.highlight ? 'border-accent shadow-lg shadow-accent/10' : 'border-border/60'}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${plan.highlight ? 'bg-accent text-accent-foreground' : 'bg-secondary/30 text-secondary border border-secondary/20'}`}>
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                  {plan.seats && (
                    <Badge variant="outline" className="w-fit text-xs">Hasta {plan.seats} asientos</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-2">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-2xl font-bold text-foreground">A consultar</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-foreground">
                          ${plan.priceMonthly.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm"> MXN/mes</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <Separator className="mb-4" />
                  <ul className="space-y-2 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-foreground/80' : 'text-muted-foreground/50'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.slug === 'empresa-enterprise' ? '/#contact' : `/registro/empresa?plan=${plan.slug}`}>
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tab === 'individual' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {individualPlans.map((plan) => (
              <Card
                key={plan.slug}
                className={`bg-card flex flex-col relative ${plan.highlight ? 'border-accent shadow-lg shadow-accent/10' : 'border-border/60'}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${plan.highlight ? 'bg-accent text-accent-foreground' : 'bg-secondary/30 text-secondary border border-secondary/20'}`}>
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                  <div className="mt-2">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-3xl font-bold text-foreground">Gratis</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-foreground">
                          ${annual ? Math.floor(plan.priceAnnual / 12) : plan.priceMonthly}
                        </span>
                        <span className="text-muted-foreground text-sm"> MXN/mes</span>
                        {annual && (
                          <p className="text-xs text-accent mt-0.5">
                            ${plan.priceAnnual.toLocaleString()} MXN/año
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plan.targetTypes.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                  <Separator className="mb-4" />
                  <ul className="space-y-2 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-foreground/80' : 'text-muted-foreground/50'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${plan.highlight ? '' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={`/registro/profesional?plan=${plan.slug}`}>
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clinicPlans.map((plan) => (
              <Card
                key={plan.slug}
                className={`bg-card flex flex-col relative ${plan.highlight ? 'border-accent shadow-lg shadow-accent/10' : 'border-border/60'}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${plan.highlight ? 'bg-accent text-accent-foreground' : 'bg-secondary/30 text-secondary border border-secondary/20'}`}>
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                  {plan.seats && (
                    <Badge variant="outline" className="w-fit text-xs">Hasta {plan.seats} asientos</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-2">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-2xl font-bold text-foreground">A consultar</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-foreground">
                          ${annual ? Math.floor(plan.priceAnnual / 12).toLocaleString() : plan.priceMonthly.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm"> MXN/mes</span>
                        {annual && <p className="text-xs text-accent mt-0.5">${plan.priceAnnual.toLocaleString()} MXN/año</p>}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <Separator className="mb-4" />
                  <ul className="space-y-2 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-foreground/80' : 'text-muted-foreground/50'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.slug === 'clinica-enterprise' ? '/#contact' : `/registro/clinica?plan=${plan.slug}`}>
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empresa enterprise note */}
        {tab === 'empresa' && (
          <div className="mt-8 max-w-2xl mx-auto rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
            <p className="text-sm font-semibold text-emerald-400 mb-1">¿Necesitas más de 25 asientos o integraciones personalizadas?</p>
            <p className="text-xs text-muted-foreground mb-3">
              El plan Enterprise es personalizado: SLA garantizado, gerente de cuenta dedicado y sello &ldquo;Empresa DeepLux-Protected&rdquo; para tu reporte ESG.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/#contact">Hablar con un asesor <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        )}

        {/* FAQ / Guarantee */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-6">
            Todos los planes incluyen 14 días de prueba. Sin permanencia. Cancela en cualquier momento.
            Pagos seguros con Stripe (tarjeta). OXXO y SPEI próximamente.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-muted-foreground">
            <span>🔒 Datos cifrados con TLS</span>
            <span>🇲🇽 Precios en MXN</span>
            <span>🧾 Factura CFDI disponible</span>
            <span>📞 Soporte en español</span>
            <span>⚕️ NOM-024 compliant</span>
          </div>
        </div>
      </main>
    </div>
  );
}
