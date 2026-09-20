import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, PhoneCall, QrCode, Users } from "lucide-react";

import { useGym } from "@/lib/gym-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/red-list", label: "Red List", icon: PhoneCall },
  { to: "/check-in", label: "Check-in", icon: QrCode },
  { to: "/members", label: "Members", icon: Users },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { settings } = useGym();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-shell px-4 py-6 text-shell-foreground lg:flex">
        <div className="px-2">
          <p className="font-display text-2xl font-extrabold tracking-tight">
            IRON<span className="text-primary">FIT</span>
          </p>
          <p className="mt-1 text-xs leading-snug text-shell-muted">{settings.gymName}</p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-shell-muted transition-colors hover:bg-white/5 hover:text-shell-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="rounded-lg bg-white/5 px-3 py-3 text-xs text-shell-muted">
          <p className="font-semibold text-shell-foreground">Owner</p>
          <p className="mt-0.5">{settings.ownerPhone}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 px-4 py-3.5 backdrop-blur lg:px-8 lg:py-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold lg:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-muted-foreground lg:text-sm">{subtitle}</p>
              ) : null}
            </div>
            <span className="font-display text-sm font-extrabold tracking-tight lg:hidden">
              IRON<span className="text-primary">FIT</span>
            </span>
          </div>
        </header>

        <main className="px-4 pb-28 pt-4 lg:px-8 lg:pb-12 lg:pt-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
