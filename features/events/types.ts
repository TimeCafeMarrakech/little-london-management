export type EventCategory = "workshop" | "holiday_camp" | "birthday_event" | "drama_event" | "seasonal_event" | "drop_play" | "other";
export type EventTypeStatus = "active" | "inactive" | "archived";
export type EventStatus = "draft" | "active" | "completed" | "cancelled" | "archived";
export type EventBookingStatus = "pending" | "confirmed" | "cancelled" | "attended" | "no_show";
export type EventPaymentStatus = "unpaid" | "invoiced" | "partially_paid" | "paid" | "waived";
export type EventStaffRole = "lead" | "assistant" | "support" | "host" | "coordinator";

export type EventTypeOption = {
  id: string;
  name: string;
  category: EventCategory;
  helper: string;
};

export type EventDashboardMetrics = {
  upcomingEvents: number;
  activeWorkshops: number;
  holidayCamps: number;
  birthdayEvents: number;
  eventsNearCapacity: number;
  totalBookings: number;
};

export type EventListItem = {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  category: EventCategory;
  eventCode: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  price: number;
  status: EventStatus;
  location: string | null;
  notes: string | null;
  bookingCount: number;
  staffCount: number;
};

export type EventBooking = {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  parentId: string;
  parentName: string;
  bookingStatus: EventBookingStatus;
  paymentStatus: EventPaymentStatus;
  invoiceId: string | null;
  notes: string | null;
  createdAt: string;
};

export type EventStaffAssignment = {
  id: string;
  eventId: string;
  teacherId: string | null;
  teacherName: string | null;
  teacherNumber: string | null;
  userId: string | null;
  userName: string | null;
  role: EventStaffRole;
  createdAt: string;
};

export type EventSelectOption = {
  id: string;
  label: string;
  helper: string;
};

export type EventDetail = EventListItem & {
  bookings: EventBooking[];
  staffAssignments: EventStaffAssignment[];
  availableStudents: EventSelectOption[];
  availableParents: EventSelectOption[];
  availableTeachers: EventSelectOption[];
  createdAt: string;
  updatedAt: string;
};

export type EventListResult = {
  events: EventListItem[];
  metrics: EventDashboardMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type EventActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
