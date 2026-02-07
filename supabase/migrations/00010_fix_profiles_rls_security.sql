-- Migration 00010: Fix profiles RLS — prevent users from modifying sensitive columns
-- Addresses CRITICAL security issue: users could self-upgrade their plan via client SDK

-- Drop the overly permissive update policy
drop policy if exists profiles_update_own on public.profiles;

-- Recreate with column protection:
-- Users can only update their own row AND cannot change plan, stripe_customer_id, or tools_active_count
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent modification of sensitive billing/plan columns
    and plan = (select p.plan from public.profiles p where p.id = auth.uid())
    and stripe_customer_id is not distinct from (select p.stripe_customer_id from public.profiles p where p.id = auth.uid())
    and tools_active_count = (select p.tools_active_count from public.profiles p where p.id = auth.uid())
  );
