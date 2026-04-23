'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Stethoscope, Building2,
  Briefcase, Globe, Smartphone, Code2, Video, Palette,
  Clock, DollarSign, MessageSquare, Rocket, Sparkles,
  User, Mail, Phone, MapPin, Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_role: string;
  requester_specialty: string;
  requester_city: string;
  service_type: string;
  service_title: string;
  service_description: string;
  target_audience: string;
  budget_range: string;
  timeline: string;
  has_branding: boolean;
  extra_details: string;
}

const initialForm: FormData = {
  requester_name: '',
  requester_email: '',
  requester_phone: '',
  requester_role: '',
  requester_specialty: '',
  requester_city: '',
  service_type: '',
  service_title: '',
  service_description: '',
  target_audience: '',
  budget_range: '',
  timeline: '',
  has_branding: false,
  extra_details: '',
};

// ─── Catalog data ─────────────────────────────────────────────────────────────

const roles = [
  { id: 'medico',   label: 'Médico / Especialista', icon: Stethoscope, color: 'accent' },
  { id: 'clinica',  label: 'Clínica / Consultorio',  icon: Building2,   color: 'blue-500' },
  { id: 'empresa',  label: 'Empresa / Corporativo',   icon: Briefcase,   color: 'emerald-500' },
  { id: 'otro',     label: 'Otro profesional',         icon: User,        color: 'purple-500' },
];

const services = [
  {
    id: 'landing_page',
    label: 'Landing page profesional',
    description: 'Sitio .com con dominio propio para atraer pacientes o clientes',
    icon: Globe,
    color: '#2E3192',
  },
  {
    id: 'app_personalizada',
    label: 'App a la medida',
    description: 'Aplicación web/móvil para tu clínica, empresa o proceso clínico',
    icon: Smartphone,
    color: '#6C63FF',
  },
  {
    id: 'automatizacion',
    label: 'Automatización / Software web',
    description: 'Panel, portal interno o flujo automatizado para tu operación',
    icon: Code2,
    color: '#41E2BA',
  },
  {
    id: 'edicion_video',
    label: 'Edición de video profesional',
    description: 'Videos para redes sociales, reels médicos, presentaciones o cursos',
    icon: Video,
    color: '#FF6B6B',
  },
  {
    id: 'branding',
    label: 'Branding / Identidad visual',
    description: 'Logo, paleta de colores, materiales gráficos para tu marca médica',
    icon: Palette,
    color: '#F97316',
  },
  {
    id: 'otro',
    label: 'Otro servicio',
    description: 'Describe tu necesidad y lo analizamos juntos',
    icon: Sparkles,
    color: '#0EA5E9',
  },
];

const budgets = [
  { id: 'menos_5k',    label: 'Menos de $5,000 MXN' },
  { id: '5k_15k',      label: '$5,000 – $15,000 MXN' },
  { id: '15k_50k',     label: '$15,000 – $50,000 MXN' },
  { id: 'mas_50k',     label: 'Más de $50,000 MXN' },
  { id: 'a_consultar', label: 'Prefiero consultarlo' },
];

