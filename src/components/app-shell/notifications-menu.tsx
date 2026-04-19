'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsMenu() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications');
      if (!r.ok) return;
      const data = await r.json();
      setItems(data.notifications ?? []);
      setUnread(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative cursor-pointer shrink-0"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] p-0"
              variant="destructive"
            >
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3">Sin notificaciones</p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-stretch gap-1 cursor-pointer p-3"
              onSelect={(e) => {
                if (!n.href) e.preventDefault();
              }}
            >
              {n.href ? (
                <Link
                  href={n.href}
                  className="w-full text-left"
                  onClick={() => {
                    if (!n.read_at) void markRead(n.id);
                  }}
                >
                  <span className="font-medium text-sm text-foreground block">{n.title}</span>
                  {n.body && (
                    <span className="text-xs text-muted-foreground block mt-0.5">{n.body}</span>
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => void markRead(n.id)}
                >
                  <span className="font-medium text-sm text-foreground block">{n.title}</span>
                  {n.body && (
                    <span className="text-xs text-muted-foreground block mt-0.5">{n.body}</span>
                  )}
                </button>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
