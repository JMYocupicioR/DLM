'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MX_STATES, SPECIALTIES } from '@/lib/constants';
import {
  updateProfileSection,
  uploadProfilePhoto,
  type ProfileFormState,
} from './actions';
import type { ProfessionalProfile } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  profile: ProfessionalProfile | null;
  publicSlug: string | null;
}

export function ProfileForm({ profile, publicSlug }: ProfileFormProps) {
  return (
    <Tabs defaultValue="identidad" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto flex-wrap gap-1 bg-muted/50 p-1">
        <TabsTrigger value="identidad" className="cursor-pointer text-xs sm:text-sm">
          Identidad
        </TabsTrigger>
        <TabsTrigger value="cedula" className="cursor-pointer text-xs sm:text-sm">
          Cédula
        </TabsTrigger>
        <TabsTrigger value="profesional" className="cursor-pointer text-xs sm:text-sm">
          Profesional
        </TabsTrigger>
        <TabsTrigger value="fiscal" className="cursor-pointer text-xs sm:text-sm">
          Fiscal
        </TabsTrigger>
        <TabsTrigger value="publico" className="cursor-pointer text-xs sm:text-sm">
          Público
        </TabsTrigger>
      </TabsList>

      <TabsContent value="identidad" className="mt-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Tu correo y contraseña se administran desde el inicio de sesión. Si necesitas cambiar la
          contraseña, usa &quot;¿Olvidaste tu contraseña?&quot; en la pantalla de login.
        </p>
        <div className="rounded-lg border border-border/60 p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sesión</p>
          <p className="text-sm font-medium">Cuenta verificada para uso clínico</p>
        </div>
      </TabsContent>

      <TabsContent value="cedula" className="mt-6">
        <SectionForm section="cedula" title="Datos de cédula">
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
        </SectionForm>
      </TabsContent>

      <TabsContent value="profesional" className="mt-6">
        <SectionForm section="profesional" title="Datos profesionales">
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
                  <option key={s} value={s}>
                    {s}
                  </option>
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
        </SectionForm>
      </TabsContent>

      <TabsContent value="fiscal" className="mt-6">
        <SectionForm section="fiscal" title="Datos fiscales">
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
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionForm>
      </TabsContent>

      <TabsContent value="publico" className="mt-6 space-y-8">
        <SectionForm section="publico" title="Perfil público">
          <p className="text-sm text-muted-foreground mb-4">
            Visible cuando actives la opción y alcances el nivel de confianza requerido.
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
              <Label htmlFor="profile_photo_url">URL de foto (opcional)</Label>
              <Input
                id="profile_photo_url"
                name="profile_photo_url"
                type="url"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                defaultValue={profile?.profile_photo_url ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_profile_slug">URL de tu perfil público</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/dr/</span>
                <Input
                  id="public_profile_slug"
                  name="public_profile_slug"
                  placeholder="tu-nombre"
                  defaultValue={profile?.public_profile_slug ?? ''}
                  className="lowercase flex-1 min-w-[120px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Solo letras minúsculas, números y guiones.
              </p>
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
                <Label htmlFor="is_public_profile" className="cursor-pointer">
                  Activar perfil público
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Requiere verificación de cédula para aparecer en el directorio.
                </p>
              </div>
            </div>
          </div>
        </SectionForm>

        <div className="space-y-2">
          <Label>Foto de perfil (archivo)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            JPG, PNG o WebP, máx. 2 MB. Se guarda en tu carpeta segura.
          </p>
          <PhotoUploadForm />
        </div>

        {publicSlug && (
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <iframe
              title="Vista previa perfil público"
              src={`/dr/${publicSlug}`}
              className="w-full min-h-[360px] rounded-lg border border-border bg-background"
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function SectionForm({
  section,
  title,
  children,
}: {
  section: 'cedula' | 'profesional' | 'fiscal' | 'publico';
  title: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(updateProfileSection, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="section" value={section} />
      <h2 className="font-headline text-lg font-semibold">{title}</h2>
      {state.error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Guardado correctamente.
        </div>
      )}
      {children}
      <SubmitButton label={`Guardar ${title.toLowerCase()}`} />
    </form>
  );
}

function PhotoUploadForm() {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(uploadProfilePhoto, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      {state.error && (
        <p className="text-xs text-destructive w-full">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-600 dark:text-green-400 w-full">Foto actualizada.</p>
      )}
      <Input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="max-w-xs cursor-pointer" />
      <PhotoSubmit />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="cursor-pointer">
      {pending ? 'Guardando...' : label}
    </Button>
  );
}

function PhotoSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending} className="cursor-pointer">
      {pending ? 'Subiendo...' : 'Subir'}
    </Button>
  );
}
