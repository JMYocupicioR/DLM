// Trust level logic - centralized access control
import type { TrustLevel } from '@/types/database';

export interface TrustConfig {
  level: TrustLevel;
  label: string;
  description: string;
  canUseTrial: boolean;
  canPrescribe: boolean;
  canExportData: boolean;
  canRequestCFDI: boolean;
  canHavePublicProfile: boolean;
  badgeText: string | null;
  badgeVariant: 'default' | 'outline' | 'secondary' | 'destructive';
  alertMessage: string | null;
}

export const TRUST_CONFIGS: Record<TrustLevel, TrustConfig> = {
  0: {
    level: 0,
    label: 'Sin verificar',
    description: 'Confirma tu correo electrónico para activar tu cuenta',
    canUseTrial: false,
    canPrescribe: false,
    canExportData: false,
    canRequestCFDI: false,
    canHavePublicProfile: false,
    badgeText: 'Sin verificar',
    badgeVariant: 'destructive',
    alertMessage: 'Confirma tu correo electrónico para activar tu cuenta y comenzar el período de prueba.',
  },
  1: {
    level: 1,
    label: 'Email confirmado',
    description: 'Acceso de prueba activo. Completa tu perfil para acceso completo.',
    canUseTrial: true,
    canPrescribe: false,
    canExportData: false,
    canRequestCFDI: false,
    canHavePublicProfile: false,
    badgeText: 'Trial activo',
    badgeVariant: 'secondary',
    alertMessage: 'Completa tu perfil y sube tu cédula para desbloquear todas las funciones clínicas.',
  },
  2: {
    level: 2,
    label: 'Verificación en proceso',
    description: 'Tus documentos están siendo revisados por el equipo DeepLux',
    canUseTrial: true,
    canPrescribe: false,
    canExportData: false,
    canRequestCFDI: false,
    canHavePublicProfile: true, // without badge
    badgeText: 'En revisión',
    badgeVariant: 'outline',
    alertMessage: 'Tus documentos están en revisión. Te notificaremos cuando estén verificados (1-2 días hábiles).',
  },
  3: {
    level: 3,
    label: 'Verificado',
    description: 'Perfil profesional verificado por DeepLux',
    canUseTrial: true,
    canPrescribe: true,
    canExportData: true,
    canRequestCFDI: true,
    canHavePublicProfile: true,
    badgeText: 'Verificado ✓',
    badgeVariant: 'default',
    alertMessage: null,
  },
};

export function getTrustConfig(level: TrustLevel): TrustConfig {
  return TRUST_CONFIGS[level];
}

export function canPerformAction(
  trustLevel: TrustLevel,
  action: 'prescribe' | 'export_data' | 'issue_cfdi' | 'public_profile' | 'use_trial'
): boolean {
  const config = getTrustConfig(trustLevel);
  switch (action) {
    case 'prescribe': return config.canPrescribe;
    case 'export_data': return config.canExportData;
    case 'issue_cfdi': return config.canRequestCFDI;
    case 'public_profile': return config.canHavePublicProfile;
    case 'use_trial': return config.canUseTrial;
    default: return false;
  }
}

export function getNextTrustAction(trustLevel: TrustLevel): {
  label: string;
  description: string;
  href: string;
} | null {
  switch (trustLevel) {
    case 0:
      return { label: 'Confirmar correo', description: 'Revisa tu bandeja de entrada', href: '/perfil' };
    case 1:
      return { label: 'Subir cédula profesional', description: 'Desbloquea funciones clínicas completas', href: '/perfil#cedula' };
    case 2:
      return null; // Waiting for staff review
    case 3:
      return null; // Fully verified
  }
}
