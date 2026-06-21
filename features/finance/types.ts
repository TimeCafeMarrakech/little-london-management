export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "cheque" | "other";

export type FinanceMetrics = {
  totalRevenue: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  paymentsThisMonth: number;
};

export type FinanceOption = {
  id: string;
  label: string;
  helper: string;
};

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceItem = InvoiceItemInput & {
  id: string;
  lineTotal: number;
};

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceDetail = InvoiceListItem & {
  items: InvoiceItem[];
  payments: PaymentAllocationSummary[];
};

export type InvoiceListResult = {
  invoices: InvoiceListItem[];
  metrics: FinanceMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type PaymentAllocationInput = {
  invoiceId: string;
  amountAllocated: number;
};

export type PaymentAllocationSummary = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amountAllocated: number;
};

export type PaymentListItem = {
  id: string;
  paymentNumber: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  allocatedAmount: number;
};

export type PaymentDetail = PaymentListItem & {
  allocations: PaymentAllocationSummary[];
};

export type PaymentListResult = {
  payments: PaymentListItem[];
  metrics: FinanceMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type BillingSummary = {
  invoiceCount: number;
  paymentCount: number;
  outstandingBalance: number;
  paidTotal: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    dueDate: string;
    balanceDue: number;
  }>;
};

export type FinanceActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
