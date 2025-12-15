-- Drop the existing unique constraint on user_id only
ALTER TABLE public.trader_archetype DROP CONSTRAINT IF EXISTS trader_archetype_user_id_key;

-- Add a unique constraint on the combination of user_id and account_id
CREATE UNIQUE INDEX trader_archetype_user_account_unique ON public.trader_archetype (user_id, account_id) WHERE account_id IS NOT NULL;
CREATE UNIQUE INDEX trader_archetype_user_null_account_unique ON public.trader_archetype (user_id) WHERE account_id IS NULL;