'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MX_STATES } from '@/lib/constants';
import { validateRFC } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Stethoscope, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Building2, Briefcase, Heart, ShieldCheck, Landmark, Rocket, MoreHorizontal
} from 'lucide-react';
import { logComplianceAcceptance } from '../actions';

const TOTAL_STEPS = 6;

const empresaTypes = [
  { slug: 'startup',         label: 'Startup de Salud',         icon: Rocket,       description: 'Empresa emergente en el sector salud o healthtech' },
  { slug: 'pyme',            label: 'PyME / Empresa Mediana',    icon: Briefcase,    description: 'Empresa con equipo de salud propio o contratado' },
  { slug: 'corporativo',     label: 'Corporativo',               icon: Building2,    description: 'Gran empresa con programa de salud para empleados' },
  { slug: 'hospital_privado',label: 'Red Hospitalaria Privada',  icon: Heart,        description: 'Grupo de hospitales o clínicas privadas' },
  { slug: 'aseguradora',     label: 'Aseguradora de Salud',      icon: ShieldCheck,  description: 'Empresa de seguros médicos o de gastos médicos mayores' },
  { slug: 'gobierno',        label: 'Institución Gubernamental', icon: Landmark,     description: 'Organismo público o institución de salud pública' },
  { slug: 'otro',            label: 'Otro tipo de organización', icon: MoreHorizontal, description: 'Fundación, asociación u otro tipo de institución' },
];

const employeeRanges = [
  { value: '1-10',     label: '1–10 empleados' },
  { value: '11-50',    label: '11–50 empleados' },
  { value: '51-200',   label: '51–200 empleados' },
  { value: '201-1000', label: '201–1,000 empleados' },
  { value: '1000+',    label: 'Más de 1,000 empleados' },
];

const industriasOptions = [
  'Salud y Bienestar', 'Seguros Médicos', 'Hospitalaria',
  'Farmacéutica', 'Biotecnología', 'Tecnología', 'Manufactura',
  'Servicios Financieros', 'Gobierno', 'Educación', 'Retail', 'Otra',
];

const appsOptions = [
  { slug: 'expediente-dlm', label: 'Expediente Clínico Electrónico' },
  { slug: 'escalas-dlm',    label: 'Escalas Médicas y Evaluaciones' },
  { slug: 'toxina-dlm',     label: 'Gestión de Toxina Botulínica' },
  { slug: 'cognitivapp-dlm',label: 'Rehabilitación Cognitiva' },
  { slug: 'physio-dlm',     label: 'Telerehabilitación (Physio)' },
  { slug: 'portal-3d',      label: 'Manufactura Médica 3D' },
];

const plans = [
  {
    slug: 'empresa-basico',
    name: 'Empresa Básico',
    priceMXN: 1499,
    maxSeats: 5,
    description: 'Hasta 5 profesionales de salud',
    features: ['Expediente + Escalas', 'Panel de empresa', 'Soporte por email'],
  },
  {
    slug: 'empresa-pro',
    name: 'Empresa Pro',
    priceMXN: 3499,
    maxSeats: 25,
    description: 'Hasta 25 profesionales de salud',
    features: ['Todas las apps', 'Reportes de uso', 'CFDI automático', 'Soporte dedicado'],
    featured: true,
  },
  {
    slug: 'empresa-enterprise',
    name: 'Empresa Enterprise',
    priceMXN: 0,
    maxSeats: null,
    description: 'Asientos ilimitados — precio personalizado',
    features: ['Todo ilimitado', 'Integraciones custom', 'SLA garantizado', 'Gerente de cuenta'],
  },
];

interface FormData {
  empresaTypeSlug: string;
  razonSocial: string;
  rfc: string;
  industry: string;
  employeeCountRange: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  cargoContacto: string;
  password: string;
  regionCode: string;
  appsInterest: string[];
  numMedicos: string;
  planSlug: string;
  acceptTerminos: boolean;
  acceptPrivacidad: boolean;
}

const initialData: FormData = {
  empresaTypeSlug: '',
  razonSocial: '',
  rfc: '',
  industry: '',
  employeeCountRange: '',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  cargoContacto: '',
  password: '',
  regionCode: '',
  appsInterest: [],
  numMedicos: '',
  planSlug: '',
  acceptTerminos: false,
  acceptPrivacidad: false,
};

