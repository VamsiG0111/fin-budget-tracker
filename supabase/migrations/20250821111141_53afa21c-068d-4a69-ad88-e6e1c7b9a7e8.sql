-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📝',
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories" 
ON public.categories 
FOR ALL 
USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" 
ON public.transactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Enable RLS on budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets
CREATE POLICY "Users can view their own budgets" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets" 
ON public.budgets 
FOR ALL 
USING (auth.uid() = user_id);

-- Insert default categories for new users
INSERT INTO public.categories (user_id, name, icon, color, is_custom) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Food & Dining', '🍽️', '#f59e0b', false),
  ('00000000-0000-0000-0000-000000000000', 'Transportation', '🚗', '#3b82f6', false),
  ('00000000-0000-0000-0000-000000000000', 'Shopping', '🛍️', '#ec4899', false),
  ('00000000-0000-0000-0000-000000000000', 'Entertainment', '🎬', '#8b5cf6', false),
  ('00000000-0000-0000-0000-000000000000', 'Bills & Utilities', '💡', '#ef4444', false),
  ('00000000-0000-0000-0000-000000000000', 'Healthcare', '🏥', '#10b981', false),
  ('00000000-0000-0000-0000-000000000000', 'Education', '📚', '#f97316', false),
  ('00000000-0000-0000-0000-000000000000', 'Investments', '📈', '#06b6d4', false),
  ('00000000-0000-0000-0000-000000000000', 'Salary', '💰', '#22c55e', false),
  ('00000000-0000-0000-0000-000000000000', 'Miscellaneous', '📝', '#6b7280', false);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Copy default categories for the new user
  INSERT INTO public.categories (user_id, name, icon, color, is_custom)
  SELECT NEW.id, name, icon, color, is_custom
  FROM public.categories 
  WHERE user_id = '00000000-0000-0000-0000-000000000000';
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();