import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | DeepLux',
  description: 'Aviso de Privacidad Integral de DeepLux - LFPDPPP, HIPAA, GDPR',
};

export default function PrivacidadPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-bold mb-2">Aviso de Privacidad Integral</h1>
        <p className="text-sm text-muted-foreground">Última actualización: Febrero 2025</p>
      </div>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">1. Identidad y Domicilio del Responsable</h2>
        <p className="text-muted-foreground leading-relaxed">
          DeepLux, S.A.P.I. de C.V. (en adelante, &quot;DeepLux&quot; o el &quot;Responsable&quot;), con domicilio fiscal ubicado en [Insertar Dirección Fiscal Completa: Calle, Número, Colonia, C.P., Ciudad, Estado, México], es el responsable del uso, tratamiento y protección de sus datos personales, así como de los datos sensibles que se recaben a través de nuestro ecosistema digital, el cual incluye las unidades de negocio DeepLux Med (Software), DeepLux Bio (Manufactura) y DeepLux Portafolio.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-2">
          DeepLux opera bajo los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento, y alineado a estándares internacionales como HIPAA (EE. UU.) y GDPR (Unión Europea).
        </p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">2. Datos Personales que Recabamos</h2>
        <p className="text-muted-foreground mb-4">Para la prestación de nuestros servicios, recabamos las siguientes categorías de datos, dependiendo de su perfil de usuario (Profesional de la Salud, Paciente o Proveedor):</p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">A. Datos de Identificación y Contacto</h3>
            <p className="text-muted-foreground text-sm">Nombre completo, CURP, RFC (con homoclave). Identificación oficial (INE, Pasaporte). Dirección de correo electrónico y número de teléfono móvil. Firma autógrafa y/o firma electrónica avanzada (e.firma).</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">B. Datos Laborales y Profesionales</h3>
            <p className="text-muted-foreground text-sm">Cédula Profesional (Federal y de Especialidad). Número de Registro ante autoridades sanitarias (SSA/COFEPRIS) o NPI. Certificaciones de Consejos Médicos. Dirección del consultorio o clínica y datos de facturación fiscal.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">C. Datos Patrimoniales y Financieros</h3>
            <p className="text-muted-foreground text-sm">Información de tarjetas bancarias (procesada y tokenizada por proveedores externos certificados PCI-DSS como Stripe; DeepLux no almacena el número completo de la tarjeta). Historial de facturación y pagos.</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">D. Datos Sensibles y Biométricos</h3>
            <p className="text-muted-foreground text-sm">Datos de salud, biométricos y, en módulos específicos, datos genéticos. Requieren protección especial conforme a la normativa aplicable.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">3. Finalidades del Tratamiento</h2>
        <p className="text-muted-foreground mb-4">Sus datos serán utilizados para: gestión de identidad DeepLux ID, prestación de servicios SaaS (ExpedienteDLM, EscalasDLM, ToxinaDLM), manufactura de dispositivos (DeepLux Bio), procesamiento mediante IA, facturación y cumplimiento normativo. Las finalidades secundarias (newsletters, estudios estadísticos) son opcionales; puede manifestar su negativa en privacidad@deeplux.com.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">4. Uso de Inteligencia Artificial</h2>
        <p className="text-muted-foreground">DeepLux utiliza IA como herramienta de soporte. La decisión final de diagnóstico, tratamiento o prescripción es responsabilidad exclusiva del profesional de la salud. Los datos para entrenamiento se utilizan desasociados.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">5. Transferencia de Datos</h2>
        <p className="text-muted-foreground">Sus datos pueden transferirse a empresas del grupo corporativo, autoridades (cuando lo requiera la ley), proveedores de nube (AWS, Supabase, Vercel) y aseguradoras a solicitud del paciente o médico.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">6. Cumplimiento Internacional</h2>
        <p className="text-muted-foreground">Para usuarios en EE. UU., suscribimos BAA y cumplimos HIPAA. Para usuarios en la UE, el tratamiento se basa en contrato y consentimiento; aplican derechos de portabilidad y derecho al olvido.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">7. Medidas de Seguridad</h2>
        <p className="text-muted-foreground">Cifrado AES-256 en reposo y TLS en tránsito, autenticación de doble factor, monitoreo de accesos y registros de auditoría inmutables.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">8. Derechos ARCO y Contacto</h2>
        <p className="text-muted-foreground">Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (ARCO). Envíe su solicitud a: <a href="mailto:privacidad@deeplux.com" className="text-accent hover:underline">privacidad@deeplux.com</a>, Asunto: Solicitud Derechos ARCO - [Su Nombre].</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">9. Uso de Cookies</h2>
        <p className="text-muted-foreground">Utilizamos cookies técnicas (necesarias para el login) y analíticas. Puede deshabilitarlas en su navegador, aunque esto podría afectar funcionalidades como la sesión segura.</p>
      </section>

      <section>
        <h2 className="font-headline text-lg font-semibold mb-4">10. Consentimiento</h2>
        <p className="text-muted-foreground">Al registrarse, hacer clic en &quot;Acepto&quot; o firmar digitalmente, usted otorga su consentimiento expreso para el tratamiento de sus datos conforme a este aviso. DeepLux se reserva el derecho de modificar este aviso; los cambios sustanciales serán notificados.</p>
      </section>
    </article>
  );
}
