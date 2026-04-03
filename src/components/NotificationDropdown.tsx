import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Diamond, MessageCircle, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const typeConfig: Record<AppNotification['type'], { icon: typeof Bell; colorClass: string }> = {
  credits: { icon: Diamond, colorClass: 'text-yellow-500' },
  unread: { icon: MessageCircle, colorClass: 'text-primary' },
  reminder: { icon: Clock, colorClass: 'text-blue-400' },
};

export function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-primary relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map(n => {
                  const config = typeConfig[n.type];
                  const Icon = config.icon;
                  const linkTo = n.modelId ? `/chat/${n.modelId}` : n.type === 'credits' ? '/dashboard/billing' : undefined;

                  const content = (
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/50",
                        !n.read && "bg-primary/5"
                      )}
                      onClick={() => {
                        markRead(n.id);
                        if (linkTo) setOpen(false);
                      }}
                    >
                      <div className={cn("mt-0.5 shrink-0", config.colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium", n.read ? "text-muted-foreground" : "text-foreground")}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  );

                  return linkTo ? (
                    <Link key={n.id} to={linkTo}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
