import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Receipt, AlertCircle } from 'lucide-react';
import { CfdiRequestButton } from './cfdi-request-button';
import { formatMXN } from '@/lib/utils';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  paid: { label: 'Pagado', variant: 'default' },
  pending: { label: 'Pendiente', variant: 'secondary' },
  failed: { label: 'Fallido', variant: 'destructive' },
  refunded: { label: 'Reembolsado', variant: 'outline' },
  voided: { label: 'Cancelado', variant: 'outline' },
};

const processorLabels: Record<string, string> = {
  stripe: 'Tarjeta (Stripe)',
  conekta: 'OXXO / SPEI (Conekta)',
};

export default async function FacturacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/facturacion');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoicesRaw } = await supabase
    .from('invoices')
    .select('*, subscriptions(subscription_plans(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices = invoicesRaw as any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await supabase
    .from('professional_profiles')
    .select('rfc')
    .eq('user_id', user.id)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRaw as any;

  const pendingCFDI = invoices?.filter((i) => i.status === 'paid' && !i.cfdi_uuid) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4 px-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="font-headline text-xl font-bold">Facturación</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* CFDI Alert */}
        {pendingCFDI.length > 0 && !profile?.rfc && (
          <Card className="mb-6 border-amber-500/40 bg-amber-500/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-200">Solicita tu factura CFDI</p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Tienes {pendingCFDI.length} {pendingCFDI.length === 1 ? 'pago' : 'pagos'} sin factura.
                  Agrega tu RFC en tu perfil para emitir facturas CFDI 4.0 con timbre del SAT.{' '}
                  <Link href="/perfil#fiscal" className="underline">Agregar RFC →</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total pagado</p>
              <p className="font-bold text-xl text-foreground">
                {formatMXN(invoices?.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount_cents, 0) ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Pagos totales</p>
              <p className="font-bold text-xl text-foreground">{invoices?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Facturas CFDI</p>
              <p className="font-bold text-xl text-foreground">
                {invoices?.filter((i) => i.cfdi_uuid).length ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices list */}
        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Historial de pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {!invoices?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay pagos registrados aún.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {invoices.map((invoice, index) => {
                  const planName = (invoice.subscriptions as { subscription_plans: { name: string } | null } | null)
                    ?.subscription_plans?.name ?? 'Plan';
                  const statusInfo = statusLabels[invoice.status] ?? { label: invoice.status, variant: 'outline' as const };
                  const hasCFDI = !!invoice.cfdi_uuid;
                  const canRequestCFDI = invoice.status === 'paid' && !hasCFDI && !!profile?.rfc;

                  return (
                    <div key={invoice.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{planName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(invoice.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                              {invoice.payment_processor && ` · ${processorLabels[invoice.payment_processor] ?? invoice.payment_processor}`}
                            </p>
                            {hasCFDI && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                                  CFDI timbrado
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                                  {invoice.cfdi_uuid}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{formatMXN(invoice.amount_cents)}</p>
                            <Badge variant={statusInfo.variant} className="text-xs mt-0.5">
                              {statusInfo.label}
                            </Badge>
                          </div>

                          {/* Download buttons */}
                          <div className="flex gap-1">
                            {hasCFDI && invoice.cfdi_pdf_url && (
                              <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Descargar PDF">
                                <a href={invoice.cfdi_pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            {hasCFDI && invoice.cfdi_xml_url && (
                              <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Descargar XML">
                                <a href={invoice.cfdi_xml_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            {canRequestCFDI && (
                              <CfdiRequestButton invoiceId={invoice.id} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CFDI Info */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Facturas CFDI 4.0:</strong>{' '}
            Las facturas fiscales se emiten automáticamente al completar el pago si tienes RFC registrado.
            Válidas ante el SAT con UUID de timbre digital. Emitidas vía Facturapi.io.
            Para solicitar una factura de un pago anterior, agrega tu RFC en{' '}
            <Link href="/perfil#fiscal" className="text-accent hover:underline">tu perfil</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
