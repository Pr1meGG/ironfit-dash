import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Phone } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge, Card } from "@/components/ui-bits";
import { followUpOutcomes, type FollowUpOutcome } from "@/lib/gym-data";
import { formatDate, useGym, type MemberRow } from "@/lib/gym-store";

export const Route = createFileRoute("/red-list")({
  head: () => ({
    meta: [
      { title: "Red List & Follow-up Queue — IronFit" },
      {
        name: "description",
        content:
          "Members with no gym check-in for 10+ days, with phone numbers, plans, last follow-up and call outcome logging.",
      },
      { property: "og:title", content: "Red List & Follow-up Queue — IronFit" },
      {
        property: "og:description",
        content: "Call the members who stopped showing up and record the outcome of every follow-up.",
      },
    ],
  }),
  component: RedList,
});

function OutcomePicker({ row }: { row: MemberRow }) {
  const { logFollowUp } = useGym();
  const [outcome, setOutcome] = useState<FollowUpOutcome | "">("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={outcome}
        onChange={(e) => {
          setOutcome(e.target.value as FollowUpOutcome);
          setSaved(false);
        }}
        className="h-10 min-w-40 flex-1 rounded-lg border border-input bg-card px-3 text-sm font-medium outline-none focus:border-ring"
        aria-label={`Call outcome for ${row.member.name}`}
      >
        <option value="">Select outcome…</option>
        {followUpOutcomes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!outcome}
        onClick={() => {
          if (!outcome) return;
          logFollowUp(row.member.id, outcome, "Call");
          setSaved(true);
          setOutcome("");
        }}
        className="h-10 rounded-lg bg-foreground px-4 text-sm font-bold text-background transition-opacity disabled:opacity-35"
      >
        Save
      </button>
      {saved ? (
        <span className="flex items-center gap-1 text-xs font-bold text-success">
          <CheckCircle2 className="size-4" /> Logged
        </span>
      ) : null}
    </div>
  );
}

function RedList() {
  const { rows, settings } = useGym();
  const queue = rows
    .filter((r) => r.isRedList)
    .sort((a, b) => (b.daysInactive ?? 999) - (a.daysInactive ?? 999));
  const frozen = rows.filter((r) => r.membershipState === "frozen");

  return (
    <AppShell
      title="Red List"
      subtitle={`No check-in for ${settings.inactivityTriggerDays}+ days · frozen and paused members excluded`}
    >
      {queue.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nobody is on the red list right now. Every active member trained recently.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {queue.map((row) => {
            const lastFollowUp = row.followUps[0];
            return (
              <article
                key={row.member.id}
                className="card-surface border-l-4 border-l-danger p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/members/$id"
                      params={{ id: row.member.id }}
                      className="font-display text-lg font-bold hover:text-primary"
                    >
                      {row.member.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {row.member.id} · {row.plan?.name ?? "No plan"} · {row.member.phone}
                    </p>
                  </div>
                  <Badge tone="danger">
                    {row.daysInactive === null ? "Never trained" : `${row.daysInactive} days idle`}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="stat-label">Last check-in</dt>
                    <dd className="mt-0.5 font-semibold">{formatDate(row.lastCheckIn?.date)}</dd>
                  </div>
                  <div>
                    <dt className="stat-label">Last follow-up</dt>
                    <dd className="mt-0.5 font-semibold">
                      {lastFollowUp
                        ? `${formatDate(lastFollowUp.date)} · ${lastFollowUp.outcome}`
                        : "Never contacted"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={`tel:${row.member.phone}`}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
                  >
                    <Phone className="size-4" /> Call {row.member.phone}
                  </a>
                  <OutcomePicker row={row} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {frozen.length > 0 ? (
        <Card title="Excluded — frozen / paused" className="mt-4">
          <ul className="divide-y divide-border">
            {frozen.map((r) => (
              <li key={r.member.id} className="flex items-center justify-between py-2.5">
                <Link
                  to="/members/$id"
                  params={{ id: r.member.id }}
                  className="text-sm font-semibold hover:text-primary"
                >
                  {r.member.name}
                </Link>
                <Badge tone="neutral">
                  Frozen{r.membership?.freezeDays ? ` · ${r.membership.freezeDays} days` : ""}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </AppShell>
  );
}
