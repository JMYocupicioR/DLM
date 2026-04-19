'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { approveLicenseVerification, rejectLicenseVerification } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface VerificationActionsProps {
  verificationId: string;
}

export function VerificationActions({ verificationId }: VerificationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Motivo requerido',
        description: 'Escribe al menos 3 caracteres explicando el rechazo.',
      });
      return;
    }
    startTransition(async () => {
      const result = await rejectLicenseVerification(verificationId, reason);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ variant: 'destructive', title: 'Rechazado', description: 'La verificación ha sido rechazada.' });
        setRejectOpen(false);
        setRejectReason('');
      }
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs text-green-600 border-green-600/30 hover:bg-green-500/10 dark:text-green-400 dark:border-green-400/30 cursor-pointer"
            disabled={isPending}
          >
            Aprobar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar verificación?</AlertDialogTitle>
            <AlertDialogDescription>
              El profesional pasará a nivel de confianza verificado y podrá usar funciones que lo requieran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
              disabled={isPending}
              onClick={() => handleApprove()}
            >
              Confirmar aprobación
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs text-red-600 border-red-600/30 hover:bg-red-500/10 dark:text-red-400 dark:border-red-400/30 cursor-pointer"
        disabled={isPending}
        onClick={() => setRejectOpen(true)}
      >
        Rechazar
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar verificación</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor={`reject-${verificationId}`}>Motivo (obligatorio)</Label>
            <Textarea
              id={`reject-${verificationId}`}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej. Cédula ilegible, número no coincide con SEP…"
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              disabled={isPending}
              onClick={() => handleReject()}
            >
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
