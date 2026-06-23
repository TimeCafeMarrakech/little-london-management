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
  Layers3,
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
  trend: number[];
  trendLabel: string;
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
    { label: "Courses", description: "Program catalogue", icon: BookOpen, href: "/courses" },
    { label: "Classes", description: "Rosters and teachers", icon: Layers3, href: "/classes" },
    { label: "Attendance", description: "Daily attendance", icon: ClipboardCheck, href: "/attendance" },
    { label: "Invoices", description: "Billing and balances", icon: WalletCards, href: "/invoices" },
    { label: "Payments", description: "Payment history", icon: CreditCard, href: "/payments" },
    { label: "Events", description: "Workshops and camps", icon: CalendarDays, href: "/events" },
    { label: "Settings", description: "System and access", icon: ShieldCheck, disabled: true },
  ],
  admin: [
    { label: "Overview", description: "Daily management snapshot", icon: Home, href: "/dashboard", active: true },
    { label: "Students", description: "Profiles and care notes", icon: GraduationCap, href: "/students" },
    { label: "Parents", description: "Contacts and linked children", icon: Users, href: "/parents" },
    { label: "Teachers", description: "Staff profiles and availability", icon: UserRoundCheck, href: "/teachers" },
    { label: "Courses", description: "Program catalogue", icon: BookOpen, href: "/courses" },
    { label: "Classes", description: "Rosters and teachers", icon: Layers3, href: "/classes" },
    { label: "Attendance", description: "Daily attendance view", icon: ClipboardCheck, href: "/attendance" },
    { label: "Invoices", description: "Billing and balances", icon: CreditCard, href: "/invoices" },
    { label: "Payments", description: "Payment history", icon: WalletCards, href: "/payments" },
    { label: "Events", description: "Workshops and camps", icon: CalendarDays, href: "/events" },
    { label: "Announcements", description: "School communications", icon: Megaphone, disabled: true },
  ],
  teacher: [
    { label: "Today", description: "Classes and tasks", icon: Home, href: "/dashboard", active: true },
    { label: "Students", description: "Assigned-only view", icon: Users, href: "/students" },
    { label: "Parents", description: "Assigned contact placeholder", icon: Heart, href: "/parents" },
    { label: "Profile", description: "Own teacher profile", icon: UserRoundCheck, href: "/teachers" },
    { label: "Classes", description: "Assigned class view", icon: Layers3, href: "/classes" },
    { label: "Schedule", description: "Weekly teaching flow later", icon: CalendarDays, disabled: true },
    { label: "Attendance", description: "Class check-in", icon: ClipboardCheck, href: "/attendance" },
    { label: "Events", description: "Assigned activities", icon: CalendarDays, href: "/events" },
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
      { label: "Revenue", value: "142k MAD", helper: "+12% month on month", tone: "navy", trend: [42, 48, 45, 56, 62, 68, 74], trendLabel: "Rising steadily" },
      { label: "Enrolments", value: "286", helper: "Across core programmes", tone: "sky", trend: [54, 58, 57, 63, 66, 70, 73], trendLabel: "Healthy demand" },
      { label: "Attendance", value: "94%", helper: "All sessions today", tone: "orange", trend: [82, 84, 88, 86, 91, 93, 94], trendLabel: "Above target" },
      { label: "Event bookings", value: "67", helper: "Workshops and camps", tone: "neutral", trend: [28, 34, 39, 43, 51, 59, 67], trendLabel: "Growing interest" },
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
      { label: "Revenue", value: "86k MAD", helper: "This month's finance snapshot", tone: "navy", trend: [34, 38, 44, 49, 52, 61, 66], trendLabel: "Tracking upward" },
      { label: "Enrolments", value: "24", helper: "New families this month", tone: "sky", trend: [8, 10, 13, 15, 17, 21, 24], trendLabel: "Strong pipeline" },
      { label: "Attendance", value: "91%", helper: "Today's school average", tone: "orange", trend: [78, 82, 81, 86, 88, 90, 91], trendLabel: "Stable day" },
      { label: "Event bookings", value: "31", helper: "Workshops and camps", tone: "neutral", trend: [11, 14, 18, 18, 24, 27, 31], trendLabel: "Near capacity soon" },
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
      { label: "Today's classes", value: "4", helper: "Next class at 10:30", tone: "navy", trend: [2, 3, 3, 4, 4, 4, 4], trendLabel: "Balanced day" },
      { label: "Enrolments", value: "38", helper: "Assigned students today", tone: "sky", trend: [30, 32, 34, 36, 37, 38, 38], trendLabel: "Class load steady" },
      { label: "Attendance", value: "92%", helper: "Assigned sessions", tone: "orange", trend: [84, 85, 88, 90, 91, 91, 92], trendLabel: "On track" },
      { label: "Event bookings", value: "8", helper: "Assigned activities", tone: "neutral", trend: [2, 3, 3, 5, 6, 7, 8], trendLabel: "Upcoming support" },
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
      { label: "Next class", value: "Wed 16:00", helper: "English confidence group", tone: "navy", trend: [1, 1, 1, 1, 1, 1, 1], trendLabel: "Confirmed" },
      { label: "Attendance", value: "96%", helper: "Monthly view", tone: "sky", trend: [88, 90, 91, 92, 94, 96, 96], trendLabel: "Excellent rhythm" },
      { label: "Announcements", value: "2", helper: "New school updates", tone: "orange", trend: [0, 1, 1, 1, 2, 2, 2], trendLabel: "Fresh updates" },
      { label: "Balance", value: "0 MAD", helper: "No outstanding amount", tone: "neutral", trend: [4, 3, 2, 1, 0, 0, 0], trendLabel: "Clear" },
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
