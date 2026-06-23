export type ParentPortalChild = {
  id: string;
  studentNumber: string;
  fullName: string;
  dateOfBirth: string;
  status: string;
  relationshipType: string;
  isPrimaryContact: boolean;
  primaryLanguage: string | null;
  schoolName: string | null;
  activeEnrolmentCount: number;
};

export type ParentPortalClass = {
  enrolmentId: string;
  studentId: string;
  studentName: string;
  classId: string;
  classCode: string;
  className: string;
  courseName: string;
  enrolmentDate: string;
  enrolmentStatus: string;
  startDate: string | null;
  endDate: string | null;
  teachers: string[];
};

export type ParentPortalAttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  courseName: string;
  sessionDate: string;
  status: string;
  arrivalTime: string | null;
};

export type ParentPortalInvoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
};

export type ParentPortalPayment = {
  id: string;
  paymentNumber: string;
  studentId: string;
  studentName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  allocatedAmount: number;
  referenceNumber: string | null;
};

export type ParentPortalFinance = {
  outstandingBalance: number;
  invoiceCount: number;
  paymentCount: number;
  paidTotal: number;
  invoices: ParentPortalInvoice[];
  payments: ParentPortalPayment[];
};

export type ParentPortalEventBooking = {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  title: string;
  category: string;
  eventTypeName: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  price: number;
  bookingStatus: string;
  paymentStatus: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
};

export type ParentPortalDashboard = {
  children: ParentPortalChild[];
  nextClass: ParentPortalClass | null;
  attendanceRate: number;
  outstandingBalance: number;
  recentInvoices: ParentPortalInvoice[];
  recentPayments: ParentPortalPayment[];
  upcomingEvents: ParentPortalEventBooking[];
  activeEventBookings: ParentPortalEventBooking[];
};

export type ParentPortalData = ParentPortalDashboard & {
  classes: ParentPortalClass[];
  attendance: ParentPortalAttendanceRecord[];
  finance: ParentPortalFinance;
  eventBookings: ParentPortalEventBooking[];
};
