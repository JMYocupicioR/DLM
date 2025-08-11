export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DeepLuxMed.Mx. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
