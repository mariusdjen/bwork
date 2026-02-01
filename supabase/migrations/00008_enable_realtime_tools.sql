-- Enable Realtime on the tools table so that postgres_changes subscriptions work.
-- Supabase requires tables to be added to the supabase_realtime publication
-- and to have REPLICA IDENTITY FULL for UPDATE payloads to include all columns.

ALTER TABLE public.tools REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tools;
