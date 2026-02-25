'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MX_STATES, SPECIALTIES } from '@/lib/constants';
import { updateProfile, type ProfileFormState } from './actions';
import type { ProfessionalProfile } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  profile: ProfessionalProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(updateProfile, {});

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-500">
          Perfil actualizado correctamente.
        </div>
      )}

      {/* Cédula */}
      <section id="cedula" className="scroll-mt-24">
        <h2 className="font-headline text-lg font-semibold mb-4">Datos de cédula</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cedula_profesional">Cédula profesional (SEP)</Label>
            <Input
              id="cedula_profesional"
              name="cedula_profesional"
              placeholder="1234567 (7-8 dígitos)"
              defaultValue={profile?.cedula_profesional ?? ''}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cedula_especialidad">Cédula de especialidad (opcional)</Label>
            <Input
              id="cedula_especialidad"
              name="cedula_especialidad"
              placeholder="Número de cédula de especialidad"
              defaultValue={profile?.cedula_especialidad ?? ''}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
            />
          </div>
        </div>
      </section>

      {/* Profesional */}
      <section id="profesional" className="scroll-mt-24">
        <h2 className="font-headline text-lg font-semibold mb-4">Datos profesionales</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <select
              id="specialty"
              name="specialty"
              defaultValue={profile?.specialty ?? ''}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
            >
              <option value="">Selecciona tu especialidad</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subspecialty">Subespecialidad</Label>
            <Input
              id="subspecialty"
              name="subspecialty"
              placeholder="Ej. Cardiología intervencionista"
              defaultValue={profile?.subspecialty ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution_affiliation">Institución / Hospital de adscripción</Label>
            <Input
              id="institution_affiliation"
              name="institution_affiliation"
              placeholder="IMSS, ISSSTE, Hospital ABC..."
              defaultValue={profile?.institution_affiliation ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_year">Año de egreso</Label>
            <Input
              id="graduation_year"
              name="graduation_year"
              type="number"
              placeholder="2018"
              min={1970}
              max={new Date().getFullYear()}
              defaultValue={profile?.graduation_year ?? ''}
            />
          </div>
        </div>
      </section>

      {/* Fiscal */}
      <section id="fiscal" className="scroll-mt-24">
        <h2 className="font-headline text-lg font-semibold mb-4">Datos fiscales</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              name="rfc"
              placeholder="GALJ880101ABC"
              defaultValue={profile?.rfc ?? ''}
              maxLength={13}
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              name="curp"
              placeholder="CURP de 18 caracteres"
              defaultValue={profile?.curp ?? ''}
              maxLength={18}
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region_code">Estado donde ejerces</Label>
            <select
              id="region_code"
              name="region_code"
              defaultValue={profile?.region_code ?? ''}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
            >
              <option value="">Selecciona tu estado</option>
              {MX_STATES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Perfil público */}
      <section id="publico" className="scroll-mt-24">
        <h2 className="font-headline text-lg font-semibold mb-1">Perfil público</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tu perfil público es visible para pacientes y colegas. Requiere trust level 2 o superior para aparecer en el directorio.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía profesional</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Describe brevemente tu trayectoria, especialidad y enfoque clínico..."
              defaultValue={profile?.bio ?? ''}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_photo_url">URL de foto de perfil</Label>
            <Input
              id="profile_photo_url"
              name="profile_photo_url"
              type="url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
              defaultValue={profile?.profile_photo_url ?? ''}
            />
            <p className="text-xs text-muted-foreground">Pega la URL de tu foto profesional. Soporte para carga directa próximamente.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="public_profile_slug">URL de tu perfil público</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">deeplux.org/dr/</span>
              <Input
                id="public_profile_slug"
                name="public_profile_slug"
                placeholder="tu-nombre"
                defaultValue={profile?.public_profile_slug ?? ''}
                className="lowercase"
              />
            </div>
            <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones. Sin espacios.</p>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <input
              id="is_public_profile"
              name="is_public_profile"
              type="checkbox"
              defaultChecked={profile?.is_public_profile ?? false}
              className="h-4 w-4 rounded border border-input accent-primary cursor-pointer"
            />
            <div>
              <Label htmlFor="is_public_profile" className="cursor-pointer">Activar perfil público</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Al activarlo, tu perfil será visible en el directorio público de DeepLux una vez que tu cédula sea verificada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </Button>
  );
}
