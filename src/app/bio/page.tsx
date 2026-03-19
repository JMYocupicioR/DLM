'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  ArrowRight, Printer, Shield, CheckCircle2,
  Zap, Layers, Sparkles, Box, Scan, Package,
  Cog, FileText, Truck, Settings, Microscope,
  Beaker, Award, HeartPulse, Bone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  {
    icon: Microscope,
    title: 'Modelos Anatómicos',
    description: 'Replicas de precisión para planificación quirúrgica, educación médica y presentación a pacientes. Resolución de hasta 50 micras.',
    features: ['Planificación pre-quirúrgica', 'Educación médica', 'Presentación al paciente', 'Multimaterial y multicolor'],
    gradient: 'from-cyan-500/15 to-cyan-500/5',
    color: '#06B6D4',
  },
  {
    icon: Bone,
    title: 'Prótesis Personalizadas',
    description: 'Prótesis de miembro superior e inferior diseñadas con escaneo 3D del paciente. Ajuste perfecto, peso reducido, estéticamente únicas.',
    features: ['Escaneo 3D del paciente', 'Diseño CAD a medida', 'Materiales ligeros', 'Acabado cosmético premium'],
    gradient: 'from-emerald-500/15 to-emerald-500/5',
    color: '#10B981',
  },
  {
    icon: Settings,
    title: 'Ortesis a Medida',
    description: 'Férulas, soportes y dispositivos ortopédicos impresos con geometría exacta del paciente. Mayor comfort y eficacia terapéutica.',
    features: ['Férulas funcionales', 'Soportes articulares', 'Plantillas biomecánicas', 'Ventilación optimizada'],
    gradient: 'from-blue-500/15 to-blue-500/5',
    color: '#3B82F6',
  },
  {
    icon: Box,
    title: 'Implantes Quirúrgicos',
    description: 'Guías quirúrgicas e implantes a medida en materiales biocompatibles con certificación ISO para uso en quirófano.',
    features: ['Guías de corte y posicionamiento', 'Implantes craneales', 'Mallas de reconstrucción', 'Trazabilidad completa'],
    gradient: 'from-purple-500/15 to-purple-500/5',
    color: '#8B5CF6',
  },
];

const workflow = [
  {
    step: '01',
    icon: FileText,
    title: 'Solicitud desde ExpedienteDLM',
    description: 'El médico ordena directamente desde el expediente del paciente. Adjunta imágenes, DICOM o escaneo 3D.',
  },
  {
    step: '02',
    icon: Scan,
    title: 'Diseño CAD / Ingeniería',
    description: 'Nuestro equipo de bioingeniería crea el diseño 3D a medida con validación biomecánica.',
  },
  {
    step: '03',
    icon: Printer,
    title: 'Manufactura Aditiva',
    description: 'Impresión 3D con tecnologías FDM, SLA, SLS o MJF según requerimientos. Control de calidad certificado.',
  },
  {
    step: '04',
    icon: Package,
    title: 'Post-procesamiento y QC',
    description: 'Acabado superficial, esterilización (si aplica) y verificación dimensional antes del envío.',
  },
  {
    step: '05',
    icon: Truck,
    title: 'Entrega y Trazabilidad',
    description: 'Envío con tracking en tiempo real. El producto se vincula al expediente digital del paciente.',
  },
];

const materials = [
  { name: 'PLA Médico', use: 'Modelos anatómicos', cert: 'Biocompatible' },
  { name: 'PETG', use: 'Ortesis funcionales', cert: 'FDA cleared' },
  { name: 'Nylon PA12', use: 'Prótesis de uso diario', cert: 'ISO 10993' },
  { name: 'Resina Biocompatible', use: 'Guías quirúrgicas', cert: 'Clase IIa' },
  { name: 'Titanio Ti6Al4V', use: 'Implantes metálicos', cert: 'ASTM F136' },
  { name: 'TPU Flexible', use: 'Plantillas / interfaces', cert: 'Dermocompatible' },
];

