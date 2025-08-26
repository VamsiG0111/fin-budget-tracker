-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for assets
DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for liabilities
DROP TRIGGER IF EXISTS update_liabilities_updated_at ON public.liabilities;
CREATE TRIGGER update_liabilities_updated_at 
    BEFORE UPDATE ON public.liabilities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
