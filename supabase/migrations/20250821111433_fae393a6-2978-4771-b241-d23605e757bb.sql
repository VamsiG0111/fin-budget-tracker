-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Insert default categories for the new user
  INSERT INTO public.categories (user_id, name, icon, color, is_custom) VALUES
    (NEW.id, 'Food & Dining', '🍽️', '#f59e0b', false),
    (NEW.id, 'Transportation', '🚗', '#3b82f6', false),
    (NEW.id, 'Shopping', '🛍️', '#ec4899', false),
    (NEW.id, 'Entertainment', '🎬', '#8b5cf6', false),
    (NEW.id, 'Bills & Utilities', '💡', '#ef4444', false),
    (NEW.id, 'Healthcare', '🏥', '#10b981', false),
    (NEW.id, 'Education', '📚', '#f97316', false),
    (NEW.id, 'Investments', '📈', '#06b6d4', false),
    (NEW.id, 'Salary', '💰', '#22c55e', false),
    (NEW.id, 'Miscellaneous', '📝', '#6b7280', false);
  
  RETURN NEW;
END;
$$;

-- Fix the update function as well
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;