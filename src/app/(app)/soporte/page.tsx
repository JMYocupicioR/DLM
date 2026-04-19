import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ContactForm from '@/components/contact-form';
import { LifeBuoy } from 'lucide-react';

const FAQS = [
  {
    q: '¿Cómo actualizo mi método de pago?',
    a: 'Entra a Suscripción. Si pagas con Stripe, usa “Actualizar método de pago”. Si tu plan es por Conekta u otro medio, escríbenos a soporte@deeplux.org.',
  },
  {
    q: '¿Cómo facturo mis pagos (CFDI)?',
    a: 'Agrega tu RFC en Perfil → Fiscal. Luego en Facturación podrás solicitar o descargar tus comprobantes cuando estén timbrados.',
  },
  {
    q: '¿Por qué no veo mi perfil público?',
    a: 'Debes activar el perfil público, definir un slug único y cumplir el nivel de confianza requerido. Revisa la pestaña “Público” en Perfil.',
  },
  {
    q: '¿Cómo invito a mi equipo (clínica o empresa)?',
    a: 'La asignación de asientos desde el portal está en evolución. Mientras tanto, contacta a soporte@deeplux.org con la lista de correos de tus médicos.',
  },
];

export default async function SoportePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/soporte');

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Soporte</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Preguntas frecuentes y contacto directo con el equipo DeepLux.
        </p>

        <Card className="bg-card border-border/60 mb-8">
          <CardHeader>
            <CardTitle className="text-base font-headline">Preguntas frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left cursor-pointer">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-headline">Enviar mensaje</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recibirás confirmación en pantalla; nuestro equipo responde por correo.
            </p>
          </CardHeader>
          <CardContent>
            <ContactForm defaultEmail={user.email ?? ''} supportMode />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
