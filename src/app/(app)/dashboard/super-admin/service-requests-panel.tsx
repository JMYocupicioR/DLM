'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, XCircle, MessageSquare, Clock, Eye,
  ChevronDown, ChevronUp, Loader2, Sparkles, Globe,
  Smartphone, Code2, Video, Palette, RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_role: string;
  requester_specialty: string | null;
  requester_city: string | null;
  service_type: string;
  service_title: string | null;
  service_description: string;
  target_audience: string | null;
  budget_range: string | null;
  timeline: string | null;
  has_branding: boolean;
  extra_details: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:               { label: 'Pendiente',            color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',    icon: Clock        },
  reviewing:             { label: 'En revisión',          color: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',        icon: Eye          },
  accepted:              { label: 'Aceptada',             color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  accepted_with_details: { label: 'Aceptada (+ detalles)',color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  changes_proposed:      { label: 'Cambios propuestos',   color: 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400',  icon: MessageSquare },
  denied:                { label: 'Denegada',             color: 'border-destructive/40 bg-destructive/10 text-destructive',                   icon: XCircle      },
};

const SERVICE_LABELS: Record<string, string> = {
  landing_page:      'Landing page',
  app_personalizada: 'App a la medida',
  automatizacion:    'Automatización',
  edicion_video:     'Edición de video',
  branding:          'Branding / Diseño',
  otro:              'Otro',
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  landing_page:      Globe,
  app_personalizada: Smartphone,
  automatizacion:    Code2,
  edicion_video:     Video,
  branding:          Palette,
  otro:              Sparkles,
};

const BUDGET_LABELS: Record<string, string> = {
  menos_5k:    '< $5,000 MXN',
  '5k_15k':    '$5,000 – $15,000',
  '15k_50k':   '$15,000 – $50,000',
  mas_50k:     '> $50,000 MXN',
  a_consultar: 'A consultar',
};

const TIMELINE_LABELS: Record<string, string> = {
  '1_2_semanas': '1-2 semanas',
  '1_mes':       '~1 mes',
  '3_meses':     '2-3 meses',
  flexible:      'Flexible',
};

async function patchRequest(
  id: string,
  status: string,
  admin_notes: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`/api/service-requests/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ServiceRequestsPanel({ initialRequests }: { initialRequests: ServiceRequest[] }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Review dialog state
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('accepted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const filters = [
    { id: 'all',      label: 'Todas' },
    { id: 'pending',  label: 'Pendientes' },
    { id: 'reviewing',label: 'En revisión' },
    { id: 'accepted', label: 'Aceptadas' },
    { id: 'denied',   label: 'Denegadas' },
  ];

  const visible = activeFilter === 'all'
    ? requests
    : activeFilter === 'accepted'
      ? requests.filter(r => r.status === 'accepted' || r.status === 'accepted_with_details')
      : requests.filter(r => r.status === activeFilter);

  const handleMarkReviewing = async (id: string) => {
    setLoadingId(id);
    const ok = await patchRequest(id, 'reviewing', null);
    if (ok) {
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'reviewing' } : r)));
    }
    setLoadingId(null);
  };

  const openReview = (id: string) => {
    setReviewId(id);
    setReviewStatus('accepted');
    setReviewNotes('');
    setReviewError(null);
  };

  const submitReview = async () => {
    if (!reviewId) return;
    setReviewSaving(true);
    setReviewError(null);
    const ok = await patchRequest(reviewId, reviewStatus, reviewNotes);
    setReviewSaving(false);
    if (ok) {
      setRequests(prev =>
        prev.map(r => r.id === reviewId
          ? { ...r, status: reviewStatus, admin_notes: reviewNotes, reviewed_at: new Date().toISOString() }
          : r
        )
      );
      setReviewId(null);
    } else {
      setReviewError('No se pudo guardar. Intenta de nuevo.');
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="font-headline text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Solicitudes de servicios tecnológicos
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {requests.filter(r => r.status === 'pending').length} pendientes
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap mt-2">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                activeFilter === id
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin solicitudes en este filtro</p>
        ) : (
          <div className="space-y-3">
            {visible.map((req) => {
              const meta = STATUS_META[req.status] ?? STATUS_META['pending'];
              const StatusIcon = meta.icon;
              const SvcIcon = SERVICE_ICONS[req.service_type] ?? Sparkles;
              const isExpanded = expanded === req.id;

              return (
                <div
                  key={req.id}
                  className={cn(
                    'rounded-xl border transition-all duration-200',
                    req.status === 'pending'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-border/60 bg-background/60'
                  )}
                >
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : req.id)}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-accent/5 transition-colors rounded-xl cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <SvcIcon className="h-4 w-4 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{req.requester_name}</p>
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border', meta.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {SERVICE_LABELS[req.service_type] ?? req.service_type}
                        {req.service_title ? ` · "${req.service_title}"` : ''}
                        {' · '}
                        {new Date(req.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>

                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    }
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {[
                          { k: 'Correo',       v: req.requester_email },
                          { k: 'Teléfono',     v: req.requester_phone ?? '—' },
                          { k: 'Rol',          v: req.requester_role },
                          { k: 'Ciudad',       v: req.requester_city ?? '—' },
                          { k: 'Especialidad', v: req.requester_specialty ?? '—' },
                          { k: 'Presupuesto',  v: BUDGET_LABELS[req.budget_range ?? ''] ?? req.budget_range ?? '—' },
                          { k: 'Plazo',        v: TIMELINE_LABELS[req.timeline ?? ''] ?? req.timeline ?? '—' },
                          { k: 'Ya tiene branding', v: req.has_branding ? 'Sí' : 'No' },
                        ].map(({ k, v }) => (
                          <div key={k}>
                            <span className="text-xs text-muted-foreground">{k}</span>
                            <p className="text-sm text-foreground font-medium">{v}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                        <p className="text-sm text-foreground/80 leading-relaxed rounded-lg bg-background/60 border border-border/40 p-3">
                          {req.service_description}
                        </p>
                      </div>

                      {req.target_audience && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Público objetivo</p>
                          <p className="text-sm text-foreground/80">{req.target_audience}</p>
                        </div>
                      )}

                      {req.extra_details && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Detalles extra</p>
                          <p className="text-sm text-foreground/80">{req.extra_details}</p>
                        </div>
                      )}

                      {req.admin_notes && (
                        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                          <p className="text-xs font-semibold text-accent mb-1">Respuesta del equipo DeepLux</p>
                          <p className="text-sm text-foreground/80">{req.admin_notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap pt-1">
                        {req.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkReviewing(req.id)}
                            disabled={loadingId === req.id}
                            className="text-xs"
                          >
                            {loadingId === req.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              : <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            }
                            Marcar en revisión
                          </Button>
                        )}
                        {(req.status === 'pending' || req.status === 'reviewing') && (
                          <Button
                            size="sm"
                            onClick={() => openReview(req.id)}
                            className="text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Responder solicitud
                          </Button>
                        )}
                        {(req.status === 'accepted' || req.status === 'accepted_with_details' || req.status === 'changes_proposed' || req.status === 'denied') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReview(req.id)}
                            className="text-xs"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Editar respuesta
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* ── Review modal ──────────────────────────────────────────────────── */}
      {reviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-background shadow-2xl p-6">
            <h3 className="font-headline text-lg font-bold text-foreground mb-4">Responder solicitud</h3>

            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">Decisión</p>
              <div className="space-y-2">
                {[
                  { id: 'accepted',              label: '✅ Aceptar solicitud',          desc: 'Se acepta tal como está' },
                  { id: 'accepted_with_details', label: '✅ Aceptar y pedir más detalles', desc: 'Aceptada, pero se necesita más información' },
                  { id: 'changes_proposed',      label: '💡 Proponer cambios / mejoras',  desc: 'Sugiere ajustes antes de proceder' },
                  { id: 'denied',                label: '❌ Denegar solicitud',            desc: 'No se puede proceder con este proyecto' },
                ].map(({ id, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setReviewStatus(id)}
                    className={cn(
                      'w-full flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors cursor-pointer',
                      reviewStatus === id
                        ? 'border-accent bg-accent/10'
                        : 'border-border/60 bg-card hover:border-accent/40'
                    )}
                  >
                    <span className={cn(
                      'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      reviewStatus === id ? 'border-accent' : 'border-muted-foreground/40'
                    )}>
                      {reviewStatus === id && <span className="w-2 h-2 rounded-full bg-accent" />}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-foreground mb-1.5">
                {reviewStatus === 'denied' ? 'Motivo de denegación (recomendado)' : 'Mensaje / notas para el solicitante'}
              </p>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-colors resize-none"
                placeholder={
                  reviewStatus === 'denied'
                    ? 'Ej. En este momento no tenemos disponibilidad para este tipo de proyecto...'
                    : reviewStatus === 'changes_proposed'
                    ? 'Ej. Nos gustaría ajustar el alcance del proyecto a...'
                    : reviewStatus === 'accepted_with_details'
                    ? 'Ej. ¡Proyecto aceptado! Para continuar necesitamos que nos envíes...'
                    : 'Ej. ¡Excelente proyecto! En breve nos pondremos en contacto contigo...'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            {reviewError && (
              <p className="text-sm text-destructive mb-3">{reviewError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReviewId(null)} disabled={reviewSaving}>
                Cancelar
              </Button>
              <Button onClick={submitReview} disabled={reviewSaving}>
                {reviewSaving
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <CheckCircle2 className="h-4 w-4 mr-2" />
                }
                Guardar respuesta
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
