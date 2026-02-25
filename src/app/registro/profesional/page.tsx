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
import { useToast } from '@/hooks/use-toast';
import { MX_STATES, SPECIALTIES } from '@/lib/constants';
import {
  Stethoscope, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  GraduationCap, FlaskConical, Heart, Brain, UserCheck, Dumbbell, User
} from 'lucide-react';
import { cn, validateCURP, validateRFC, validateCedula } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { logComplianceAcceptance } from '../actions';
import { createProfessionalProfileFromOnboarding } from '../create-profile';

const TOTAL_STEPS = 6;

const userTypes = [
  { slug: 'specialist', label: 'Especialista Médico', icon: Heart, description: 'Cardiólogo, neurólogo, cirujano y otras especialidades' },
  { slug: 'general_physician', label: 'Médico General / Internista', icon: Stethoscope, description: 'Médico de primer contacto o medicina interna' },
  { slug: 'resident', label: 'Médico Residente', icon: UserCheck, description: 'En formación especializada en hospital sede' },
  { slug: 'intern', label: 'Pasante de Servicio Social', icon: GraduationCap, description: 'Prestando servicio social en unidad asignada' },
  { slug: 'student', label: 'Estudiante de Medicina', icon: Brain, description: 'Cursando la licenciatura en medicina' },
  { slug: 'researcher', label: 'Investigador', icon: FlaskConical, description: 'Investigación clínica o básica en institución' },
  { slug: 'physiotherapist', label: 'Fisioterapeuta / Rehabilitador', icon: Dumbbell, description: 'Rehabilitación física y terapia ocupacional' },
  { slug: 'other', label: 'Otro Profesional de la Salud', icon: User, description: 'Psicólogo, nutriólogo, enfermero y otros' },
];

const plans = [
  { slug: 'libre', name: 'Libre', priceMXN: 0, description: 'Solo para estudiantes y pasantes', forTypes: ['student', 'intern'] },
  { slug: 'profesional-basico', name: 'Profesional Básico', priceMXN: 299, description: 'Expediente + Escalas', forTypes: ['general_physician', 'resident', 'intern', 'physiotherapist', 'other'] },
  { slug: 'suite-medica', name: 'Suite Médica', priceMXN: 599, description: 'Todas las apps', forTypes: ['specialist', 'general_physician', 'resident', 'physiotherapist', 'other'] },
  { slug: 'investigador', name: 'Investigador', priceMXN: 399, description: 'Suite + exportación de datos', forTypes: ['researcher'] },
];

interface FormData {
  userTypeSlug: string;
  email: string;
  password: string;
  fullName: string;
  curp: string;
  rfc: string;
  cedulaProfesional: string;
  cedulaEspecialidad: string;
  specialty: string;
  subspecialty: string;
  institutionAffiliation: string;
  regionCode: string;
  graduationYear: string;
  professionalStage: string;
  planSlug: string;
  acceptTerminos: boolean;
  acceptPrivacidad: boolean;
}

const initialData: FormData = {
  userTypeSlug: '',
  email: '',
  password: '',
  fullName: '',
  curp: '',
  rfc: '',
  cedulaProfesional: '',
  cedulaEspecialidad: '',
  specialty: '',
  subspecialty: '',
  institutionAffiliation: '',
  regionCode: '',
  graduationYear: '',
  professionalStage: '',
  planSlug: '',
  acceptTerminos: false,
  acceptPrivacidad: false,
};

