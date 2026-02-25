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
import { useToast } from '@/hooks/use-toast';
import { MX_STATES, SAT_REGIMES } from '@/lib/constants';
import { cn, validateRFC, validateCedula } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { logComplianceAcceptance } from '../actions';
import {
  Stethoscope, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Hospital, Microscope, Building, Dumbbell, Building2
} from 'lucide-react';

const TOTAL_STEPS = 8;

const clinicTypes = [
  { slug: 'hospital', label: 'Hospital', icon: Hospital, description: 'Hospital general o de especialidades' },
  { slug: 'clinica', label: 'Clínica', icon: Building2, description: 'Clínica privada o de especialidades' },
  { slug: 'consultorio', label: 'Consultorio', icon: Stethoscope, description: 'Consultorio médico privado' },
  { slug: 'laboratorio', label: 'Laboratorio', icon: Microscope, description: 'Laboratorio clínico o de análisis' },
  { slug: 'rehabilitacion', label: 'Rehabilitación', icon: Dumbbell, description: 'Centro de rehabilitación física' },
  { slug: 'otro', label: 'Otro', icon: Building, description: 'Otro tipo de institución de salud' },
];

const clinicPlans = [
  { slug: 'clinica-starter', name: 'Clínica Starter', priceMXN: 899, seats: 3, description: 'Hasta 3 médicos. Expediente + Escalas.' },
  { slug: 'clinica-pro', name: 'Clínica Pro', priceMXN: 2499, seats: 10, description: 'Hasta 10 médicos. Todas las apps.', featured: true },
  { slug: 'clinica-enterprise', name: 'Enterprise', priceMXN: 0, seats: null, description: 'Asientos ilimitados. Precio personalizado.' },
];

interface ClinicFormData {
  clinicType: string;
  clinicName: string;
  address: string;
  city: string;
  regionCode: string;
  phone: string;
  institutionalEmail: string;
  adminEmail: string;
  password: string;
  adminName: string;
  razonSocial: string;
  rfc: string;
  cfdiRegime: string;
  cofeprisNumber: string;
  reprisNumber: string;
  directorName: string;
  directorCedula: string;
  staffSize: string;
  specialties: string;
  planSlug: string;
  acceptTerminos: boolean;
  acceptPrivacidad: boolean;
}

const initialData: ClinicFormData = {
  clinicType: '',
  clinicName: '',
  address: '',
  city: '',
  regionCode: '',
  phone: '',
  institutionalEmail: '',
  adminEmail: '',
  password: '',
  adminName: '',
  razonSocial: '',
  rfc: '',
  cfdiRegime: '',
  cofeprisNumber: '',
  reprisNumber: '',
  directorName: '',
  directorCedula: '',
  staffSize: '',
  specialties: '',
  planSlug: '',
  acceptTerminos: false,
  acceptPrivacidad: false,
};

