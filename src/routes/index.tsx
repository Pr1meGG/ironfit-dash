import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, IndianRupee, PhoneCall, Users2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge, Card, MembershipBadge, inr } from "@/components/ui-bits";
import { formatDate, useDashboardStats, useGym } from "@/lib/gym-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — IronFit" },
      {
        name: "description",
        content:
          "Daily check-ins, active members, expiring memberships, pending payments and the retention red list for IronFit Fitness Studio.",
      },
      { property: "og:title", content: "Owner Dashboard — IronFit" },
      {
        property: "og:description",
        content: "Gym ownership and member-retention dashboard: check-ins, renewals, dues and follow-ups.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon: typeof Users2;
}) {
  const accents = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning-foreground",
    danger: "text-danger",
  } as const;

  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="stat-label">{label}</p>
        <Icon className={`size-4 shrink-0 ${accents[tone]}`} />
      </div>
      <p className={`mt-2 font-display text-3xl font-extrabold ${accents[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Dashboard() {
  const { rows, today, settings } = useGym();
  const stats = useDashboardStats();

  const checkedInToday = rows.filter((r) => r.visits.some((v) => v.date === today));
  const expiring = rows
    .filter((r) => r.membershipState === "expiring")
    .sort((a, b) => (a.daysToExpiry ?? 0) - (b.daysToExpiry ?? 0));
  const pending = rows.filter((r) => r.pendingPayments.length > 0);

  return (
    <AppShell title="Owner Dashboard" subtitle={`${settings.gymName} · ${formatDate(today)}`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Check-ins today" value={stats.checkInsToday} icon={Users2} />
        <Stat label="Active members" value={stats.activeMembers} tone="success" icon={Users2} />
        <Stat
          label="Expiring ≤7 days"
          value={stats.expiringSoon}
          tone="warning"
          hint={`Reminder window: ${stats.renewalReminderDays} days`}
          icon={CalendarClock}
        />
        <Stat
          label="Pending payments"
          value={stats.pendingPaymentCount}
          hint={inr(stats.pendingPaymentAmount) + " due"}
          tone="warning"
          icon={IndianRupee}
        />
        <Stat
          label="Red list"
          value={stats.redListCount}
          tone="danger"
          hint={`No check-in ${stats.inactivityTriggerDays}+ days`}
          icon={AlertTriangle}
        />
      </div>

      {stats.redListCount > 0 ? (
        <Link
          to="/red-list"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-danger">
            <PhoneCall className="size-4" />
            {stats.redListCount} member{stats.redListCount > 1 ? "s" : ""} need a follow-up call
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-danger">Open queue</span>
        </Link>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Checked in today">
          {checkedInToday.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No check-ins recorded yet today.</p>
          ) : (
            <ul className="divide-y divide-border">
              {checkedInToday.map((r) => (
                <li key={r.member.id} className="flex items-center justify-between py-2.5">
                  <Link
                    to="/members/$id"
                    params={{ id: r.member.id }}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {r.member.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {r.visits.find((v) => v.date === today)?.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Expiring within 7 days">
          {expiring.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No renewals due this week.</p>
          ) : (
            <ul className="divide-y divide-border">
              {expiring.map((r) => (
                <li key={r.member.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <Link
                      to="/members/$id"
                      params={{ id: r.member.id }}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {r.member.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {r.plan?.name} · ends {formatDate(r.membership?.expiryDate)}
                    </p>
                  </div>
                  <MembershipBadge row={r} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Pending payments">
          {pending.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">All dues collected.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((r) => (
                <li key={r.member.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <Link
                      to="/members/$id"
                      params={{ id: r.member.id }}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {r.member.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {r.plan?.name} · due {formatDate(r.pendingPayments[0]?.paidOn)}
                    </p>
                  </div>
                  <Badge tone="warning">
                    {inr(r.pendingPayments.reduce((s, p) => s + p.amount, 0))}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
