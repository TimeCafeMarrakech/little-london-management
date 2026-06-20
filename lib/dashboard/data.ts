import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  CreditCard,
  GraduationCap,
  Heart,
  Home,
  Megaphone,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";

import type { UserRole } from "@/lib/auth/types";

export type NavigationItem = {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  disabled?: boolean;
};

export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  tone: "navy" | "sky" | "orange" | "neutral";
};

export type DashboardPanel = {
  title: string;
  eyebrow: string;
  items: string[];
};

export type DashboardExperience = {
  title: string;
  subtitle: string;
  focus: string;
  stats: DashboardStat[];
  panels: DashboardPanel[];
  quickActions: string[];
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};

export const roleNavigation: Record<UserRole, NavigationItem[]> = {
  super_admin: [
    { label: "Overview", description: "Platform command centre", icon: Home, href: "/dashboard", active: true },
    { label: "Students", description: "Profiles and care notes", icon: Users, href: "/students" },
    { label: "Parents", description: "Family contacts and links", icon: Heart, href: "/parents" },
    { label: "Teachers", description: "Staff profiles and availability", icon: UserRoundCheck, href: "/teachers" },
    { label: "Operations", description: "Classes and attendance", icon: ClipboardCheck, disabled: true },
    { label: "Finance", description: "Revenue and balances", icon: WalletCards, disabled: true },
    { label: "Settings", description: "System and access", icon: ShieldCheck, disabled: true },
  ],
  admin: [
    { label: "Overview", description: "Daily management snapshot", icon: Home, href: "/dashboard", active: true },
    { label: "Students", description: "Profiles and care notes", icon: GraduationCap, href: "/students" },
    { label: "Parents", description: "Contacts and linked children", icon: Users, href: "/parents" },
    { label: "Teachers", description: "Staff profiles and availability", icon: UserRoundCheck, href: "/teachers" },
    { label: "Attendance", description: "Daily attendance view", icon: ClipboardCheck, disabled: true },
    { label: "Finance", description: "Payments and invoices", icon: CreditCard, disabled: true },
    { label: "Announcements", description: "School communications", icon: Megaphone, disabled: true },
  ],
  teacher: [
    { label: "Today", description: "Classes and tasks", icon: Home, href: "/dashboard", active: true },
    { label: "Students", description: "Assigned-only view", icon: Users, href: "/students" },
    { label: "Parents", description: "Assigned contact placeholder", icon: Heart, href: "/parents" },
    { label: "Profile", description: "Own teacher profile", icon: UserRoundCheck, href: "/teachers" },
    { label: "Schedule", description: "Weekly teaching flow", icon: CalendarDays, disabled: true },
    { label: "Attendance", description: "Class check-in", icon: ClipboardCheck, disabled: true },
    { label: "Notes", description: "Lesson notes and remarks", icon: BookOpen, disabled: true },
    { label: "Announcements", description: "Staff updates", icon: Bell, disabled: true },
  ],
  parent: [
    { label: "Family", description: "Children overview", icon: Heart, href: "/dashboard", active: true },
    { label: "Schedule", description: "Upcoming classes", icon: CalendarDays, disabled: true },
    { label: "Progress", description: "Teacher updates", icon: Star, disabled: true },
    { label: "Payments", description: "Invoices and receipts", icon: CreditCard, disabled: true },
    { label: "Announcements", description: "School messages", icon: Megaphone, disabled: true },
  ],
};

