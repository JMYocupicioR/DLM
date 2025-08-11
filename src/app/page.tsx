import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, BrainCog, Scale, MonitorPlay } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ContactForm from '@/components/contact-form';
import AiAssistant from '@/components/ai-assistant';

const services = [
  {
    icon: <Scale className="w-10 h-10 text-accent" />,
    title: 'Escalas-DLM.com',
    description: 'Acceso a un completo repositorio de escalas médicas y herramientas de evaluación para un diagnóstico preciso.',
    link: '#',
  },
  {
    icon: <FileText className="w-10 h-10 text-accent" />,
    title: 'Expediente-DLM.com',
    description: 'Sistema de expediente clínico electrónico seguro y eficiente para optimizar la gestión de pacientes.',
    link: '#',
  },
  {
    icon: <BrainCog className="w-10 h-10 text-accent" />,
    title: 'CognitivApp-DLM.com',
    description: 'Plataforma innovadora para la rehabilitación cognitiva, diseñada para mejorar la función cerebral de los pacientes.',
    link: '#',
  },
  {
    icon: <MonitorPlay className="w-10 h-10 text-accent" />,
    title: 'Physio-DLM.com',
    description: 'Servicios de telerehabilitación con videos, seguimiento en línea y cursos de actualización para médicos y fisioterapeutas.',
    link: '#',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="py-20 md:py-32 text-center">
          <div className="container mx-auto px-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-foreground animate-fade-in-down">
              Innovación y Tecnología para la Medicina Moderna
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              En DeepLuxMed.Mx, unificamos la tecnología de vanguardia y la atención médica para ofrecer soluciones integrales a los profesionales de la salud.
            </p>
            <Button size="lg" asChild>
              <a href="#services">
                Descubre Nuestras Soluciones
                <ArrowRight className="ml-2" />
              </a>
            </Button>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Un Ecosistema de Servicios Integrados</h2>
              <p className="text-lg text-muted-foreground mt-2">Todo lo que necesitas, en un solo lugar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service) => (
                <Card key={service.title} className="bg-card border-border/60 hover:border-accent transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                      {service.icon}
                    </div>
                    <CardTitle className="font-headline text-xl text-center">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-muted-foreground text-center mb-6">{service.description}</p>
                    <Button variant="secondary" className="w-full mt-auto" asChild>
                      <a href={service.link}>Saber Más</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Hablemos de tus Necesidades</h2>
                <p className="text-lg text-muted-foreground mt-4 mb-8">
                  ¿Interesado en una de nuestras soluciones? Completa el formulario y nuestro equipo se pondrá en contacto contigo para una demostración personalizada.
                </p>
                <div className="relative">
                  <Image src="https://placehold.co/600x400.png" alt="Medical Technology" width={600} height={400} className="rounded-lg shadow-2xl" data-ai-hint="medical technology" />
                  <div className="absolute inset-0 bg-primary/30 rounded-lg"></div>
                </div>
              </div>
              <Card className="p-8 shadow-2xl bg-card">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Solicita Información</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AiAssistant />
    </div>
  );
}
