-- Add payment source fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_source TEXT CHECK (payment_source IN ('savings', 'credit')) DEFAULT 'savings',
ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES public.liabilities(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_payment_source ON public.transactions(payment_source);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id ON public.transactions(credit_card_id);

-- Update assets table to include receivables category
ALTER TABLE public.assets 
DROP CONSTRAINT IF EXISTS assets_category_check;

ALTER TABLE public.assets 
ADD CONSTRAINT assets_category_check 
CHECK (category IN ('savings', 'investment', 'property', 'receivables', 'other'));
