-- Canonical transaction state machines enforced at the database layer.
-- Deposits / withdrawals: pending -> completed | failed
-- Advances: pending -> completed | failed; completed -> liquidated

create or replace function seyf_is_valid_transaction_transition(
  p_entity_type text,
  p_from_status text,
  p_to_status text
) returns boolean
language plpgsql
immutable
as $$
begin
  if p_from_status is null then
    return p_to_status in ('pending', 'completed', 'failed', 'liquidated');
  end if;

  if p_from_status = p_to_status then
    return true;
  end if;

  if p_entity_type = 'deposit' then
    return (p_from_status = 'pending' and p_to_status in ('completed', 'failed'));
  end if;

  if p_entity_type = 'withdrawal' then
    return (p_from_status = 'pending' and p_to_status in ('completed', 'failed'));
  end if;

  if p_entity_type = 'advance' then
    return (
      (p_from_status = 'pending' and p_to_status in ('completed', 'failed'))
      or (p_from_status = 'completed' and p_to_status = 'liquidated')
    );
  end if;

  return false;
end;
$$;

create or replace function seyf_log_transaction_event()
returns trigger
language plpgsql
as $$
declare
  v_entity_type text := tg_argv[0];
  v_actor text := coalesce(nullif(current_setting('seyf.actor', true), ''), 'system');
  v_from_status text;
  v_to_status text;
begin
  if tg_op = 'INSERT' then
    v_from_status := null;
    v_to_status := new.status;

    if not seyf_is_valid_transaction_transition(v_entity_type, v_from_status, v_to_status) then
      raise exception 'invalid initial status % for %', v_to_status, v_entity_type
        using errcode = '23514';
    end if;

    insert into transaction_events (
      entity_type,
      entity_id,
      from_status,
      to_status,
      actor
    ) values (
      v_entity_type,
      new.id,
      v_from_status,
      v_to_status,
      v_actor
    );

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      if not seyf_is_valid_transaction_transition(v_entity_type, old.status, new.status) then
        raise exception 'invalid status transition for %: % -> %', v_entity_type, old.status, new.status
          using errcode = '23514';
      end if;

      insert into transaction_events (
        entity_type,
        entity_id,
        from_status,
        to_status,
        actor
      ) values (
        v_entity_type,
        new.id,
        old.status,
        new.status,
        v_actor
      );
    end if;

    new.updated_at := now();
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists deposits_state_machine on deposits;
create trigger deposits_state_machine
  before insert or update on deposits
  for each row
  execute function seyf_log_transaction_event('deposit');

drop trigger if exists advances_state_machine on advances;
create trigger advances_state_machine
  before insert or update on advances
  for each row
  execute function seyf_log_transaction_event('advance');

drop trigger if exists withdrawals_state_machine on withdrawals;
create trigger withdrawals_state_machine
  before insert or update on withdrawals
  for each row
  execute function seyf_log_transaction_event('withdrawal');
