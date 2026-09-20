import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge, MembershipBadge, inr } from "@/components/ui-bits";
import { formatDate, useGym } from "@/lib/gym-store";

export const Route = createFileRoute("/members/")({
  head: () => ({
    meta: [
      { title: "Members — IronFit" },
      {
        name: "description",
        content:
          "Every IronFit member with plan, membership validity, last check-in and payment status in one list.",
      },
      { property: "og:title", content: "Members — IronFit" },
      {
        property: "og:description",
        content: "Search the member roster and open any member's full training and payment history.",
      },
    ],
  }),
  component: MembersList,
});

function MembersList() {
  const { rows } = useGym();
  const [q, setQ] = useState("");
  const filtered = rows.filter((r) =>
    `${r.member.name} ${r.member.id} ${r.member.phone}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell title="Members" subtitle={`${rows.length} members on record`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, ID or phone"
        aria-label="Search members"
        className="mb-4 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:border-ring lg:max-w-sm"
      />

      <div className="card-surface overflow-hidden">
        <table className="hidden w-full text-left text-sm lg:table">
          <thead className="bg-secondary/60">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wide [&>th]:text-muted-foreground">
              <th>Member</th>
              <th>Plan</th>
              <th>Validity</th>
              <th>Last check-in</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.member.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Link
                    to="/members/$id"
                    params={{ id: r.member.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {r.member.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {r.member.id} · {r.member.phone}
                  </p>
                </td>
                <td className="px-4 py-3">{r.plan?.name ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(r.membership?.startDate)} → {formatDate(r.membership?.expiryDate)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(r.lastCheckIn?.date)}
                  {r.daysInactive !== null ? (
                    <span className={r.isRedList ? "ml-1 font-bold text-danger" : "ml-1 text-muted-foreground"}>
                      ({r.daysInactive}d)
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {r.pendingPayments.length > 0 ? (
                    <Badge tone="warning">
                      {inr(r.pendingPayments.reduce((s, p) => s + p.amount, 0))} due
                    </Badge>
                  ) : (
                    <Badge tone="success">Paid</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <MembershipBadge row={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-border lg:hidden">
          {filtered.map((r) => (
            <li key={r.member.id}>
              <Link
                to="/members/$id"
                params={{ id: r.member.id }}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.plan?.name ?? "No plan"} · last visit {formatDate(r.lastCheckIn?.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MembershipBadge row={r} />
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
