-- Little London Management System
-- Seed roles, permissions, and role-permission mappings.
-- Safe to run multiple times.

insert into public.roles (name, display_name, description, is_system_role, status)
values
  ('super_admin', 'Super Admin', 'Full platform access across all current and future branches.', true, 'active'),
  ('admin', 'Admin', 'Management role for daily school operations.', true, 'active'),
  ('teacher', 'Teacher', 'Teaching staff access for assigned classes and students.', true, 'active'),
  ('parent', 'Parent', 'Parent portal access for own family and own child information.', true, 'active')
on conflict (name) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_system_role = excluded.is_system_role,
  status = excluded.status;

insert into public.permissions (module, action, scope, key, description, is_system_permission)
values
  ('auth', 'view', 'own', 'auth.view.own', 'View own authenticated session and profile basics.', true),
  ('parents', 'view', 'own', 'parents.view.own', 'Parent may view own profile.', true),
  ('parents', 'edit', 'own', 'parents.edit.own', 'Parent may edit own contact profile fields.', true),
  ('students', 'view', 'own_child', 'students.view.own_child', 'Parent may view own linked children.', true),
  ('notifications', 'edit', 'own', 'notifications.edit.own', 'User may mark own notifications read or archived.', true),
  ('students', 'view', 'assigned_students', 'students.view.assigned_students', 'Teacher may view assigned students.', true),
  ('parents', 'view', 'assigned_students', 'parents.view.assigned_students_limited', 'Teacher may view limited parent contacts for assigned students.', true),
  ('courses', 'view', 'assigned_classes', 'courses.view.assigned_classes', 'Teacher may view assigned courses.', true),
  ('classes', 'view', 'assigned_classes', 'classes.view.assigned_classes', 'Teacher may view assigned classes.', true),
  ('attendance', 'create', 'assigned_classes', 'attendance.create.assigned_classes', 'Teacher may mark attendance for assigned classes.', true),
  ('attendance', 'edit', 'assigned_classes', 'attendance.edit.assigned_classes_same_day', 'Teacher may edit same-day attendance before review.', true),
  ('teacher_remarks', 'create', 'assigned_students', 'teacher_remarks.create.assigned_students', 'Teacher may create remarks for assigned students.', true),
  ('teacher_remarks', 'edit', 'own', 'teacher_remarks.edit.own_pending', 'Teacher may edit own pending remarks.', true),
  ('students', 'manage', 'all', 'students.manage.all', 'Management can manage all student records.', true),
  ('parents', 'manage', 'all', 'parents.manage.all', 'Management can manage all parent records.', true),
  ('teachers', 'manage', 'all', 'teachers.manage.all', 'Management can manage teacher records.', true),
  ('courses', 'manage', 'all', 'courses.manage.all', 'Management can manage course records.', true),
  ('classes', 'manage', 'all', 'classes.manage.all', 'Management can manage class records.', true),
  ('classes', 'assign', 'all', 'classes.assign.all', 'Management can assign classes.', true),
  ('enrolments', 'manage', 'all', 'enrolments.manage.all', 'Management can manage student enrolments.', true),
  ('attendance', 'manage', 'all', 'attendance.manage.all', 'Management can manage all attendance records.', true),
  ('attendance', 'view', 'assigned_classes', 'attendance.view.assigned_classes', 'Teacher may view attendance for assigned classes.', true),
  ('attendance', 'approve', 'all', 'attendance.approve.all', 'Management can approve or review attendance.', true),
  ('teacher_remarks', 'approve', 'all', 'teacher_remarks.approve.all', 'Management can approve teacher remarks.', true),
  ('documents', 'manage', 'all', 'documents.manage.all', 'Management can manage documents.', true),
  ('medical_records', 'manage', 'all', 'medical_records.manage.all', 'Management can manage medical record data.', true),
  ('invoices', 'manage', 'all', 'invoices.manage.all', 'Management can manage invoices.', true),
  ('payments', 'manage', 'all', 'payments.manage.all', 'Management can manage payments.', true),
  ('reports', 'export', 'all', 'reports.export.all', 'Management can export reports.', true),
  ('user_management', 'manage', 'all', 'user_management.manage.all', 'Super Admin can manage all users.', true),
  ('user_management', 'manage', 'branch', 'user_management.manage.all_non_super_admin', 'Admin can manage non-Super-Admin users within the current school scope.', true),
  ('settings', 'manage', 'all', 'settings.manage.all', 'Super Admin can manage system settings.', true),
  ('audit_logs', 'view', 'all', 'audit_logs.view.all', 'Super Admin can view audit logs.', true)
on conflict (key) do update set
  module = excluded.module,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description,
  is_system_permission = excluded.is_system_permission;

with role_permission_keys(role_name, permission_key) as (
  values
    ('parent', 'auth.view.own'),
    ('parent', 'parents.view.own'),
    ('parent', 'parents.edit.own'),
    ('parent', 'students.view.own_child'),
    ('parent', 'notifications.edit.own'),
    ('teacher', 'auth.view.own'),
    ('teacher', 'students.view.assigned_students'),
    ('teacher', 'parents.view.assigned_students_limited'),
    ('teacher', 'courses.view.assigned_classes'),
    ('teacher', 'classes.view.assigned_classes'),
    ('teacher', 'attendance.view.assigned_classes'),
    ('teacher', 'attendance.create.assigned_classes'),
    ('teacher', 'attendance.edit.assigned_classes_same_day'),
    ('teacher', 'teacher_remarks.create.assigned_students'),
    ('teacher', 'teacher_remarks.edit.own_pending'),
    ('admin', 'auth.view.own'),
    ('admin', 'students.manage.all'),
    ('admin', 'parents.manage.all'),
    ('admin', 'teachers.manage.all'),
    ('admin', 'courses.manage.all'),
    ('admin', 'classes.manage.all'),
    ('admin', 'classes.assign.all'),
    ('admin', 'enrolments.manage.all'),
    ('admin', 'attendance.manage.all'),
    ('admin', 'attendance.approve.all'),
    ('admin', 'teacher_remarks.approve.all'),
    ('admin', 'documents.manage.all'),
    ('admin', 'medical_records.manage.all'),
    ('admin', 'invoices.manage.all'),
    ('admin', 'payments.manage.all'),
    ('admin', 'reports.export.all'),
    ('admin', 'user_management.manage.all_non_super_admin'),
    ('super_admin', 'auth.view.own'),
    ('super_admin', 'students.manage.all'),
    ('super_admin', 'parents.manage.all'),
    ('super_admin', 'teachers.manage.all'),
    ('super_admin', 'courses.manage.all'),
    ('super_admin', 'classes.manage.all'),
    ('super_admin', 'classes.assign.all'),
    ('super_admin', 'enrolments.manage.all'),
    ('super_admin', 'attendance.manage.all'),
    ('super_admin', 'attendance.approve.all'),
    ('super_admin', 'teacher_remarks.approve.all'),
    ('super_admin', 'documents.manage.all'),
    ('super_admin', 'medical_records.manage.all'),
    ('super_admin', 'invoices.manage.all'),
    ('super_admin', 'payments.manage.all'),
    ('super_admin', 'reports.export.all'),
    ('super_admin', 'user_management.manage.all'),
    ('super_admin', 'settings.manage.all'),
    ('super_admin', 'audit_logs.view.all')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_keys rpk
join public.roles r on r.name = rpk.role_name
join public.permissions p on p.key = rpk.permission_key
on conflict (role_id, permission_id) do nothing;