export default function RegistroClinicaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ClinicFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ClinicFormData>>({});

  const update = (field: keyof ClinicFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  function validateStep(s: number): boolean {
    const errs: Partial<ClinicFormData> = {};
    if (s === 1 && !formData.clinicType) errs.clinicType = 'Selecciona el tipo de organización';
    if (s === 2) {
      if (!formData.clinicName.trim()) errs.clinicName = 'Nombre requerido';
      if (!formData.regionCode) errs.regionCode = 'Estado requerido';
      if (!formData.adminEmail.trim()) errs.adminEmail = 'Correo requerido';
      if (!formData.password || formData.password.length < 8) errs.password = 'Mínimo 8 caracteres';
      if (!formData.adminName.trim()) errs.adminName = 'Nombre del administrador requerido';
    }
    if (s === 3) {
      if (!formData.rfc.trim()) errs.rfc = 'RFC requerido';
      if (formData.rfc && !validateRFC(formData.rfc)) errs.rfc = 'Formato de RFC inválido';
    }
    if (s === 5) {
      if (!formData.directorCedula.trim()) errs.directorCedula = 'Cédula del director médico requerida';
      if (formData.directorCedula && !validateCedula(formData.directorCedula)) {
        errs.directorCedula = 'La cédula debe tener 7-8 dígitos';
      }
    }
    if (s === 7) {
      if (!formData.planSlug) errs.planSlug = 'Selecciona un plan';
      if (!formData.acceptTerminos) errs.acceptTerminos = true;
      if (!formData.acceptPrivacidad) errs.acceptPrivacidad = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleSubmit() {
    if (!validateStep(7)) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.adminName,
            user_type: 'clinic_admin',
            clinic_name: formData.clinicName,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)('onboarding_sessions').upsert({
          user_id: data.user.id,
          user_type: 'clinic',
          current_step: 7,
          total_steps: TOTAL_STEPS,
          completed_steps: [1, 2, 3, 4, 5, 6, 7],
          selected_user_type_slug: 'clinic_admin',
          selected_plan_slug: formData.planSlug,
          form_data: formData,
          completed_at: new Date().toISOString(),
        });
        await Promise.all([
          logComplianceAcceptance(data.user.id, 'terminos'),
          logComplianceAcceptance(data.user.id, 'privacidad'),
        ]).catch(() => {});

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planSlug: formData.planSlug,
            billingInterval: 'monthly',
            processor: 'stripe',
            subscriber_type: 'clinic',
          }),
        });
        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        if (checkoutData.redirect && formData.planSlug === 'clinica-enterprise') {
          router.push(checkoutData.redirect);
          return;
        }
      }

      setStep(8);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = ['Tipo', 'Datos básicos', 'Fiscal', 'COFEPRIS', 'Director médico', 'Equipo', 'Plan', '¡Listo!'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-4 border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-accent" />
            <span className="font-headline text-xl font-bold">DeepLux</span>
          </Link>
          <span className="text-sm text-muted-foreground">Paso {Math.min(step, TOTAL_STEPS)} de {TOTAL_STEPS}</span>
        </div>
      </header>

      {step < 8 && (
        <div className="px-4 py-3 border-b border-border/20">
          <div className="container mx-auto max-w-2xl">
            <Progress value={(step / (TOTAL_STEPS - 1)) * 100} className="h-1.5" />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Step 1: Clinic Type */}
          {step === 1 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">¿Qué tipo de institución eres?</h1>
              <p className="text-muted-foreground mb-6">Personaliza tu registro según el tipo de organización.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {clinicTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.clinicType === type.slug;
                  return (
                    <button
                      key={type.slug}
                      type="button"
                      onClick={() => update('clinicType', type.slug)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all',
                        isSelected ? 'border-accent bg-accent/10' : 'border-border/60 bg-card hover:border-accent/50'
                      )}
                    >
                      <Icon className={cn('h-8 w-8', isSelected ? 'text-accent' : 'text-muted-foreground')} />
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{type.description}</p>
                    </button>
                  );
                })}
              </div>
              {errors.clinicType && <p className="text-destructive text-sm mt-2">{errors.clinicType}</p>}
            </div>
          )}

          {/* Step 2: Basic Data */}
          {step === 2 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Datos básicos</h1>
              <p className="text-muted-foreground mb-6">Información de tu institución y tu cuenta de administrador.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nombre de la institución *</Label>
                  <Input id="clinicName" placeholder="Clínica San Ángel" value={formData.clinicName} onChange={(e) => update('clinicName', e.target.value)} />
                  {errors.clinicName && <p className="text-destructive text-xs">{errors.clinicName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionalEmail">Correo institucional</Label>
                  <Input id="institutionalEmail" type="email" placeholder="contacto@clinica.com" value={formData.institutionalEmail} onChange={(e) => update('institutionalEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="55 1234 5678" value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" placeholder="Ciudad de México" value={formData.city} onChange={(e) => update('city', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Select onValueChange={(v) => update('regionCode', v)} value={formData.regionCode}>
                      <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        {MX_STATES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.regionCode && <p className="text-destructive text-xs">{errors.regionCode}</p>}
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 space-y-4">
                  <p className="text-sm font-medium text-foreground">Cuenta del administrador</p>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Tu nombre completo *</Label>
                    <Input id="adminName" placeholder="Dra. María Rodríguez" value={formData.adminName} onChange={(e) => update('adminName', e.target.value)} />
                    {errors.adminName && <p className="text-destructive text-xs">{errors.adminName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Tu correo electrónico *</Label>
                    <Input id="adminEmail" type="email" placeholder="admin@clinica.com" value={formData.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} />
                    {errors.adminEmail && <p className="text-destructive text-xs">{errors.adminEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={(e) => update('password', e.target.value)} />
                    {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Fiscal Data */}
          {step === 3 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Datos fiscales</h1>
              <p className="text-muted-foreground mb-6">Necesarios para emitir y recibir facturas CFDI 4.0.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón social</Label>
                  <Input id="razonSocial" placeholder="CLÍNICA SAN ÁNGEL S.A. DE C.V." value={formData.razonSocial} onChange={(e) => update('razonSocial', e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC *</Label>
                  <Input id="rfc" placeholder="CSA900101ABC" value={formData.rfc} onChange={(e) => update('rfc', e.target.value.toUpperCase())} maxLength={13} />
                  {errors.rfc && <p className="text-destructive text-xs">{errors.rfc}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Régimen fiscal SAT</Label>
                  <Select onValueChange={(v) => update('cfdiRegime', v)} value={formData.cfdiRegime}>
                    <SelectTrigger><SelectValue placeholder="Selecciona régimen fiscal" /></SelectTrigger>
                    <SelectContent>
                      {SAT_REGIMES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: COFEPRIS */}
          {step === 4 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Registro sanitario</h1>
              <p className="text-muted-foreground mb-6">Información de COFEPRIS y permisos sanitarios (opcional si no aplica).</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cofepris">Número COFEPRIS / Licencia Sanitaria</Label>
                  <Input id="cofepris" placeholder="C.S. / L.S. - número" value={formData.cofeprisNumber} onChange={(e) => update('cofeprisNumber', e.target.value)} />
                  <p className="text-xs text-muted-foreground">Número de Licencia Sanitaria otorgado por COFEPRIS</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repris">Número REPRIS</Label>
                  <Input id="repris" placeholder="Número en REPRIS (si aplica)" value={formData.reprisNumber} onChange={(e) => update('reprisNumber', e.target.value)} />
                  <p className="text-xs text-muted-foreground">Registro de Prestadores de Servicios de Salud</p>
                </div>
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                  <p className="text-sm text-foreground/80">
                    Estos datos son opcionales. Puedes completarlos después en el panel de administración.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Medical Director */}
          {step === 5 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Médico director / Responsable</h1>
              <p className="text-muted-foreground mb-6">Datos del responsable médico de la institución.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="directorName">Nombre del director médico *</Label>
                  <Input id="directorName" placeholder="Dr. Carlos Mendoza" value={formData.directorName} onChange={(e) => update('directorName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="directorCedula">Cédula profesional del director *</Label>
                  <Input
                    id="directorCedula"
                    placeholder="1234567"
                    value={formData.directorCedula}
                    onChange={(e) => update('directorCedula', e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                  />
                  {errors.directorCedula && <p className="text-destructive text-xs">{errors.directorCedula}</p>}
                  <p className="text-xs text-muted-foreground">Cédula de la Dirección General de Profesiones (SEP)</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Team */}
          {step === 6 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Tu equipo</h1>
              <p className="text-muted-foreground mb-6">Cuéntanos sobre tu equipo para recomendarte el plan adecuado.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffSize">Número aproximado de médicos</Label>
                  <Select onValueChange={(v) => update('staffSize', v)} value={formData.staffSize}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un rango" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Solo yo (1)</SelectItem>
                      <SelectItem value="2-3">2-3 médicos</SelectItem>
                      <SelectItem value="4-10">4-10 médicos</SelectItem>
                      <SelectItem value="11-25">11-25 médicos</SelectItem>
                      <SelectItem value="26+">Más de 25 médicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialties">Especialidades que ofrece la clínica</Label>
                  <Input
                    id="specialties"
                    placeholder="Cardiología, Neurología, Pediatría..."
                    value={formData.specialties}
                    onChange={(e) => update('specialties', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separadas por comas</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Choose Plan */}
          {step === 7 && (
            <div>
              <h1 className="font-headline text-2xl font-bold mb-2">Elige el plan para tu institución</h1>
              <p className="text-muted-foreground mb-6">14 días de prueba gratuita incluidos.</p>
              <div className="space-y-3">
                {clinicPlans.map((plan) => {
                  const isSelected = formData.planSlug === plan.slug;
                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => update('planSlug', plan.slug)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all relative',
                        isSelected ? 'border-accent bg-accent/10' : 'border-border/60 bg-card hover:border-accent/50'
                      )}
                    >
                      {plan.featured && (
                        <span className="absolute -top-2 right-4 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">Recomendado</span>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          {plan.seats && (
                            <span className="text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                              Hasta {plan.seats} asientos
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        {plan.priceMXN === 0 ? (
                          <span className="text-sm text-muted-foreground">A consultar</span>
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
              {errors.planSlug && <p className="text-destructive text-sm mt-2">{errors.planSlug}</p>}
              <div className="mt-6 space-y-4 border border-border/60 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">Aceptación de documentos legales *</p>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerminos"
                    checked={formData.acceptTerminos}
                    onCheckedChange={(v) => update('acceptTerminos', !!v)}
                  />
                  <label htmlFor="acceptTerminos" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                    Acepto los <Link href="/legal/terminos" className="text-accent hover:underline" target="_blank">Términos y Condiciones de Uso</Link>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptPrivacidad"
                    checked={formData.acceptPrivacidad}
                    onCheckedChange={(v) => update('acceptPrivacidad', !!v)}
                  />
                  <label htmlFor="acceptPrivacidad" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                    Acepto el <Link href="/legal/privacidad" className="text-accent hover:underline" target="_blank">Aviso de Privacidad Integral</Link>
                  </label>
                </div>
                {(errors.acceptTerminos || errors.acceptPrivacidad) && (
                  <p className="text-destructive text-xs">Debes aceptar ambos documentos para continuar.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Success */}
          {step === 8 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h1 className="font-headline text-3xl font-bold mb-3">¡Institución registrada!</h1>
              <p className="text-muted-foreground mb-2">Revisa el correo <strong className="text-foreground">{formData.adminEmail}</strong> para confirmar tu cuenta.</p>
              <p className="text-sm text-muted-foreground mb-8">Nuestro equipo revisará los datos y te notificará en menos de 24 horas.</p>
              <div className="space-y-3 max-w-xs mx-auto">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Ir al dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/clinica/equipo">Invitar a mi equipo</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 8 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => step === 1 ? router.push('/registro') : setStep((s) => s - 1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 1 ? 'Cambiar tipo' : 'Anterior'}
              </Button>
              {step < 7 ? (
                <Button onClick={nextStep} className="gap-2">
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear cuenta <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
