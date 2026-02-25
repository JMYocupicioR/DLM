'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { approveLicenseVerification, rejectLicenseVerification } from './actions';
import { useToast } from '@/hooks/use-toast';

interface VerificationActionsProps {
  verificationId: string;
}

export function VerificationActions({ verificationId }: VerificationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveLicenseVerification(verificationId);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Aprobado', description: 'La verificación ha sido aprobada correctamente.' });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectLicenseVerification(verificationId);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ variant: 'destructive', title: 'Rechazado', description: 'La verificación ha sido rechazada.' });
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-green-400 border-green-400/30 hover:bg-green-400/10"
        onClick={handleApprove}
        disabled={isPending}
      >
        Aprobar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10"
        onClick={handleReject}
        disabled={isPending}
      >
        Rechazar
      </Button>
    </div>
  );
}
