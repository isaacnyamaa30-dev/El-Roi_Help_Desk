-- ============================================================================
--  EL-ROI Services — 0009_drop_helpdesk
--  The application no longer uses any help-desk concepts. Drop the legacy
--  tables, functions and sequence. Shared helpers created in 0001
--  (set_updated_at, current_user_role, is_staff, is_admin, handle_new_user,
--  guard_profile_update) are kept — the new schema depends on them.
--
--  All ticket data was demo/seed data. There is nothing to preserve.
-- ============================================================================

drop trigger if exists trg_tickets_number         on public.tickets;
drop trigger if exists trg_tickets_updated_at      on public.tickets;
drop trigger if exists trg_tickets_timestamps      on public.tickets;
drop trigger if exists trg_tickets_history_ins     on public.tickets;
drop trigger if exists trg_tickets_history_upd     on public.tickets;
drop trigger if exists trg_tickets_guard           on public.tickets;
drop trigger if exists trg_ticket_messages_updated_at        on public.ticket_messages;
drop trigger if exists trg_ticket_messages_after_insert      on public.ticket_messages;

drop table if exists public.ticket_history  cascade;
drop table if exists public.ticket_messages cascade;
drop table if exists public.tickets         cascade;

drop function if exists public.set_ticket_number()            cascade;
drop function if exists public.maintain_ticket_timestamps()   cascade;
drop function if exists public.record_ticket_history()        cascade;
drop function if exists public.on_ticket_message()            cascade;
drop function if exists public.guard_ticket_update()          cascade;

drop sequence if exists public.ticket_number_seq;
