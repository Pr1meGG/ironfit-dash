// Seed data imported directly from the owner's cleaned CSV exports.

export type MemberStatus = "Active" | "Paused" | "Frozen" | "Cancelled";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: MemberStatus;
  joinDate: string;
}

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  active: boolean;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  status: "Active" | "Frozen" | "Expired" | "Cancelled";
  freezeDays: number;
  renewalReminderSent: boolean;
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string;
  time: string;
  source: "QR" | "Assisted";
  correctionReason?: string;
}

export type FollowUpOutcome =
  | "Will return"
  | "Injured"
  | "Travelling"
  | "Timing issue"
  | "No response"
  | "Cancelled";

export interface FollowUp {
  id: string;
  memberId: string;
  date: string;
  channel: "Call" | "WhatsApp";
  outcome: FollowUpOutcome;
  notes: string;
  nextActionDate?: string;
  staff: string;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  method: "UPI" | "Cash" | "Card";
  status: "Paid" | "Pending" | "Failed";
  paidOn: string;
  planId: string;
}

export interface Settings {
  gymName: string;
  inactivityTriggerDays: number;
  renewalReminderDays: number;
  ownerPhone: string;
}

export const settings: Settings = {
  gymName: "IronFit Fitness Studio, Vizag",
  inactivityTriggerDays: 10,
  renewalReminderDays: 7,
  ownerPhone: "98220 11223",
};

export const plans: Plan[] = [
  { id: "P001", name: "Monthly", durationMonths: 1, price: 1500, active: true },
  { id: "P002", name: "Quarterly", durationMonths: 3, price: 4000, active: true },
  { id: "P003", name: "Half-Yearly", durationMonths: 6, price: 7000, active: true },
  { id: "P004", name: "Yearly", durationMonths: 12, price: 12000, active: true },
];

export const members: Member[] = [
  { id: "M001", name: "Ravi Kumar", phone: "9000000001", email: "ravi@example.com", status: "Active", joinDate: "2026-07-22" },
  { id: "M002", name: "Priya Sharma", phone: "9000000002", email: "priya@example.com", status: "Active", joinDate: "2026-07-07" },
  { id: "M003", name: "Sai Teja", phone: "9000000003", email: "sai@example.com", status: "Active", joinDate: "2026-08-21" },
  { id: "M004", name: "Anjali Rao", phone: "9000000004", email: "anjali@example.com", status: "Paused", joinDate: "2026-06-12" },
  { id: "M005", name: "Vikram Singh", phone: "9000000005", email: "vikram@example.com", status: "Active", joinDate: "2026-05-03" },
  { id: "M006", name: "Divya Reddy", phone: "9000000006", email: "divya@example.com", status: "Active", joinDate: "2026-09-05" },
  { id: "M007", name: "Arjun Naidu", phone: "9000000007", email: "arjun.n@example.com", status: "Active", joinDate: "2026-08-26" },
  { id: "M008", name: "Kavya Nair", phone: "9000000008", email: "kavya@example.com", status: "Active", joinDate: "2026-09-10" },
];

export const memberships: Membership[] = [
  { id: "MS001", memberId: "M001", planId: "P002", startDate: "2026-07-22", expiryDate: "2026-12-15", status: "Active", freezeDays: 0, renewalReminderSent: false },
  { id: "MS002", memberId: "M002", planId: "P003", startDate: "2026-07-07", expiryDate: "2027-01-14", status: "Active", freezeDays: 0, renewalReminderSent: false },
  { id: "MS003", memberId: "M003", planId: "P001", startDate: "2026-08-21", expiryDate: "2026-09-27", status: "Active", freezeDays: 0, renewalReminderSent: true },
  { id: "MS004", memberId: "M004", planId: "P002", startDate: "2026-06-12", expiryDate: "2026-10-09", status: "Frozen", freezeDays: 30, renewalReminderSent: false },
  { id: "MS005", memberId: "M005", planId: "P004", startDate: "2026-05-03", expiryDate: "2027-04-30", status: "Active", freezeDays: 0, renewalReminderSent: false },
  { id: "MS006", memberId: "M006", planId: "P001", startDate: "2026-09-05", expiryDate: "2026-10-14", status: "Active", freezeDays: 0, renewalReminderSent: false },
  { id: "MS007", memberId: "M007", planId: "P001", startDate: "2026-08-26", expiryDate: "2026-09-24", status: "Active", freezeDays: 0, renewalReminderSent: true },
  { id: "MS008", memberId: "M008", planId: "P002", startDate: "2026-09-10", expiryDate: "2026-12-09", status: "Active", freezeDays: 0, renewalReminderSent: false },
];

