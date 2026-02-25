import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-accent animate-spin" />
    </div>
  );
}
