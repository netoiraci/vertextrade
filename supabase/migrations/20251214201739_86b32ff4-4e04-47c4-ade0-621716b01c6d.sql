-- 1. Create trading_accounts table for sub-accounts
CREATE TABLE public.trading_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 100000,
  daily_loss_limit NUMERIC NOT NULL DEFAULT 5000,
  max_drawdown_limit NUMERIC NOT NULL DEFAULT 10000,
  broker_utc_offset INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trading_accounts
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for trading_accounts
CREATE POLICY "Users can view their own accounts" 
ON public.trading_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.trading_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.trading_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.trading_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_trading_accounts_updated_at
BEFORE UPDATE ON public.trading_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add account_id to trades table (nullable for backward compatibility)
ALTER TABLE public.trades ADD COLUMN account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE;

-- 3. Create archetype_history table
CREATE TABLE public.archetype_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  archetype_name TEXT NOT NULL,
  archetype_description TEXT NOT NULL,
  archetype_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on archetype_history
ALTER TABLE public.archetype_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for archetype_history
CREATE POLICY "Users can view their own archetype history" 
ON public.archetype_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own archetype history" 
ON public.archetype_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archetype history" 
ON public.archetype_history FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create mentor_analyses table for saving AI insights
CREATE TABLE public.mentor_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL DEFAULT 'percepcoes',
  analysis_content TEXT NOT NULL,
  period_filter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mentor_analyses
ALTER TABLE public.mentor_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_analyses
CREATE POLICY "Users can view their own analyses" 
ON public.mentor_analyses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.mentor_analyses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.mentor_analyses FOR DELETE 
USING (auth.uid() = user_id);

-- Add account_id to trader_archetype for current archetype per account
ALTER TABLE public.trader_archetype ADD COLUMN account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE;