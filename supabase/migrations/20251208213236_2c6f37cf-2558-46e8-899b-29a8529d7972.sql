-- Add user_id column to trades table
ALTER TABLE public.trades 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Anyone can view trades" ON public.trades;
DROP POLICY IF EXISTS "Anyone can insert trades" ON public.trades;
DROP POLICY IF EXISTS "Anyone can delete trades" ON public.trades;

-- Create secure RLS policies that restrict access to authenticated users
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" 
ON public.trades 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" 
ON public.trades 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);