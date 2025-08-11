"use client";

import { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {year} DeepLuxMed.Mx. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
