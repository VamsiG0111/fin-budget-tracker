-- Create liabilities table
CREATE TABLE IF NOT EXISTS public.liabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('credit_card', 'personal_loan', 'bills', 'overdraft', 'emi', 'other')),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    due_date DATE,
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_category ON public.liabilities(category);
CREATE INDEX IF NOT EXISTS idx_liabilities_due_date ON public.liabilities(due_date);

-- Enable Row Level Security
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for liabilities
CREATE POLICY "Users can view their own liabilities" ON public.liabilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liabilities" ON public.liabilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities" ON public.liabilities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities" ON public.liabilities
    FOR DELETE USING (auth.uid() = user_id);
