export type ParentStatus = "active" | "inactive" | "archived";
export type ParentPortalStatus = "not_invited" | "invited" | "active" | "disabled";

export type LinkedStudentSummary = {
  relationshipId: string;
  id: string;
  studentNumber: string;
  fullName: string;
  status: "active" | "inactive" | "archived";
  relationshipType: string;
  isPrimaryContact: boolean;
  canPickUp: boolean;
  receivesInvoices: boolean;
  receivesAnnouncements: boolean;
};

export type AvailableStudentOption = {
  id: string;
  studentNumber: string;
  fullName: string;
  status: "active" | "inactive" | "archived";
};

export type ParentListItem = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  alternatePhone: string | null;
  city: string | null;
  preferredLanguage: string | null;
  portalStatus: ParentPortalStatus;
  status: ParentStatus;
  linkedStudentCount: number;
};

export type ParentDetail = ParentListItem & {
  userId: string | null;
  portalAccount: {
    userId: string | null;
    linkedUserEmail: string | null;
    linkedUserFullName: string | null;
    linkedUserStatus: "pending" | "active" | "suspended" | "disabled" | "archived" | null;
    lastInvitationAt: string | null;
    lastLoginAt: string | null;
  };
  addressLine1: string | null;
  addressLine2: string | null;
  country: string;
  linkedStudents: LinkedStudentSummary[];
  availableStudents: AvailableStudentOption[];
  billingSummary: {
    invoiceCount: number;
    paymentCount: number;
    outstandingBalance: number;
    paidTotal: number;
    recentInvoices: Array<{
      id: string;
      invoiceNumber: string;
      status: "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
      dueDate: string;
      balanceDue: number;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ParentDashboardMetrics = {
  totalParents: number;
  activeParents: number;
  invitedParents: number;
  archivedParents: number;
};

export type ParentListResult = {
  parents: ParentListItem[];
  metrics: ParentDashboardMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type ParentActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