const certifications = [
  { icon: Shield, label: 'ISO 13485', description: 'Gestión de calidad para dispositivos médicos' },
  { icon: Award, label: 'ISO 10993', description: 'Evaluación biológica de materiales' },
  { icon: CheckCircle2, label: 'COFEPRIS', description: 'Registro sanitario mexicano' },
  { icon: Cog, label: 'ASTM F2792', description: 'Estándares de manufactura aditiva' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative py-28 md:py-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/6 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2341E2BA%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%200h1v1H0zM20%200h1v1h-1zM0%2020h1v1H0zM20%2020h1v1h-1z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-5 text-sm px-4 py-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Printer className="h-4 w-4 mr-2" />
              DeepLux Bio · Manufactura 3D
            </Badge>

            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[1.1]">
              Medicina{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                impresa.
              </span>
              <br />
              <span className="text-foreground/70 text-3xl md:text-5xl">Del expediente al implante.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Modelos anatómicos, prótesis, ortesis e implantes a medida —
              fabricados con manufactura aditiva de grado médico e integrados directamente a ExpedienteDLM.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button size="lg" className="shadow-lg shadow-emerald-500/20 px-8 bg-emerald-500 hover:bg-emerald-600 text-white">
                <a href="mailto:bio@deeplux.org" className="flex items-center gap-2">
                  Solicitar cotización
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/portafolio">Ver todo el ecosistema</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Exclusivo para clínicas y hospitales · Integrado con ExpedienteDLM
            </p>
          </div>
        </section>

        {/* ── Servicios ───────────────────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                Servicios
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Manufactura médica de precisión
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada dispositivo se fabrica a medida del paciente con tecnología de manufactura aditiva certificada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {services.map(({ icon: SIcon, title, description, features, gradient, color }) => (
                <Card
                  key={title}
                  className={cn(
                    'bg-gradient-to-br border-border/60 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 group overflow-hidden',
                    gradient
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${color}22` }}
                      >
                        <SIcon className="h-6 w-6" style={{ color }} />
                      </div>
                      <h3 className="font-headline text-xl font-bold text-foreground">{title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-foreground/70 bg-background/60 rounded-lg px-2.5 py-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Flujo de Trabajo ────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Flujo de trabajo
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                De la orden médica al dispositivo
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                El médico ordena desde el expediente. Nosotros diseñamos, fabricamos y entregamos.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {workflow.map(({ step, icon: WIcon, title, description }, idx) => (
                <div key={step} className="flex items-start gap-5 group">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                      <WIcon className="h-6 w-6 text-emerald-400" />
                    </div>
                    {idx < workflow.length - 1 && (
                      <div className="w-0.5 h-6 bg-border/60 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        Paso {step}
                      </span>
                    </div>
                    <h3 className="font-headline text-lg font-bold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Materiales y Tecnología ─────────────────────────────────── */}
        <section className="py-24 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-3">
                <Beaker className="h-3.5 w-3.5 mr-1.5" />
                Materiales
              </Badge>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Materiales de grado médico
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Cada material es seleccionado según la aplicación clínica y los estándares regulatorios.
              </p>
            </div>

            {/* Materials table */}
            <div className="max-w-3xl mx-auto">
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/40 bg-background/40">
                          <th className="text-left p-4 font-semibold text-foreground">Material</th>
                          <th className="text-left p-4 font-semibold text-foreground">Aplicación</th>
                          <th className="text-left p-4 font-semibold text-foreground">Certificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map(({ name, use, cert }, idx) => (
                          <tr key={name} className={cn('border-b border-border/20', idx % 2 === 0 && 'bg-background/20')}>
                            <td className="p-4 font-medium text-foreground">{name}</td>
                            <td className="p-4 text-muted-foreground">{use}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                                {cert}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-10">
              {certifications.map(({ icon: CIcon, label, description }) => (
                <div key={label} className="text-center p-4 rounded-xl border border-border/40 bg-background/40 hover:border-emerald-500/30 transition-all">
                  <CIcon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="font-headline text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Integración con ExpedienteDLM ───────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge variant="secondary" className="mb-4">
                    <HeartPulse className="h-3.5 w-3.5 mr-1.5" />
                    Integración nativa
                  </Badge>
                  <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ordena desde el{' '}
                    <span className="text-accent">expediente</span>
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    DeepLux Bio está completamente integrado con ExpedienteDLM.
                    El médico puede solicitar prótesis, ortesis o modelos anatómicos directamente desde la historia clínica del paciente.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Orden desde el expediente con un clic',
                      'Imágenes DICOM/STL adjuntas automáticamente',
                      'Tracking de producción en tiempo real',
                      'Producto final vinculado al expediente',
                      'Comisión por referencia técnica para el médico',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual integration card */}
                <div className="relative">
                  <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                      <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">ExpedienteDLM</p>
                        <p className="text-xs text-muted-foreground">Paciente: María García · Exp. #2847</p>
                      </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Printer className="h-4 w-4 text-emerald-400" />
                        <p className="text-sm font-bold text-foreground">Orden de Manufactura 3D</p>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p>Producto: <span className="text-foreground">Ortesis de muñeca derecha</span></p>
                        <p>Material: <span className="text-foreground">PETG Biocompatible</span></p>
                        <p>Estado: <span className="text-emerald-400 font-medium">● En producción</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Entrega estimada: 5-7 días hábiles</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                        Tracking activo
                      </Badge>
                    </div>
                  </div>

                  {/* Decorative glow */}
                  <div className="absolute -inset-4 -z-10 bg-emerald-500/5 rounded-3xl blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────────────────────── */}
        <section className="py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/5 p-12 md:p-20 max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
              </div>

              <Badge variant="secondary" className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                DeepLux Bio
              </Badge>
              <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                El futuro de la medicina<br className="hidden md:block" /> se manufactura en 3D
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Contáctanos para una cotización personalizada. Cada dispositivo se fabrica
                específicamente para tu paciente.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="shadow-xl shadow-emerald-500/20 px-10 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <a href="mailto:bio@deeplux.org" className="flex items-center gap-2">
                    Solicitar cotización
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/registro/clinica">Registrar mi clínica</Link>
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
