'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileShareQrProps {
  profileUrl: string;
}

export function ProfileQrCode({ profileUrl }: ProfileShareQrProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-border/40 p-1">
        <QRCodeSVG value={profileUrl} size={48} level="M" includeMargin={false} />
      </div>
      <span className="text-xs text-muted-foreground">Escanear</span>
    </div>
  );
}

export function ProfileShareButton({ profileUrl }: ProfileShareQrProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleShare() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast({ title: 'Copiado', description: 'Enlace del perfil copiado al portapapeles.' });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar.' });
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleShare} className="text-xs">
      <ExternalLink className="h-3 w-3 mr-1.5" />
      {copied ? '¡Copiado!' : 'Compartir perfil'}
    </Button>
  );
}