export default function RegistroProfesionalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const selectedUserType = userTypes.find((t) => t.slug === formData.userTypeSlug);
  const needsCedula = ['specialist', 'general_physician', 'resident', 'researcher', 'physiotherapist'].includes(formData.userTypeSlug);
  const needsSpecialty = ['specialist', 'resident'].includes(formData.userTypeSlug);
  const isStudentOrIntern = ['student', 'intern'].includes(formData.userTypeSlug);

  const availablePlans = plans.filter(
    (p) => p.forTypes.includes(formData.userTypeSlug) || formData.userTypeSlug === ''
  );

  function validateStep(s: number): boolean {
    const errs: Partial<FormData> = {};
    if (s === 1 && !formData.userTypeSlug) errs.userTypeSlug = 'Selecciona tu tipo de profesional';
    if (s === 2) {
      if (!formData.fullName.trim()) errs.fullName = 'Nombre requerido';
      if (!formData.email.trim()) errs.email = 'Correo requerido';
      if (!formData.password || formData.password.length < 8) errs.password = 'Mínimo 8 caracteres';
      if (formData.curp && !validateCURP(formData.curp)) errs.curp = 'Formato de CURP inválido';
      if (formData.rfc && !validateRFC(formData.rfc)) errs.rfc = 'Formato de RFC inválido';
    }
    if (s === 3 && needsCedula) {
      if (!formData.cedulaProfesional.trim()) errs.cedulaProfesional = 'Cédula profesional requerida';
      if (formData.cedulaProfesional && !validateCedula(formData.cedulaProfesional)) {
        errs.cedulaProfesional = 'La cédula debe tener 7-8 dígitos';
      }
    }
    if (s === 5) {
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
    if (!validateStep(5)) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.userTypeSlug,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        // Save onboarding session for resuming if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)('onboarding_sessions').upsert({
          user_id: data.user.id,
          user_type: 'professional',
          current_step: 5,
          total_steps: TOTAL_STEPS,
          completed_steps: [1, 2, 3, 4, 5],
          selected_user_type_slug: formData.userTypeSlug,
          selected_plan_slug: formData.planSlug,
          form_data: formData,
          completed_at: new Date().toISOString(),
        });
        // Log compliance (non-blocking)
        await Promise.all([
          logComplianceAcceptance(data.user.id, 'terminos'),
          logComplianceAcceptance(data.user.id, 'privacidad'),
        ]).catch(() => {});

        // Create professional_profile from form data
        await createProfessionalProfileFromOnboarding(data.user.id, {
          fullName: formData.fullName,
          userTypeSlug: formData.userTypeSlug,
          curp: formData.curp,
          rfc: formData.rfc,
          cedulaProfesional: formData.cedulaProfesional,
          cedulaEspecialidad: formData.cedulaEspecialidad,
          specialty: formData.specialty,
          subspecialty: formData.subspecialty,
          institutionAffiliation: formData.institutionAffiliation,
          regionCode: formData.regionCode,
          graduationYear: formData.graduationYear,
          professionalStage: formData.professionalStage,
        }).catch(() => {});

        // Checkout: free plan creates subscription via API; paid plan redirects to Stripe
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
        if (checkoutData.redirect && formData.planSlug === 'libre') {
          router.push(checkoutData.redirect);
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
    'Tipo de profesional',
    'Datos personales',
    'Credenciales',
    'Formación y afiliación',
    'Elige tu plan',
    '¡Listo!',
  ];

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
                  className={cn('text-xs hidden sm:block', i + 1 === step ? 'text-accent font-medium' : 'text-muted-foreground')}
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

          {/* Step 1: User Type */}
          {step === 1 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">¿Cómo ejerces la medicina?</h1>
              <p className="text-muted-foreground mb-6">Esto personaliza tu registro y las herramientas disponibles para ti.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.userTypeSlug === type.slug;
                  return (
                    <button
                      key={type.slug}
                      type="button"
                      onClick={() => update('userTypeSlug', type.slug)}
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
                      <div>
                        <p className="font-medium text-sm text-foreground">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-accent ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.userTypeSlug && <p className="text-destructive text-sm mt-2">{errors.userTypeSlug}</p>}
            </div>
          )}

          {/* Step 2: Personal Data */}
          {step === 2 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Datos personales</h1>
              <p className="text-muted-foreground mb-6">Esta información es privada y segura.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo *</Label>
                  <Input id="fullName" placeholder="Dr. Juan García López" value={formData.fullName} onChange={(e) => update('fullName', e.target.value)} />
                  {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input id="email" type="email" placeholder="dr.garcia@hospital.com" value={formData.email} onChange={(e) => update('email', e.target.value)} />
                  {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={(e) => update('password', e.target.value)} />
                  {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="curp">CURP <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input id="curp" placeholder="GARL880101HDFRPZ09" value={formData.curp} onChange={(e) => update('curp', e.target.value.toUpperCase())} maxLength={18} />
                    {errors.curp && <p className="text-destructive text-xs">{errors.curp}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC <span className="text-muted-foreground text-xs">(para facturas)</span></Label>
                    <Input id="rfc" placeholder="GALJ880101ABC" value={formData.rfc} onChange={(e) => update('rfc', e.target.value.toUpperCase())} maxLength={13} />
                    {errors.rfc && <p className="text-destructive text-xs">{errors.rfc}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Credentials */}
          {step === 3 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Credenciales profesionales</h1>
              <p className="text-muted-foreground mb-6">
                {needsCedula
                  ? 'Tu cédula será verificada para otorgarte acceso completo a las herramientas clínicas.'
                  : 'Completa esta información para personalizar tu experiencia.'}
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">
                    Cédula profesional {needsCedula ? '*' : ''}
                    <span className="text-muted-foreground text-xs ml-1">(Dirección General de Profesiones, SEP)</span>
                  </Label>
                  <Input
                    id="cedula"
                    placeholder="1234567 (7-8 dígitos)"
                    value={formData.cedulaProfesional}
                    onChange={(e) => update('cedulaProfesional', e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                  />
                  {errors.cedulaProfesional && <p className="text-destructive text-xs">{errors.cedulaProfesional}</p>}
                </div>
                {needsSpecialty && (
                  <div className="space-y-2">
                    <Label htmlFor="cedulaEspecialidad">Cédula de especialidad <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input
                      id="cedulaEspecialidad"
                      placeholder="Número de cédula de especialidad"
                      value={formData.cedulaEspecialidad}
                      onChange={(e) => update('cedulaEspecialidad', e.target.value.replace(/\D/g, ''))}
                      maxLength={8}
                    />
                  </div>
                )}
                {formData.userTypeSlug === 'resident' && (
                  <div className="space-y-2">
                    <Label htmlFor="stage">Año y hospital de residencia</Label>
                    <Input
                      id="stage"
                      placeholder="2do año - Hospital General de México"
                      value={formData.professionalStage}
                      onChange={(e) => update('professionalStage', e.target.value)}
                    />
                  </div>
                )}
                {isStudentOrIntern && (
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                    <p className="text-sm text-foreground/80">
                      <strong>Plan Libre incluido:</strong> Como {selectedUserType?.label.toLowerCase()}, tendrás acceso gratuito a EscalasDLM. Podrás actualizar tu plan cuando obtengas tu cédula profesional.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Formation & Affiliation */}
          {step === 4 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Formación y afiliación</h1>
              <p className="text-muted-foreground mb-6">Esto personaliza tus herramientas según tu contexto clínico.</p>
              <div className="space-y-4">
                {needsSpecialty && (
                  <div className="space-y-2">
                    <Label>Especialidad principal *</Label>
                    <Select onValueChange={(v) => update('specialty', v)} value={formData.specialty}>
                      <SelectTrigger><SelectValue placeholder="Selecciona tu especialidad" /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="institution">Institución / Hospital de adscripción</Label>
                  <Input
                    id="institution"
                    placeholder="IMSS, ISSSTE, Hospital ABC, Privado..."
                    value={formData.institutionAffiliation}
                    onChange={(e) => update('institutionAffiliation', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado donde ejerces</Label>
                  <Select onValueChange={(v) => update('regionCode', v)} value={formData.regionCode}>
                    <SelectTrigger><SelectValue placeholder="Selecciona tu estado" /></SelectTrigger>
                    <SelectContent>
                      {MX_STATES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation">Año de egreso</Label>
                  <Input
                    id="graduation"
                    type="number"
                    placeholder="2018"
                    min={1970}
                    max={new Date().getFullYear()}
                    value={formData.graduationYear}
                    onChange={(e) => update('graduationYear', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Choose Plan */}
          {step === 5 && (
            <div>
              <h1 className="font-headline text-2xl font-bold text-foreground mb-2">Elige tu plan</h1>
              <p className="text-muted-foreground mb-6">14 días de prueba gratis. Sin tarjeta de crédito requerida.</p>
              <div className="space-y-3">
                {availablePlans.map((plan) => {
                  const isSelected = formData.planSlug === plan.slug;
                  return (
                    <button
                      key={plan.slug}
                      type="button"
                      onClick={() => update('planSlug', plan.slug)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all',
                        isSelected ? 'border-accent bg-accent/10' : 'border-border/60 bg-card hover:border-accent/50'
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          {plan.slug === 'libre' && <Badge variant="outline" className="text-xs">Gratis</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        {plan.priceMXN === 0 ? (
                          <span className="font-bold text-accent text-lg">$0</span>
                        ) : (
                          <div>
                            <span className="font-bold text-foreground text-xl">${plan.priceMXN}</span>
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
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Podrás cambiar o cancelar tu plan en cualquier momento.
              </p>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h1 className="font-headline text-3xl font-bold text-foreground mb-3">¡Cuenta creada!</h1>
              <p className="text-muted-foreground mb-2">Revisa tu correo <strong className="text-foreground">{formData.email}</strong> para confirmar tu cuenta.</p>
              <p className="text-sm text-muted-foreground mb-8">Confirmar tu email activa tu prueba gratuita de 14 días.</p>
              <div className="space-y-3 max-w-xs mx-auto">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Ir al dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/perfil">Completar mi perfil</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
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
