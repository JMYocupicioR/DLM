"use client";

import Link from 'next/link';
import { Stethoscope, Menu, X, ChevronDown, Stethoscope as StethIcon, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const solutionsMenu = [
  {
    label: 'Para Médicos',
    description: 'Expediente, escalas y verificación profesional',
    icon: StethIcon,
    href: '/#medicos',
    badge: null,
  },
  {
    label: 'Para Clínicas',
    description: 'Gestión de equipos, COFEPRIS y CFDI',
    icon: Building2,
    href: '/#clinicas',
    badge: null,
  },
  {
    label: 'Para Empresas',
    description: 'Salud ocupacional y cumplimiento NOM',
    icon: Briefcase,
    href: '/#empresas',
    badge: 'Nuevo',
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    const clean = id.replace('/#', '');
    if (window.location.pathname === '/') {
      document.getElementById(clean)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${clean}`;
    }
    setMenuOpen(false);
    setSolutionsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Stethoscope className="h-7 w-7 text-accent" />
          <span className="font-headline text-xl font-bold tracking-tight">DeepLux</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Soluciones dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                solutionsOpen
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              )}
            >
              Soluciones
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', solutionsOpen && 'rotate-180')} />
            </button>

            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border/60 bg-background shadow-xl shadow-black/20 p-2 z-50">
                {solutionsMenu.map(({ label, description, icon: Icon, href, badge }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => scrollTo(href)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        {badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing">Precios</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo('contact')}
          >
            Contacto
          </Button>

          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border/40">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/registro">Registrarse gratis</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background px-4 py-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Soluciones</p>
          {solutionsMenu.map(({ label, icon: Icon, href, badge }) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollTo(href)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium ml-auto">
                  {badge}
                </span>
              )}
            </button>
          ))}
          <div className="border-t border-border/40 pt-2 mt-2 space-y-1">
            <Link
              href="/pricing"
              className="block px-2 py-2.5 text-sm text-foreground hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              Precios
            </Link>
            <button
              type="button"
              className="w-full text-left px-2 py-2.5 text-sm text-foreground hover:text-accent"
              onClick={() => scrollTo('contact')}
            >
              Contacto
            </button>
          </div>
          <div className="flex gap-2 pt-3 border-t border-border/40">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href="/registro" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
