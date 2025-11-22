-- Create trades table to store imported trading data
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket text NOT NULL,
  open_time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  size decimal NOT NULL,
  symbol text NOT NULL,
  open_price decimal NOT NULL,
  close_time timestamptz NOT NULL,
  close_price decimal NOT NULL,
  commission decimal DEFAULT 0,
  swap decimal DEFAULT 0,
  profit decimal NOT NULL,
  net_profit decimal NOT NULL,
  duration decimal NOT NULL,
  is_win boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read trades (public app)
CREATE POLICY "Anyone can view trades"
  ON public.trades
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert trades (public app)
CREATE POLICY "Anyone can insert trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to delete trades (public app)
CREATE POLICY "Anyone can delete trades"
  ON public.trades
  FOR DELETE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_trades_close_time ON public.trades(close_time DESC);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);