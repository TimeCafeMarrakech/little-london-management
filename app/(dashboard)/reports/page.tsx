import {
  AttendanceReports,
  DashboardAnalytics,
  EnrolmentReports,
  EventReports,
  ExportStrategyPanel,
  FinanceReports,
  ManagementReports,
  ParentStudentReports,
  ReportMetricGrid,
  ReportsHero,
} from "@/components/reports/report-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { canViewReports, getReportsDashboardData } from "@/services/reports/report-service";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const profile = await requireUserProfile();

  if (!canViewReports(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Reports and analytics are available to management users only.</p>
      </section>
    );
  }

  try {
    const data = await getReportsDashboardData(profile);

    return (
      <div className="space-y-6">
        <ReportsHero generatedAt={data.generatedAt} />
        <ReportMetricGrid data={data} />
        <DashboardAnalytics data={data} />
        <ManagementReports data={data} />
        <AttendanceReports data={data} />
        <FinanceReports data={data} />
        <EnrolmentReports data={data} />
        <EventReports data={data} />
        <ParentStudentReports data={data} />
        <ExportStrategyPanel />
      </div>
    );
  } catch {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <p className="text-sm font-semibold text-accent">Reports & analytics</p>
        <h1 className="mt-2 text-2xl font-semibold">Reporting views are not ready</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Apply the Phase 12 reporting views migration, then reload this page to view management reports.
        </p>
      </section>
    );
  }
}
