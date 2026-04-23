"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DeepLuxLogo from '@/components/deeplux-logo';

const footerLinks = {
  productos: [
    { label: 'Conexiones', href: '/conexiones' },
    { label: 'DeepLux MED', href: '/med' },
    { label: 'Portafolio', href: '/portafolio' },
    { label: 'DeepLux Bio', href: '/bio' },
    { label: 'Precios', href: '/pricing' },
  ],
  empresa: [
    { label: 'Iniciar sesión', href: '/login' },
    { label: 'Registrarse', href: '/registro' },
    { label: 'Contacto', href: 'mailto:hola@deeplux.org' },
  ],
  legal: [
    { label: 'Aviso de Privacidad', href: '/legal/privacidad' },
    { label: 'Términos de Servicio', href: '/legal/terminos' },
  ],
};

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <DeepLuxLogo size="sm" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ecosistema de tecnología médica con IA para especialistas, clínicas y empresas.
            </p>
          </div>

          {/* Productos */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Productos</h4>
            <ul className="space-y-2">
              {footerLinks.productos.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('mailto:') ? (
                    <a href={href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {year} DeepLux.org. Todos los derechos reservados. · Hecho en México 🇲🇽
          </p>
        </div>
      </div>
    </footer>
  );
}
