-- Ensure service_role can execute the 5-arg grant_tokens function (with kind)
-- Safe to run multiple times

do $$
begin
  execute 'grant execute on function grant_tokens(uuid, bigint, text, jsonb, credit_grant_kind) to service_role';
exception when others then
  -- ignore if function does not exist yet
  null;
end$$;


