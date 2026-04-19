'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CfdiRequestButtonProps {
  invoiceId: string;
}

export function CfdiRequestButton({ invoiceId }: CfdiRequestButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cfdi/request?invoice=${invoiceId}`);
      if (res.redirected || res.ok) {
        router.push(res.url || '/facturacion');
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 501 && data.code === 'CFDI_COMING_SOON') {
        toast({
          title: 'Próximamente',
          description: 'La solicitud de facturas CFDI estará disponible pronto. Agrega tu RFC en tu perfil para cuando se active.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error ?? 'No se pudo procesar la solicitud.',
        });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs h-8"
      onClick={handleRequest}
      disabled={loading}
    >
      {loading ? '...' : 'Facturar'}
    </Button>
  );
}
