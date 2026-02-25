import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield, MapPin, Building, GraduationCap, Stethoscope,
  Award, Calendar
} from 'lucide-react';
import { ProfileQrCode, ProfileShareButton } from './profile-share-qr';
import { getInitials } from '@/lib/utils';
import { TRUST_LEVEL_LABELS, USER_TYPE_LABELS } from '@/lib/constants';
import type { TrustLevel } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      ),
      user_types:user_type_id (
        label_es
      )
    `)
    .eq('public_profile_slug', slug)
    .eq('is_public_profile', true)
    .single();

  if (!profile || profile.trust_level < 2) {
    notFound();
  }

  const fullProfile = profile as typeof profile & {
    profiles: { full_name: string; email: string } | null;
    user_types: { label_es: string } | null;
  };

  const name = fullProfile.profiles?.full_name ?? 'Dr./Dra.';
  const userTypeLabel = fullProfile.user_types?.label_es ?? 'Profesional de la Salud';
  const trustLevel = (profile.trust_level ?? 1) as TrustLevel;
  const isVerified = trustLevel === 3;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deeplux.com';
  const profileUrl = `${baseUrl}/dr/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-accent" />
            <span className="font-headline text-lg font-bold">DeepLux</span>
          </a>
          <p className="text-xs text-muted-foreground">Perfil Profesional Verificado</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Profile Card */}
        <Card className="bg-card border-border/60 overflow-hidden">
          {/* Gradient header */}
          <div className="h-24 bg-gradient-to-r from-primary/40 to-accent/20" />

          <CardContent className="px-6 pb-6">
            {/* Avatar + Verification Badge */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                {profile.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profile_photo_url}
                    alt={name}
                    className="w-20 h-20 rounded-full border-4 border-card object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-card bg-primary/20 flex items-center justify-center">
                    <span className="font-headline text-2xl font-bold text-accent">{getInitials(name)}</span>
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-card" title="Cédula verificada por DeepLux">
                    <Shield className="h-3 w-3 text-accent-foreground" />
                  </div>
                )}
              </div>

              <ProfileQrCode profileUrl={profileUrl} />
            </div>

            {/* Name + Type */}
            <div className="mb-1">
              <h1 className="font-headline text-2xl font-bold text-foreground">{name}</h1>
              <p className="text-accent font-medium">{userTypeLabel}</p>
            </div>

            {/* Verification status */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {isVerified ? (
                <Badge className="bg-accent/20 text-accent border-accent/40">
                  <Shield className="h-3 w-3 mr-1" />
                  Cédula Verificada por DeepLux
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Verificación en proceso
                </Badge>
              )}
              {profile.conacem_certified && (
                <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
                  <Award className="h-3 w-3 mr-1" />
                  Certificado CONACEM
                </Badge>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-muted-foreground text-sm mb-4">{profile.bio}</p>
            )}

            <Separator className="my-4" />

            {/* Professional details */}
            <div className="space-y-3">
              {profile.specialty && (
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-4 w-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile.specialty}</p>
                    {profile.subspecialty && (
                      <p className="text-xs text-muted-foreground">{profile.subspecialty}</p>
                    )}
                  </div>
                </div>
              )}

              {profile.institution_affiliation && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-accent flex-shrink-0" />
                  <p className="text-sm text-foreground">{profile.institution_affiliation}</p>
                </div>
              )}

              {profile.region_code && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                  <p className="text-sm text-foreground">México · {profile.region_code}</p>
                </div>
              )}

              {profile.graduation_year && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-accent flex-shrink-0" />
                  <p className="text-sm text-foreground">Egresado en {profile.graduation_year}</p>
                </div>
              )}

              {profile.cedula_profesional && isVerified && (
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">Cédula Profesional</p>
                    <p className="text-xs text-muted-foreground font-mono">{profile.cedula_profesional}</p>
                  </div>
                </div>
              )}

              {profile.trust_level !== undefined && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Estado: {TRUST_LEVEL_LABELS[profile.trust_level as TrustLevel]}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Share + DeepLux branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">Verificado por <strong className="text-accent">DeepLux</strong></span>
              </div>
              <ProfileShareButton profileUrl={profileUrl} />
            </div>
          </CardContent>
        </Card>

        {/* CTA for visitors */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            ¿Eres profesional de la salud? Crea tu perfil verificado en DeepLux.
          </p>
          <Button variant="outline" asChild>
            <a href="/registro">Crear mi perfil gratis</a>
          </Button>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('profiles:user_id(full_name), specialty')
    .eq('public_profile_slug', slug)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileAny = profile as any;
  const name = profileAny?.profiles?.full_name ?? 'Profesional de la Salud';
  const specialty = profileAny?.specialty;

  return {
    title: `${name}${specialty ? ` - ${specialty}` : ''} | DeepLux`,
    description: `Perfil profesional verificado de ${name} en DeepLux. Identidad médica certificada.`,
  };
}
