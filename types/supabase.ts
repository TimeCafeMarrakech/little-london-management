export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: "super_admin" | "admin" | "teacher" | "parent";
          display_name: string;
          description: string | null;
          is_system_role: boolean;
          status: "active" | "inactive" | "archived";
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          module: string;
          action: string;
          scope: string;
          key: string;
          description: string | null;
          is_system_permission: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          branch_id: string | null;
          role_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_document_id: string | null;
          status: "pending" | "active" | "suspended" | "disabled" | "archived";
          last_login_at: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