export const dashboardExperiences: Record<UserRole, DashboardExperience> = {
  super_admin: {
    title: "Platform overview",
    subtitle: "A calm view of Little London's full operating rhythm.",
    focus: "Cross-school health, access readiness, and growth signals.",
    stats: [
      { label: "Monthly revenue", value: "142k MAD", helper: "+12% placeholder trend", tone: "navy" },
      { label: "Active enrolments", value: "286", helper: "Across core programmes", tone: "sky" },
      { label: "Attendance today", value: "94%", helper: "All sessions placeholder", tone: "orange" },
      { label: "Staff workload", value: "Balanced", helper: "No teacher overloaded", tone: "neutral" },
    ],
    panels: [
      {
        eyebrow: "Priority",
        title: "Leadership focus",
        items: ["Review branch-readiness plan", "Confirm access policies", "Prepare Phase 3 dashboard signoff"],
      },
      {
        eyebrow: "Signals",
        title: "Operational pulse",
        items: ["Enrolment demand is steady", "Teacher capacity remains healthy", "Finance snapshot is placeholder-only"],
      },
    ],
    quickActions: ["Review access model", "Preview admin view", "Check setup notes"],
  },
  admin: {
    title: "Management dashboard",
    subtitle: "A boutique command centre for daily school operations.",
    focus: "Revenue, enrolments, attendance, and teacher workload at a glance.",
    stats: [
      { label: "Revenue this month", value: "86k MAD", helper: "Placeholder finance snapshot", tone: "navy" },
      { label: "New enrolments", value: "24", helper: "Awaiting future registration module", tone: "sky" },
      { label: "Attendance", value: "91%", helper: "Today's placeholder average", tone: "orange" },
      { label: "Teacher load", value: "8 / 10", helper: "Capacity looks comfortable", tone: "neutral" },
    ],
    panels: [
      {
        eyebrow: "Today",
        title: "Management attention",
        items: ["Three classes need room confirmation", "Two parent messages need follow-up", "One announcement draft awaits approval"],
      },
      {
        eyebrow: "Upcoming",
        title: "School rhythm",
        items: ["Holiday camp planning window", "Birthday weekend capacity review", "Teacher timetable review"],
      },
    ],
    quickActions: ["Create announcement later", "Review attendance later", "Open finance later"],
  },
  teacher: {
    title: "Teacher dashboard",
    subtitle: "A focused workspace for today's teaching flow.",
    focus: "Classes, attendance, notes, and tasks without distractions.",
    stats: [
      { label: "Today's classes", value: "4", helper: "Next class at 10:30", tone: "navy" },
      { label: "Students today", value: "38", helper: "Across assigned sessions", tone: "sky" },
      { label: "Attendance tasks", value: "2", helper: "Placeholder reminders", tone: "orange" },
      { label: "Lesson notes", value: "3", helper: "Drafts to finish later", tone: "neutral" },
    ],
    panels: [
      {
        eyebrow: "Schedule",
        title: "Today's teaching flow",
        items: ["10:30 English Explorers", "14:00 Drama group", "16:30 Creative English"],
      },
      {
        eyebrow: "Tasks",
        title: "Gentle reminders",
        items: ["Prepare phonics warm-up", "Add class note after final session", "Read new parent announcement"],
      },
    ],
    quickActions: ["Mark attendance later", "Add note later", "View schedule later"],
  },
  parent: {
    title: "Parent portal",
    subtitle: "A simple, warm overview of your child's Little London day.",
    focus: "Child information, upcoming classes, announcements, and payment clarity.",
    stats: [
      { label: "Next class", value: "Wed 16:00", helper: "English confidence group", tone: "navy" },
      { label: "Attendance", value: "96%", helper: "Placeholder monthly view", tone: "sky" },
      { label: "Announcements", value: "2", helper: "New school updates", tone: "orange" },
      { label: "Balance", value: "0 MAD", helper: "No outstanding placeholder", tone: "neutral" },
    ],
    panels: [
      {
        eyebrow: "Child",
        title: "What parents need first",
        items: ["Upcoming English class", "Teacher note preview", "Recent attendance snapshot"],
      },
      {
        eyebrow: "Updates",
        title: "School messages",
        items: ["Spring workshop interest list opens soon", "Please confirm holiday dates", "Payment receipts will appear here later"],
      },
    ],
    quickActions: ["View child later", "Read announcements later", "Download receipt later"],
  },
};

export const notificationItems: Record<UserRole, string[]> = {
  super_admin: ["Phase 3 shell ready for review", "Multi-branch remains future scope"],
  admin: ["One teacher workload review", "Two placeholder parent follow-ups"],
  teacher: ["Class note reminder", "New announcement for teachers"],
  parent: ["New announcement available", "Upcoming class reminder"],
};

export const shellHighlights = [
  { label: "Premium", icon: Sparkles },
  { label: "Calm", icon: Moon },
  { label: "Timely", icon: Clock },
];
