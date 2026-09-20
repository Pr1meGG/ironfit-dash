import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  attendance as seedAttendance,
  followUps as seedFollowUps,
  members,
  memberships,
  payments,
  plans,
  settings,
  type Attendance,
  type FollowUp,
  type FollowUpOutcome,
  type Member,
  type Membership,
  type Payment,
  type Plan,
} from "./gym-data";

const STORAGE_KEY = "ironfit-state-v1";

export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromISO: string, toISO: string) {
  const a = new Date(`${fromISO}T00:00:00`).getTime();
  const b = new Date(`${toISO}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export type MemberRow = {
  member: Member;
  membership?: Membership;
  plan?: Plan;
  lastCheckIn?: Attendance;
  daysInactive: number | null;
  visits: Attendance[];
  followUps: FollowUp[];
  payments: Payment[];
  pendingPayments: Payment[];
  daysToExpiry: number | null;
  membershipState: "active" | "expiring" | "expired" | "frozen";
  isRedList: boolean;
};

type Ctx = {
  today: string;
  settings: typeof settings;
  plans: Plan[];
  rows: MemberRow[];
  getRow: (memberId: string) => MemberRow | undefined;
  checkIn: (rawId: string) => CheckInResult;
  logFollowUp: (memberId: string, outcome: FollowUpOutcome, channel: "Call" | "WhatsApp") => void;
};

export type CheckInResult =
  | { ok: true; member: Member; validUntil: string; time: string }
  | { ok: false; reason: string; member?: Member };

const GymContext = createContext<Ctx | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const [extraAttendance, setExtraAttendance] = useState<Attendance[]>([]);
  const [extraFollowUps, setExtraFollowUps] = useState<FollowUp[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = todayISO();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { attendance?: Attendance[]; followUps?: FollowUp[] };
        setExtraAttendance(parsed.attendance ?? []);
        setExtraFollowUps(parsed.followUps ?? []);
      }
    } catch {
      /* ignore corrupt local state */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ attendance: extraAttendance, followUps: extraFollowUps }),
    );
  }, [loaded, extraAttendance, extraFollowUps]);

  const allAttendance = useMemo(
    () => [...seedAttendance, ...extraAttendance],
    [extraAttendance],
  );
  const allFollowUps = useMemo(() => [...seedFollowUps, ...extraFollowUps], [extraFollowUps]);

  const rows = useMemo<MemberRow[]>(() => {
    return members.map((member) => {
      const membership = memberships.find((m) => m.memberId === member.id);
      const plan = plans.find((p) => p.id === membership?.planId);
      const visits = allAttendance
        .filter((a) => a.memberId === member.id)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      const lastCheckIn = visits[0];
      const daysInactive = lastCheckIn ? daysBetween(lastCheckIn.date, today) : null;
      const memberFollowUps = allFollowUps
        .filter((f) => f.memberId === member.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      const memberPayments = payments
        .filter((p) => p.memberId === member.id)
        .sort((a, b) => (a.paidOn < b.paidOn ? 1 : -1));
      const daysToExpiry = membership ? daysBetween(today, membership.expiryDate) : null;

      const frozen =
        member.status === "Paused" ||
        member.status === "Frozen" ||
        membership?.status === "Frozen";

      let membershipState: MemberRow["membershipState"] = "active";
      if (frozen) membershipState = "frozen";
      else if (daysToExpiry !== null && daysToExpiry < 0) membershipState = "expired";
      else if (daysToExpiry !== null && daysToExpiry <= settings.renewalReminderDays)
        membershipState = "expiring";

      const inactiveEnough =
        daysInactive === null
          ? daysBetween(member.joinDate, today) >= settings.inactivityTriggerDays
          : daysInactive >= settings.inactivityTriggerDays;

      return {
        member,
        membership,
        plan,
        lastCheckIn,
        daysInactive,
        visits,
        followUps: memberFollowUps,
        payments: memberPayments,
        pendingPayments: memberPayments.filter((p) => p.status === "Pending"),
        daysToExpiry,
        membershipState,
        isRedList: !frozen && member.status !== "Cancelled" && inactiveEnough,
      };
    });
  }, [allAttendance, allFollowUps, today]);

  const getRow = useCallback((memberId: string) => rows.find((r) => r.member.id === memberId), [rows]);

  const checkIn = useCallback(
    (rawId: string): CheckInResult => {
      const id = rawId.trim().toUpperCase();
      if (!id) return { ok: false, reason: "Enter a member ID to check in." };
      const row = rows.find((r) => r.member.id === id);
      if (!row) return { ok: false, reason: `No member found with ID ${id}.` };

      const { member, membership, membershipState } = row;
      if (!membership) return { ok: false, reason: "This member has no membership on record.", member };
      if (membershipState === "frozen")
        return { ok: false, reason: "Membership is frozen or paused. Check-in blocked.", member };
      if (membershipState === "expired")
        return {
          ok: false,
          reason: `Membership expired on ${formatDate(membership.expiryDate)}. Renewal needed.`,
          member,
        };
      if (row.visits.some((v) => v.date === today))
        return { ok: false, reason: "Already checked in today (duplicate check-in).", member };

      const now = new Date();
      const time = `${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`;
      setExtraAttendance((prev) => [
        ...prev,
        {
          id: `A${Date.now()}`,
          memberId: member.id,
          date: today,
          time,
          source: "QR",
        },
      ]);
      return { ok: true, member, validUntil: membership.expiryDate, time };
    },
    [rows, today],
  );

  const logFollowUp = useCallback(
    (memberId: string, outcome: FollowUpOutcome, channel: "Call" | "WhatsApp") => {
      setExtraFollowUps((prev) => [
        ...prev,
        {
          id: `F${Date.now()}`,
          memberId,
          date: todayISO(),
          channel,
          outcome,
          notes: "Logged from follow-up queue",
          staff: "Owner",
        },
      ]);
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ today, settings, plans, rows, getRow, checkIn, logFollowUp }),
    [today, rows, getRow, checkIn, logFollowUp],
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used inside GymProvider");
  return ctx;
}

export function useDashboardStats() {
  const { rows, today, settings: s } = useGym();
  return useMemo(() => {
    const checkInsToday = rows.filter((r) => r.visits.some((v) => v.date === today)).length;
    const activeMembers = rows.filter(
      (r) => r.membershipState === "active" || r.membershipState === "expiring",
    ).length;
    const expiringSoon = rows.filter((r) => r.membershipState === "expiring").length;
    const pendingPayments = rows.flatMap((r) => r.pendingPayments);
    const redList = rows.filter((r) => r.isRedList);
    return {
      checkInsToday,
      activeMembers,
      expiringSoon,
      pendingPaymentCount: pendingPayments.length,
      pendingPaymentAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      redListCount: redList.length,
      inactivityTriggerDays: s.inactivityTriggerDays,
      renewalReminderDays: s.renewalReminderDays,
    };
  }, [rows, today, s]);
}