export default function RegistroEmpresaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleApp = (slug: string) => {
    const current = formData.appsInterest;
    const updated = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    update('appsInterest', updated);
  };

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 1 && !formData.empresaTypeSlug) {
      errs.empresaTypeSlug = 'Selecciona el tipo de organización';
    }

    if (s === 2) {
      if (!formData.razonSocial.trim()) errs.razonSocial = 'Razón social requerida';
      if (!formData.industry) errs.industry = 'Industria requerida';
      if (!formData.employeeCountRange) errs.employeeCountRange = 'Selecciona el tamaño';
      if (formData.rfc && !validateRFC(formData.rfc)) errs.rfc = 'Formato de RFC inválido';
    }

    if (s === 3) {
      if (!formData.contactName.trim()) errs.contactName = 'Nombre del contacto requerido';
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
        errs.contactEmail = 'Correo institucional válido requerido';
      }
      if (!formData.password || formData.password.length < 8) {
        errs.password = 'Contraseña de mínimo 8 caracteres';
      }
    }

    if (s === 5) {
      if (!formData.planSlug) errs.planSlug = 'Selecciona un plan';
      if (!formData.acceptTerminos) errs.acceptTerminos = 'Requerido';
      if (!formData.acceptPrivacidad) errs.acceptPrivacidad = 'Requerido';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleSubmit() {
    if (!validateStep(5)) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.contactEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.contactName,
            user_type: 'empresa',
            role: 'empresa_admin',
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        // Save onboarding session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)('onboarding_sessions').upsert({
          user_id: data.user.id,
          user_type: 'empresa',
          current_step: 5,
          total_steps: TOTAL_STEPS,
          completed_steps: [1, 2, 3, 4, 5],
          selected_user_type_slug: 'empresa',
          selected_plan_slug: formData.planSlug,
          form_data: formData,
          completed_at: new Date().toISOString(),
        });

        // Log compliance
        await Promise.all([
          logComplianceAcceptance(data.user.id, 'terminos'),
          logComplianceAcceptance(data.user.id, 'privacidad'),
        ]).catch(() => {});

        // Create empresa_profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)('empresa_profiles').upsert(
          {
            user_id: data.user.id,
            empresa_type: formData.empresaTypeSlug || null,
            razon_social: formData.razonSocial || null,
            rfc: formData.rfc?.toUpperCase() || null,
            industry: formData.industry || null,
            employee_count_range: formData.employeeCountRange || null,
            contact_name: formData.contactName || null,
            contact_email: formData.contactEmail || null,
            contact_phone: formData.contactPhone || null,
            cargo_contacto: formData.cargoContacto || null,
            website_url: formData.website || null,
            region_code: formData.regionCode || null,
            apps_interest: formData.appsInterest,
            num_medicos_estimado: formData.numMedicos ? parseInt(formData.numMedicos, 10) : null,
          },
          { onConflict: 'user_id' }
        ).catch(() => {});

        // Checkout
        if (formData.planSlug === 'empresa-enterprise') {
          setStep(6);
          return;
        }

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planSlug: formData.planSlug,
            billingInterval: 'monthly',
            processor: 'stripe',
          }),
        });
        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      setStep(6);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = [
    'Tipo de organización',
    'Datos generales',
    'Contacto responsable',
    'Uso de la plataforma',
    'Elige tu plan',
    '¡Listo!',
  ];

  const selectedType = empresaTypes.find((t) => t.slug === formData.empresaTypeSlug);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-accent" />
            <span className="font-headline text-xl font-bold">DeepLux</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Paso {Math.min(step, TOTAL_STEPS)} de {TOTAL_STEPS}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {step < 6 && (
        <div className="px-4 py-3 border-b border-border/20">
          <div className="container mx-auto max-w-2xl">
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
            <div className="flex justify-between mt-1.5">
              {stepTitles.slice(0, 5).map((title, i) => (
                <span
                  key={title}
                  className={cn(
                    'text-xs hidden sm:block',
                    i + 1 === step ? 'text-accent font-medium' : 'text-muted-foreground'
                  )}
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Step 1: Tipo de organización */}
          {step === 1 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">¿Qué tipo de organización eres?</h1>
              <p className="text-muted-foreground mb-6">Esto personaliza tu registro y las herramientas disponibles para tu equipo.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {empresaTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.empresaTypeSlug === type.slug;
                  return (
                    <button
                      key={type.slug}
                      type="button"
                      onClick={() => update('empresaTypeSlug', type.slug)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border/60 bg-card hover:border-accent/50 hover:bg-card/80'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', isSelected ? 'bg-accent/20' : 'bg-primary/10')}>
                        <Icon className={cn('h-5 w-5', isSelected ? 'text-accent' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{type.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-accent ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.empresaTypeSlug && <p className="text-destructive text-sm mt-2">{errors.empresaTypeSlug}</p>}
            </div>
          )}

          {/* Step 2: Datos generales */}
          {step === 2 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Datos generales de la empresa</h1>
              {selectedType && (
                <p className="text-muted-foreground mb-6">
                  Registrando como: <span className="text-foreground font-medium">{selectedType.label}</span>
                </p>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón social *</Label>
                  <Input
                    id="razonSocial"
                    placeholder="Empresa de Salud S.A. de C.V."
                    value={formData.razonSocial}
                    onChange={(e) => update('razonSocial', e.target.value)}
                  />
                  {errors.razonSocial && <p className="text-destructive text-xs">{errors.razonSocial}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC <span className="text-muted-foreground text-xs">(para facturas CFDI)</span></Label>
                    <Input
                      id="rfc"
                      placeholder="ESA880101ABC"
                      value={formData.rfc}
                      onChange={(e) => update('rfc', e.target.value.toUpperCase())}
                      maxLength={13}
                      className="uppercase"
                    />
                    {errors.rfc && <p className="text-destructive text-xs">{errors.rfc}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Industria *</Label>
                    <Select onValueChange={(v) => update('industry', v)} value={formData.industry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona industria" />
                      </SelectTrigger>
                      <SelectContent>
                        {industriasOptions.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-destructive text-xs">{errors.industry}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tamaño de la empresa *</Label>
                    <Select onValueChange={(v) => update('employeeCountRange', v)} value={formData.employeeCountRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Número de empleados" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeRanges.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employeeCountRange && <p className="text-destructive text-xs">{errors.employeeCountRange}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Estado donde operas</Label>
                    <Select onValueChange={(v) => update('regionCode', v)} value={formData.regionCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {MX_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://tuempresa.com"
                    value={formData.website}
                    onChange={(e) => update('website', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contacto responsable */}
          {step === 3 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Contacto responsable de la cuenta</h1>
              <p className="text-muted-foreground mb-6">Esta persona administrará los accesos del equipo médico en DeepLux.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nombre completo *</Label>
                    <Input
                      id="contactName"
                      placeholder="María González Torres"
                      value={formData.contactName}
                      onChange={(e) => update('contactName', e.target.value)}
                    />
                    {errors.contactName && <p className="text-destructive text-xs">{errors.contactName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargoContacto">Cargo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input
                      id="cargoContacto"
                      placeholder="Directora de RH, Gerente Médico..."
                      value={formData.cargoContacto}
                      onChange={(e) => update('cargoContacto', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Correo institucional *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contacto@tuempresa.com"
                    value={formData.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                  />
                  {errors.contactEmail && <p className="text-destructive text-xs">{errors.contactEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                  />
                  {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono de contacto <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={formData.contactPhone}
                    onChange={(e) => update('contactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Uso de la plataforma */}
          {step === 4 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">¿Para qué usará DeepLux tu empresa?</h1>
              <p className="text-muted-foreground mb-6">Esto nos ayuda a configurar la mejor experiencia para tu equipo.</p>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Aplicaciones de interés <span className="text-muted-foreground font-normal">(selecciona las que necesitas)</span></Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {appsOptions.map((app) => {
                      const isSelected = formData.appsInterest.includes(app.slug);
                      return (
                        <button
                          key={app.slug}
                          type="button"
                          onClick={() => toggleApp(app.slug)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all',
                            isSelected
                              ? 'border-accent bg-accent/10 text-foreground'
                              : 'border-border/60 bg-card hover:border-accent/50 text-muted-foreground'
                          )}
                        >
                          {isSelected
                            ? <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            : <div className="h-4 w-4 rounded-full border border-border flex-shrink-0" />
                          }
                          {app.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="numMedicos">¿Cuántos profesionales de salud necesitarán acceso?</Label>
                  <Input
                    id="numMedicos"
                    type="number"
                    min={1}
                    max={10000}
                    placeholder="Ej. 15"
                    value={formData.numMedicos}
                    onChange={(e) => update('numMedicos', e.target.value)}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">Esto es un estimado; podrás ajustar asientos después.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Plan */}
          {step === 5 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Elige el plan para tu empresa</h1>
              <p className="text-muted-foreground mb-6">14 días de prueba gratis. Cancela cuando quieras.</p>
              <div className="space-y-3 mb-6">
                {plans.map((plan) => {
                  const isSelected = formData.planSlug === plan.slug;
                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => update('planSlug', plan.slug)}
                      className={cn(
                        'w-full flex items-start justify-between p-4 rounded-lg border text-left transition-all',
                        isSelected ? 'border-accent bg-accent/10' : 'border-border/60 bg-card hover:border-accent/50',
                        plan.featured && !isSelected ? 'border-primary/40' : ''
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          {plan.featured && <Badge variant="outline" className="text-xs border-accent text-accent">Más popular</Badge>}
                          {plan.maxSeats && <Badge variant="secondary" className="text-xs">{plan.maxSeats} asientos</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                        <ul className="space-y-0.5">
                          {plan.features.map((f) => (
                            <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-accent flex-shrink-0" />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        {plan.priceMXN === 0 ? (
                          <span className="font-bold text-accent text-sm">A cotizar</span>
                        ) : (
                          <div>
                            <span className="font-bold text-foreground text-xl">${plan.priceMXN.toLocaleString()}</span>
                            <span className="text-muted-foreground text-xs block">MXN/mes</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.planSlug && <p className="text-destructive text-sm mb-4">{errors.planSlug}</p>}
              <div className="border border-border/60 rounded-lg p-4 space-y-4">
                <p className="text-sm font-medium text-foreground">Documentos legales *</p>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerminos"
                    checked={formData.acceptTerminos}
                    onCheckedChange={(v) => update('acceptTerminos', !!v)}
                  />
                  <label htmlFor="acceptTerminos" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                    Acepto los{' '}
                    <Link href="/legal/terminos" className="text-accent hover:underline" target="_blank">
                      Términos y Condiciones de Uso
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptPrivacidad"
                    checked={formData.acceptPrivacidad}
                    onCheckedChange={(v) => update('acceptPrivacidad', !!v)}
                  />
                  <label htmlFor="acceptPrivacidad" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                    Acepto el{' '}
                    <Link href="/legal/privacidad" className="text-accent hover:underline" target="_blank">
                      Aviso de Privacidad Integral
                    </Link>
                  </label>
                </div>
                {(errors.acceptTerminos || errors.acceptPrivacidad) && (
                  <p className="text-destructive text-xs">Debes aceptar ambos documentos para continuar.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h1 className="font-headline text-3xl font-bold text-foreground mb-3">¡Cuenta empresarial creada!</h1>
              <p className="text-muted-foreground mb-2">
                Revisa tu correo <strong className="text-foreground">{formData.contactEmail}</strong> para confirmar tu cuenta.
              </p>
              {formData.planSlug === 'empresa-enterprise' && (
                <p className="text-sm text-muted-foreground mb-4">
                  Un representante de DeepLux se pondrá en contacto contigo en las próximas 24 horas para personalizar tu plan Enterprise.
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-8">
                Confirmar tu email activa tu prueba gratuita de 14 días.
              </p>
              <div className="space-y-3 max-w-xs mx-auto">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Ir al dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pricing">Ver todos los planes</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => step === 1 ? router.push('/registro') : setStep((s) => s - 1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 1 ? 'Cambiar tipo' : 'Anterior'}
              </Button>

              {step < 5 ? (
                <Button onClick={nextStep} className="gap-2">
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
