import type { ReactNode } from "react";

import type { MemberRow } from "@/lib/gym-store";

const tones = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-muted-foreground",
} as const;

export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function MembershipBadge({ row }: { row: MemberRow }) {
  if (row.membershipState === "frozen") return <Badge tone="neutral">Frozen</Badge>;
  if (row.membershipState === "expired") return <Badge tone="danger">Expired</Badge>;
  if (row.membershipState === "expiring")
    return <Badge tone="warning">Expires in {row.daysToExpiry}d</Badge>;
  return <Badge tone="success">Active</Badge>;
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card-surface p-4 lg:p-5 ${className}`}>
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-4 text-sm text-muted-foreground">{children}</p>;
}

export function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
