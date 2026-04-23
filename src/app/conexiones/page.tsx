'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Handshake,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Users,
  Zap,
  Rocket,
} from 'lucide-react';

const medicalOptions = [
  'Perfil profesional con enfoque clínico y empresarial',
  'Página pública para atraer pacientes o aliados',
  'Publicación de servicios personalizados de salud digital',
  'Conexión directa con empresas y clínicas interesadas',
];

const businessOptions = [
  'Solicitud de soluciones médicas tecnológicas a medida',
  'Contratación de expertos para proyectos específicos',
  'Comparación de perfiles por especialidad y experiencia',
  'Canal directo para seguimiento y cotización',
];

const connectionSteps = [
  {
    icon: Users,
    title: '1. Publica tu necesidad o tu servicio',
    description:
      'Médicos y profesionales pueden ofrecer soluciones. Empresas y clínicas pueden publicar requerimientos concretos.',
  },
  {
    icon: MessageSquare,
    title: '2. Conecta y valida el perfil',
    description:
      'Se facilita la conexión directa entre perfiles verificados para iniciar conversaciones claras y orientadas a resultados.',
  },
  {
    icon: Handshake,
    title: '3. Ejecuta con acompañamiento',
    description:
      'DeepLux mantiene el enfoque en proyectos para el sector salud, priorizando calidad, confianza y cumplimiento.',
  },
];

export default function ConexionesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute left-1/2 top-0 h-[420px] w-[840px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-primary/20 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Nuevo espacio DeepLux.org
            </Badge>
            <h1 className="font-headline text-4xl font-bold text-foreground md:text-5xl">
              Conexiones para médicos y empresarios
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
              Todo sobre conexiones estratégicas en salud: un lugar donde profesionales médicos y empresas colaboran
              para crear soluciones reales de tecnología, operaciones y crecimiento.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-lg shadow-accent/20">
                <Link href="/conexiones/solicitar">
                  <Rocket className="mr-2 h-4 w-4" />
                  Solicitar un servicio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/registro/empresa">Soy empresa, quiero soluciones</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-border/40 bg-card/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <Badge variant="secondary" className="mb-3">
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                Más opciones para cada perfil
              </Badge>
              <h2 className="font-headline text-3xl font-bold text-foreground md:text-4xl">
                Qué puedes hacer en Conexiones
              </h2>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-border/60 bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                      <Stethoscope className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Para médicos</p>
                      <h3 className="font-headline text-xl font-bold text-foreground">Amplía tu alcance profesional</h3>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {medicalOptions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                      <Briefcase className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Para empresarios</p>
                      <h3 className="font-headline text-xl font-bold text-foreground">Encuentra talento especializado</h3>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {businessOptions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <Badge variant="secondary" className="mb-3">
                <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                Flujo de conexión
              </Badge>
              <h2 className="font-headline text-3xl font-bold text-foreground md:text-4xl">
                Cómo funciona esta sección
              </h2>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
              {connectionSteps.map(({ icon: StepIcon, title, description }) => (
                <Card key={title} className="border-border/60 bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                      <StepIcon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mb-2 font-headline text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-background p-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                Enfoque exclusivo para sector salud
              </div>
              <h3 className="font-headline text-2xl font-bold text-foreground">
                Conecta más rápido, con mayor confianza
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                DeepLux Conexiones reúne oferta y demanda especializada para proyectos médicos y empresariales con una
                experiencia simple, directa y profesional.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="shadow-lg shadow-accent/20">
                  <Link href="/conexiones/solicitar">
                    <Rocket className="mr-2 h-4 w-4" />
                    Iniciar cuestionario
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:hola@deeplux.org?subject=Quiero%20publicar%20un%20proyecto%20en%20Conexiones">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar al equipo
                  </a>
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
