"use client";

import { Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-7 w-7 text-accent" />
          <span className="font-headline text-xl font-bold tracking-tight">DeepLuxMed.Mx</span>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" onClick={() => scrollTo('home')}>
            Inicio
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('services')}>
            Servicios
          </Button>
          <Button variant="default" onClick={() => scrollTo('contact')}>
            Contacto
          </Button>
        </nav>
      </div>
    </header>
  );
}
