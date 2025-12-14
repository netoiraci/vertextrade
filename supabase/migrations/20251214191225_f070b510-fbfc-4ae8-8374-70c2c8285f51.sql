-- Add broker UTC offset column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN broker_utc_offset integer NOT NULL DEFAULT 3;

-- Add comment for documentation
COMMENT ON COLUMN public.user_settings.broker_utc_offset IS 'UTC offset for broker server time (New York Close). Default +3 for brokers with daily candle closing at 17h NY.';