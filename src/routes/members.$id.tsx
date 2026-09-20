import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge, Card, EmptyNote, MembershipBadge, inr } from "@/components/ui-bits";
import { formatDate, useGym, type MemberRow } from "@/lib/gym-store";

export const Route = createFileRoute("/members/$id")({
  head: () => ({
    meta: [
      { title: "Member Detail — IronFit" },
      {
        name: "description",
        content:
          "Full member record: plan, membership dates, freeze days, visit history, follow-up history and payments.",
      },
      { property: "og:title", content: "Member Detail — IronFit" },
      {
        property: "og:description",
        content: "One member, one page: attendance, retention calls and payment status.",
      },
    ],
  }),
  component: MemberDetail,
});

const tabs = ["Overview", "Visits", "Follow-ups", "Payments"] as const;
type Tab = (typeof tabs)[number];

function Overview({ row }: { row: MemberRow }) {
  const items: Array<[string, string]> = [
    ["Plan", row.plan ? `${row.plan.name} · ${inr(row.plan.price)}` : "—"],
    ["Membership ID", row.membership?.id ?? "—"],
    ["Start date", formatDate(row.membership?.startDate)],
    ["End date", formatDate(row.membership?.expiryDate)],
    ["Freeze days", `${row.membership?.freezeDays ?? 0}`],
    ["Last check-in", formatDate(row.lastCheckIn?.date)],
    [
      "Days inactive",
      row.daysInactive === null ? "Never checked in" : `${row.daysInactive} days`,
    ],
    ["Joined", formatDate(row.member.joinDate)],
    ["Email", row.member.email],
    ["Total visits", `${row.visits.length}`],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="stat-label">{k}</dt>
          <dd className="mt-0.5 text-sm font-semibold break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Visits({ row }: { row: MemberRow }) {
  if (row.visits.length === 0) return <EmptyNote>No check-ins recorded.</EmptyNote>;
  return (
    <ul className="divide-y divide-border">
      {row.visits.map((v) => (
        <li key={v.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
          <div>
            <p className="font-semibold">{formatDate(v.date)}</p>
            {v.correctionReason ? (
              <p className="text-xs text-muted-foreground">{v.correctionReason}</p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{v.time}</p>
            <Badge tone={v.source === "QR" ? "success" : "neutral"}>{v.source}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FollowUpsList({ row }: { row: MemberRow }) {
  if (row.followUps.length === 0) return <EmptyNote>No follow-ups logged yet.</EmptyNote>;
  return (
    <ul className="divide-y divide-border">
      {row.followUps.map((f) => (
        <li key={f.id} className="py-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{formatDate(f.date)} · {f.channel}</p>
            <Badge tone={f.outcome === "Cancelled" || f.outcome === "No response" ? "danger" : "success"}>
              {f.outcome}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {f.notes} · {f.staff}
            {f.nextActionDate ? ` · next: ${formatDate(f.nextActionDate)}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Payments({ row }: { row: MemberRow }) {
  if (row.payments.length === 0) return <EmptyNote>No payments recorded.</EmptyNote>;
  return (
    <ul className="divide-y divide-border">
      {row.payments.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
          <div>
            <p className="font-semibold">{inr(p.amount)} · {p.method}</p>
            <p className="text-xs text-muted-foreground">
              {p.id} · {p.status === "Pending" ? "due" : "paid"} {formatDate(p.paidOn)}
            </p>
          </div>
          <Badge tone={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "danger"}>
            {p.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function MemberDetail() {
  const { id } = Route.useParams();
  const { getRow } = useGym();
  const row = getRow(id.toUpperCase());
  const [tab, setTab] = useState<Tab>("Overview");

  if (!row) {
    return (
      <AppShell title="Member not found">
        <Card>
          <EmptyNote>No member with ID {id}.</EmptyNote>
          <Link to="/members" className="text-sm font-bold text-primary">
            Back to members
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={row.member.name} subtitle={`${row.member.id} · ${row.member.phone}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          to="/members"
          className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Members
        </Link>
        <MembershipBadge row={row} />
        {row.isRedList ? <Badge tone="danger">Follow-up needed</Badge> : null}
        {row.pendingPayments.length > 0 ? (
          <Badge tone="warning">
            {inr(row.pendingPayments.reduce((s, p) => s + p.amount, 0))} pending
          </Badge>
        ) : (
          <Badge tone="success">Payments clear</Badge>
        )}
        <a
          href={`tel:${row.member.phone}`}
          className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground"
        >
          <Phone className="size-4" /> Call
        </a>
      </div>

      {/* Desktop: side-by-side panels */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <Card title="Membership">
          <Overview row={row} />
        </Card>
        <Card title="Visit history">
          <Visits row={row} />
        </Card>
        <Card title="Follow-up history">
          <FollowUpsList row={row} />
        </Card>
        <Card title="Payment history">
          <Payments row={row} />
        </Card>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg py-2 text-xs font-bold transition-colors ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Card>
          {tab === "Overview" ? <Overview row={row} /> : null}
          {tab === "Visits" ? <Visits row={row} /> : null}
          {tab === "Follow-ups" ? <FollowUpsList row={row} /> : null}
          {tab === "Payments" ? <Payments row={row} /> : null}
        </Card>
      </div>
    </AppShell>
  );
}
