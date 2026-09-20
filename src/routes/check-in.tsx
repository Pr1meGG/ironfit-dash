import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, QrCode, XCircle } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui-bits";
import { formatDate, useGym, type CheckInResult } from "@/lib/gym-store";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "QR Check-in — IronFit" },
      {
        name: "description",
        content:
          "Scan or type a member ID to record a gym check-in. Blocks duplicates, expired and frozen memberships.",
      },
      { property: "og:title", content: "QR Check-in — IronFit" },
      {
        property: "og:description",
        content: "Front-desk check-in screen with instant membership validity confirmation.",
      },
    ],
  }),
  component: CheckIn,
});

function CheckIn() {
  const { checkIn, today, rows } = useGym();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);

  const recent = rows
    .filter((r) => r.visits.some((v) => v.date === today))
    .map((r) => ({ name: r.member.name, time: r.visits.find((v) => v.date === today)!.time }))
    .sort((a, b) => (a.time < b.time ? 1 : -1));

  return (
    <AppShell title="QR Check-in" subtitle={`Front desk · ${formatDate(today)}`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setResult(checkIn(value));
              setValue("");
            }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="flex size-20 items-center justify-center rounded-2xl bg-secondary">
              <QrCode className="size-10 text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan the member QR code or type the member ID (e.g. M001).
            </p>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder="Member ID"
              aria-label="Member ID"
              className="h-14 w-full max-w-sm rounded-xl border border-input bg-card px-4 text-center font-display text-xl font-bold uppercase tracking-widest outline-none focus:border-ring"
            />
            <button
              type="submit"
              className="h-12 w-full max-w-sm rounded-xl bg-primary text-base font-bold text-primary-foreground"
            >
              Check in
            </button>
          </form>

          {result ? (
            result.ok ? (
              <div className="rounded-xl border border-success/30 bg-success-soft p-4 text-center">
                <CheckCircle2 className="mx-auto size-8 text-success" />
                <p className="mt-2 font-display text-xl font-extrabold text-success">
                  Check-in successful
                </p>
                <p className="mt-1 text-sm font-semibold">{result.member.name}</p>
                <p className="text-xs text-muted-foreground">
                  Valid until {formatDate(result.validUntil)} · logged at {result.time}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-center">
                <XCircle className="mx-auto size-8 text-danger" />
                <p className="mt-2 font-display text-xl font-extrabold text-danger">
                  Check-in failed
                </p>
                {result.member ? (
                  <p className="mt-1 text-sm font-semibold">{result.member.name}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">{result.reason}</p>
              </div>
            )
          ) : null}
        </Card>

        <Card title="Today's check-ins">
          {recent.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No check-ins yet today.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
