import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | DeepLux',
  description: 'Términos y Condiciones de Uso del portal y servicios DeepLux',
};

export default function TerminosPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-bold mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-muted-foreground">Última actualización: Febrero 2025</p>
      </div>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">1. Aceptación de los Términos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Al acceder o utilizar el portal web, aplicaciones y servicios de DeepLux, S.A.P.I. de C.V. (en adelante, &quot;DeepLux&quot;, &quot;nosotros&quot; o el &quot;Portal&quot;), usted acepta quedar vinculado por estos Términos y Condiciones de Uso. Si no acepta estos términos, no debe utilizar nuestros servicios.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">2. Descripción del Servicio</h2>
        <p className="text-muted-foreground leading-relaxed">
          DeepLux ofrece un ecosistema digital que incluye: (i) software clínico (ExpedienteDLM, EscalasDLM, ToxinaDLM, CognitivApp-DLM, Physio-DLM); (ii) manufactura de dispositivos médicos y prótesis 3D (DeepLux Bio); y (iii) servicios de gestión de activos médicos. El acceso a las funcionalidades depende del plan de suscripción y del nivel de verificación del usuario.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">3. Registro y Cuenta</h2>
        <p className="text-muted-foreground leading-relaxed">
          Para utilizar servicios que requieran identificación, debe registrarse y proporcionar información veraz. Usted es responsable de mantener la confidencialidad de sus credenciales. DeepLux se reserva el derecho de suspender o cancelar cuentas que violen estos términos o que presenten conductas fraudulentas.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">4. Uso Aceptable</h2>
        <p className="text-muted-foreground leading-relaxed">
          El usuario se compromete a utilizar el Portal de forma lícita, ética y conforme a la normativa aplicable en materia de salud (NOM-024, COFEPRIS, regulaciones locales). Queda prohibido: (a) utilizar el servicio para fines ilegales; (b) intentar acceder sin autorización a sistemas o datos de terceros; (c) distribuir malware o interferir con el funcionamiento del Portal; (d) hacer uso comercial no autorizado de los contenidos.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">5. Propiedad Intelectual</h2>
        <p className="text-muted-foreground leading-relaxed">
          DeepLux y sus licenciantes son titulares de todos los derechos de propiedad intelectual sobre el Portal, el software, marcas, diseños y contenidos. El usuario no adquiere ningún derecho sobre dichos elementos más allá del uso permitido conforme a su suscripción. Los datos que el usuario introduce (expedientes, pacientes) permanecen bajo su responsabilidad; DeepLux actúa como encargado del tratamiento conforme al Aviso de Privacidad.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">6. Limitación de Responsabilidad</h2>
        <p className="text-muted-foreground leading-relaxed">
          El Portal y los servicios se proporcionan &quot;tal cual&quot;. DeepLux no será responsable por daños indirectos, consecuentes o punitivos derivados del uso o la imposibilidad de uso del servicio, salvo en los casos en que la ley no permita su limitación. Las herramientas de IA ofrecen soporte a la decisión; la responsabilidad clínica final recae en el profesional de la salud.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">7. Suspensión y Terminación</h2>
        <p className="text-muted-foreground leading-relaxed">
          DeepLux puede suspender o dar por terminado el acceso al Portal en caso de incumplimiento de estos términos, impago de suscripciones o por razones de seguridad o cumplimiento normativo. El usuario puede cancelar su suscripción conforme a las condiciones del plan.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">8. Modificaciones</h2>
        <p className="text-muted-foreground leading-relaxed">
          DeepLux puede modificar estos Términos en cualquier momento. Los cambios sustanciales serán notificados a través del Portal o por correo electrónico. El uso continuado del servicio tras la notificación constituye la aceptación de los nuevos términos.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">9. Ley Aplicable y Jurisdicción</h2>
        <p className="text-muted-foreground leading-relaxed">
          Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se someterá a los tribunales competentes en la Ciudad de México.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">10. Contacto</h2>
        <p className="text-muted-foreground leading-relaxed">
          Para consultas sobre estos Términos: <a href="mailto:legal@deeplux.com" className="text-accent hover:underline">legal@deeplux.com</a>
        </p>
      </section>
    </article>
  );
}
