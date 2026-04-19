/** Spanish labels for subscription lifecycle (shared dashboards / admin). */
export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  trialing: 'En prueba',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  expired: 'Expirada',
  incomplete: 'Incompleta',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  failed: 'Fallida',
  refunded: 'Reembolsada',
  voided: 'Anulada',
};

export function subscriptionStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status;
}

export function invoiceStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return INVOICE_STATUS_LABELS[status] ?? status;
}
