export type UserRole = "super_admin" | "admin" | "teacher" | "parent";

export type AccountStatus = "pending" | "active" | "suspended" | "disabled" | "archived";

export type UserProfile = {
  id: string;
  branchId: string | null;
  roleId: string;
  role: UserRole;
  roleDisplayName: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: AccountStatus;
  permissions: string[];
};

export type AuthResult<TData = unknown> =
  | {
      success: true;
      message: string;
      data: TData;
    }
  | {
      success: false;
      message: string;
      errorCode: "unauthorized" | "forbidden" | "validation_failed" | "profile_missing" | "internal_error";
    };
