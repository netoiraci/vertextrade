-- Create table to store trader archetype
CREATE TABLE public.trader_archetype (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  archetype_name TEXT NOT NULL,
  archetype_description TEXT NOT NULL,
  archetype_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trader_archetype ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own archetype" 
ON public.trader_archetype 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own archetype" 
ON public.trader_archetype 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own archetype" 
ON public.trader_archetype 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archetype" 
ON public.trader_archetype 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trader_archetype_updated_at
BEFORE UPDATE ON public.trader_archetype
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();