const timelines = [
  { id: '1_2_semanas', label: '1 – 2 semanas' },
  { id: '1_mes',       label: 'Aprox. 1 mes' },
  { id: '3_meses',     label: '2 – 3 meses' },
  { id: 'flexible',    label: 'Flexible / sin prisa' },
];

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Sobre ti',        icon: User       },
  { id: 2, label: 'El servicio',     icon: Rocket     },
  { id: 3, label: 'Los detalles',    icon: MessageSquare },
  { id: 4, label: 'Presupuesto',     icon: DollarSign },
  { id: 5, label: 'Confirmación',    icon: CheckCircle2 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SolicitarServicioPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Validation per step ──────────────────────────────────────────────────
  const canNext = (): boolean => {
    if (step === 1) return !!form.requester_name && !!form.requester_email && !!form.requester_role;
    if (step === 2) return !!form.service_type;
    if (step === 3) return !!form.service_description.trim();
    if (step === 4) return !!form.budget_range && !!form.timeline;
    return true;
  };

  const next = () => { if (canNext()) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error al enviar la solicitud');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-accent" />
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Solicitud enviada
          </Badge>
          <h1 className="font-headline text-3xl font-bold text-foreground mb-3">
            ¡Tu solicitud está en camino!
          </h1>
          <p className="text-muted-foreground mb-2">
            El equipo de DeepLux está revisando tu proyecto. Recibirás una respuesta personalizada a:
          </p>
          <p className="font-semibold text-accent mb-6">{form.requester_email}</p>
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-left space-y-3 mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">¿Qué sigue?</p>
            {[
              { num: '01', text: 'El super administrador revisará tu solicitud en detalle.' },
              { num: '02', text: 'Recibirás una respuesta personalizada: aceptación, propuesta de mejora o información adicional.' },
              { num: '03', text: 'Si se acepta, te contactaremos para continuar con los detalles del proyecto.' },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 text-xs font-bold text-accent flex items-center justify-center flex-shrink-0">
                  {num}
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <Button asChild>
            <Link href="/conexiones">
              Volver a Conexiones
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/conexiones" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Conexiones
          </Link>
          <Badge variant="secondary" className="text-xs">
            <Rocket className="h-3 w-3 mr-1" />
            Solicitar servicio
          </Badge>
          <span className="text-xs text-muted-foreground">
            {step} / {STEPS.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border/40">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {STEPS.map(({ id, label, icon: StepIcon }) => {
            const done = step > id;
            const active = step === id;
            return (
              <div
                key={id}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  active  ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20' :
                  done    ? 'bg-accent/15 text-accent border-accent/30' :
                            'bg-card text-muted-foreground border-border/60'
                )}
              >
                {done
                  ? <CheckCircle2 className="h-3 w-3" />
                  : <StepIcon className="h-3 w-3" />
                }
                {label}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Sobre ti ─────────────────────────────────────────────── */}
        {step === 1 && (
          <StepWrapper
            title="Cuéntanos sobre ti"
            subtitle="Así podemos entender mejor tu contexto y ofrecerte la solución más adecuada."
          >
            <div className="space-y-5">
              {/* Rol */}
              <div>
                <Label>¿Cómo te describes? <Required /></Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {roles.map(({ id, label, icon: Icon }) => (
                    <SelectCard
                      key={id}
                      selected={form.requester_role === id}
                      onClick={() => set('requester_role', id)}
                    >
                      <Icon className="h-5 w-5 text-accent mb-1.5" />
                      <span className="text-sm font-medium text-foreground text-center leading-tight">{label}</span>
                    </SelectCard>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <Label>Nombre completo <Required /></Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={inputCls}
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Dr. Nombre Apellido"
                    value={form.requester_name}
                    onChange={(e) => set('requester_name', e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label>Correo electrónico <Required /></Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    className={inputCls}
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="tu@correo.com"
                    value={form.requester_email}
                    onChange={(e) => set('requester_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Teléfono */}
                <div>
                  <Label>Teléfono / WhatsApp</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      className={inputCls}
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder="+52 55 1234 5678"
                      value={form.requester_phone}
                      onChange={(e) => set('requester_phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <Label>Ciudad</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      className={inputCls}
                      style={{ paddingLeft: '2.25rem' }}
                      placeholder="CDMX, Guadalajara..."
                      value={form.requester_city}
                      onChange={(e) => set('requester_city', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Especialidad (solo si médico) */}
              {form.requester_role === 'medico' && (
                <div>
                  <Label>Especialidad médica</Label>
                  <input
                    className={cn(inputCls, 'mt-1.5')}
                    placeholder="Neurología, Rehabilitación, Cardiología..."
                    value={form.requester_specialty}
                    onChange={(e) => set('requester_specialty', e.target.value)}
                  />
                </div>
              )}
            </div>
          </StepWrapper>
        )}

        {/* ── Step 2: Tipo de servicio ─────────────────────────────────────── */}
        {step === 2 && (
          <StepWrapper
            title="¿Qué necesitas?"
            subtitle="Selecciona el tipo de servicio que más se acerca a lo que tienes en mente."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(({ id, label, description, icon: SIcon, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set('service_type', id)}
                  className={cn(
                    'group relative rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer',
                    form.service_type === id
                      ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                      : 'border-border/60 bg-card hover:border-accent/50 hover:bg-accent/5'
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <SIcon className="h-5 w-5" style={{ color }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  {form.service_type === id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* ── Step 3: Detalles del proyecto ────────────────────────────────── */}
        {step === 3 && (
          <StepWrapper
            title="Cuéntanos más sobre tu proyecto"
            subtitle="Entre más detallado seas, mejor podremos analizar y responder a tu solicitud."
          >
            <div className="space-y-5">
              {/* Título del proyecto */}
              <div>
                <Label>Ponle un nombre a tu proyecto</Label>
                <input
                  className={cn(inputCls, 'mt-1.5')}
                  placeholder='Ej. "Mi web de consulta de neurología"'
                  value={form.service_title}
                  onChange={(e) => set('service_title', e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div>
                <Label>Descripción del servicio que necesitas <Required /></Label>
                <textarea
                  rows={5}
                  className={cn(inputCls, 'mt-1.5 resize-none leading-relaxed')}
                  placeholder="Ej. Quiero una landing page donde mis pacientes puedan ver mi perfil, agendar citas y contactarme por WhatsApp. Me gustaría que tenga un diseño moderno y profesional..."
                  value={form.service_description}
                  onChange={(e) => set('service_description', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {form.service_description.length}/500 caracteres recomendados
                </p>
              </div>

              {/* Público objetivo */}
              <div>
                <Label>¿A quién va dirigido el resultado?</Label>
                <input
                  className={cn(inputCls, 'mt-1.5')}
                  placeholder="Ej. Pacientes con dolor crónico, empresas de manufactura..."
                  value={form.target_audience}
                  onChange={(e) => set('target_audience', e.target.value)}
                />
              </div>

              {/* ¿Ya tiene branding? */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                <button
                  type="button"
                  onClick={() => set('has_branding', !form.has_branding)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
                    form.has_branding ? 'bg-accent' : 'bg-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      form.has_branding ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">Ya tengo logo / identidad visual</p>
                  <p className="text-xs text-muted-foreground">Actívalo si ya tienes materiales de marca que podemos usar</p>
                </div>
              </div>

              {/* Detalles extra */}
              <div>
                <Label>¿Algo más que quieras agregar?</Label>
                <textarea
                  rows={3}
                  className={cn(inputCls, 'mt-1.5 resize-none')}
                  placeholder="Referencias de sitios que te gustan, funciones específicas, integraciones necesarias, etc."
                  value={form.extra_details}
                  onChange={(e) => set('extra_details', e.target.value)}
                />
              </div>
            </div>
          </StepWrapper>
        )}

        {/* ── Step 4: Presupuesto y tiempo ─────────────────────────────────── */}
        {step === 4 && (
          <StepWrapper
            title="Presupuesto y tiempos"
            subtitle="Esta información nos ayuda a ajustar la propuesta de forma realista. No hay respuesta incorrecta."
          >
            <div className="space-y-6">
              {/* Presupuesto */}
              <div>
                <Label>Rango de inversión aproximado <Required /></Label>
                <div className="space-y-2 mt-2">
                  {budgets.map(({ id, label }) => (
                    <RadioRow
                      key={id}
                      label={label}
                      selected={form.budget_range === id}
                      onClick={() => set('budget_range', id)}
                    />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label>¿En cuánto tiempo necesitas esto? <Required /></Label>
                <div className="space-y-2 mt-2">
                  {timelines.map(({ id, label }) => (
                    <RadioRow
                      key={id}
                      label={label}
                      selected={form.timeline === id}
                      onClick={() => set('timeline', id)}
                      icon={Clock}
                    />
                  ))}
                </div>
              </div>
            </div>
          </StepWrapper>
        )}

        {/* ── Step 5: Resumen y envío ───────────────────────────────────────── */}
        {step === 5 && (
          <StepWrapper
            title="Revisa tu solicitud"
            subtitle="Todo en orden. Cuando confirmes, el equipo de DeepLux la analizará y te responderá por correo."
          >
            <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden mb-4">
              {[
                { label: 'Nombre', value: form.requester_name },
                { label: 'Correo', value: form.requester_email },
                { label: 'Rol', value: roles.find(r => r.id === form.requester_role)?.label ?? form.requester_role },
                { label: 'Servicio', value: services.find(s => s.id === form.service_type)?.label ?? form.service_type },
                { label: 'Proyecto', value: form.service_title || '—' },
                { label: 'Descripción', value: form.service_description },
                { label: 'Presupuesto', value: budgets.find(b => b.id === form.budget_range)?.label ?? '—' },
                { label: 'Plazo', value: timelines.find(t => t.id === form.timeline)?.label ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-foreground/90 leading-relaxed flex-1">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground/80 leading-relaxed mb-4">
              <span className="font-semibold text-accent">Nota:</span> Tu solicitud será revisada manualmente por el equipo de DeepLux.
              Recibirás una respuesta en <span className="font-semibold">24 – 48 horas hábiles</span> con una decisión, propuesta de mejora o solicitud de más información.
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm px-4 py-3 mb-4">
                {error}
              </p>
            )}
          </StepWrapper>
        )}

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button variant="outline" onClick={back} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <Button onClick={next} disabled={!canNext()}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="shadow-lg shadow-accent/20">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Enviar solicitud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepWrapper({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-7">
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SelectCard({ selected, onClick, children }: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-4 transition-all duration-200 cursor-pointer w-full min-h-[90px]',
        selected
          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
          : 'border-border/60 bg-card hover:border-accent/50 hover:bg-accent/5'
      )}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5">
          <CheckCircle2 className="h-4 w-4 text-accent" />
        </span>
      )}
      {children}
    </button>
  );
}

function RadioRow({ label, selected, onClick, icon: Icon }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer text-left',
        selected
          ? 'border-accent bg-accent/10 text-foreground shadow-sm shadow-accent/10'
          : 'border-border/60 bg-card text-muted-foreground hover:border-accent/50 hover:bg-accent/5 hover:text-foreground'
      )}
    >
      <span
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selected ? 'border-accent' : 'border-muted-foreground/40'
        )}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-accent" />}
      </span>
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-foreground">{children}</p>
  );
}

function Required() {
  return <span className="text-destructive ml-0.5">*</span>;
}

const inputCls =
  'w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-colors';