export const attendance: Attendance[] = [
  { id: "A001", memberId: "M001", date: "2026-09-19", time: "06:30", source: "QR" },
  { id: "A002", memberId: "M001", date: "2026-09-17", time: "06:35", source: "QR" },
  { id: "A003", memberId: "M002", date: "2026-09-18", time: "07:10", source: "QR" },
  { id: "A004", memberId: "M003", date: "2026-09-05", time: "18:20", source: "Assisted", correctionReason: "Member phone battery dead" },
  { id: "A005", memberId: "M003", date: "2026-09-19", time: "18:05", source: "QR" },
  { id: "A006", memberId: "M005", date: "2026-08-25", time: "06:45", source: "QR" },
  { id: "A007", memberId: "M006", date: "2026-09-19", time: "17:40", source: "QR" },
  { id: "A008", memberId: "M007", date: "2026-09-05", time: "19:00", source: "QR" },
  { id: "A009", memberId: "M008", date: "2026-09-19", time: "06:55", source: "QR" },
  { id: "A010", memberId: "M002", date: "2026-09-20", time: "07:20", source: "QR" },
  { id: "A011", memberId: "M006", date: "2026-09-20", time: "18:10", source: "QR" },
  { id: "A012", memberId: "M001", date: "2026-09-20", time: "18:45", source: "QR" },
];

export const followUps: FollowUp[] = [
  { id: "F001", memberId: "M003", date: "2026-09-19", channel: "WhatsApp", outcome: "Will return", notes: "Replied, coming tomorrow", nextActionDate: "2026-09-21", staff: "Front Desk" },
  { id: "F002", memberId: "M005", date: "2026-09-19", channel: "Call", outcome: "Will return", notes: "Travelling for work", nextActionDate: "2026-09-25", staff: "Front Desk" },
  { id: "F003", memberId: "M007", date: "2026-09-16", channel: "WhatsApp", outcome: "No response", notes: "Tried first contact", nextActionDate: "2026-09-21", staff: "Owner" },
];

export const payments: Payment[] = [
  { id: "PAY001", memberId: "M001", amount: 4000, method: "UPI", status: "Paid", paidOn: "2026-07-22", planId: "P002" },
  { id: "PAY002", memberId: "M002", amount: 7000, method: "Cash", status: "Paid", paidOn: "2026-07-07", planId: "P003" },
  { id: "PAY003", memberId: "M003", amount: 1500, method: "UPI", status: "Pending", paidOn: "2026-09-27", planId: "P001" },
  { id: "PAY004", memberId: "M004", amount: 4000, method: "UPI", status: "Paid", paidOn: "2026-06-12", planId: "P002" },
  { id: "PAY005", memberId: "M005", amount: 12000, method: "UPI", status: "Paid", paidOn: "2026-05-03", planId: "P004" },
  { id: "PAY006", memberId: "M006", amount: 1500, method: "UPI", status: "Paid", paidOn: "2026-09-05", planId: "P001" },
  { id: "PAY007", memberId: "M007", amount: 1500, method: "Card", status: "Pending", paidOn: "2026-09-24", planId: "P001" },
  { id: "PAY008", memberId: "M008", amount: 4000, method: "UPI", status: "Paid", paidOn: "2026-09-10", planId: "P002" },
];

export const followUpOutcomes: FollowUpOutcome[] = [
  "Will return",
  "Injured",
  "Travelling",
  "Timing issue",
  "No response",
  "Cancelled",
];
