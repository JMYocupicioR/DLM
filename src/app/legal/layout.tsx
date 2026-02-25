import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4 px-4 sticky top-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl prose prose-invert prose-slate dark:prose-invert">
        {children}
      </main>
    </div>
  );
}
