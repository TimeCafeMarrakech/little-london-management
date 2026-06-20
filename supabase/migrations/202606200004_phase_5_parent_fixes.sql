-- Little London Management System
-- Phase 5 fixes: parent RLS hardening and normalized relationship integrity.

drop policy if exists "parents_own_portal_update" on public.parents;

with duplicate_active_relationships as (
  select
    id,
    row_number() over (
      partition by parent_id, student_id
      order by is_primary_contact desc, created_at asc, id asc
    ) as duplicate_rank
  from public.parent_student_relationships
  where parent_id is not null
    and deleted_at is null
)
update public.parent_student_relationships psr
set
  status = 'archived',
  deleted_at = now(),
  updated_at = now()
from duplicate_active_relationships duplicate
where psr.id = duplicate.id
  and duplicate.duplicate_rank > 1;

create unique index if not exists parent_student_relationships_parent_student_active_key
on public.parent_student_relationships(parent_id, student_id)
where parent_id is not null and deleted_at is null;
