-- RLS policies for public.idempotency_keys
-- We want only backend (service_role) to read/insert/delete.
-- Idempotent: drop existing policies then recreate.

alter table if exists public.idempotency_keys enable row level security;

drop policy if exists idempotency_keys_read_service on public.idempotency_keys;
create policy idempotency_keys_read_service on public.idempotency_keys
for select to service_role using (true);

drop policy if exists idempotency_keys_insert_service on public.idempotency_keys;
create policy idempotency_keys_insert_service on public.idempotency_keys
for insert to service_role with check (true);

drop policy if exists idempotency_keys_delete_service on public.idempotency_keys;
create policy idempotency_keys_delete_service on public.idempotency_keys
for delete to service_role using (true);


