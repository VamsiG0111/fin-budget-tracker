import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, Home, Car, Briefcase, Receipt, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssetDialog } from './AssetDialog';
import { LiabilityDialog } from './LiabilityDialog';

interface Asset {
  id: string;
  name: string;
  category: 'savings' | 'investment' | 'property' | 'other';
  amount: number;
  description?: string;
}

interface Liability {
  id: string;
  name: string;
  category: 'credit_card' | 'personal_loan' | 'bills' | 'overdraft' | 'emi' | 'other';
  amount: number;
  due_date?: string;
  description?: string;
}

const assetCategories = {
  savings: { icon: Wallet, label: 'Savings & Balance', color: 'text-green-600' },
  investment: { icon: TrendingUp, label: 'Investments', color: 'text-blue-600' },
  property: { icon: Home, label: 'Property', color: 'text-purple-600' },
  other: { icon: Briefcase, label: 'Other Assets', color: 'text-gray-600' }
};

const liabilityCategories = {
  credit_card: { icon: CreditCard, label: 'Credit Cards', color: 'text-red-600' },
  personal_loan: { icon: AlertCircle, label: 'Debts', color: 'text-orange-600' },
  bills: { icon: Clock, label: 'Loans', color: 'text-purple-600' },
  overdraft: { icon: AlertCircle, label: 'Overdrafts', color: 'text-red-500' },
  emi: { icon: Clock, label: 'EMIs', color: 'text-purple-500' },
  other: { icon: Briefcase, label: 'Other Liabilities', color: 'text-gray-600' }
};

export function FinancesOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLiabilityDialogOpen, setIsLiabilityDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load assets - handle case where table might not exist yet
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user?.id);

      if (assetError && !assetError.message.includes('relation "public.assets" does not exist')) {
        throw assetError;
      }
      setAssets(
        (assetData || []).map((a) => ({
          ...a,
          category: a.category as Asset['category'],
        }))
      );

      // Load liabilities - handle case where table might not exist yet
      const { data: liabilityData, error: liabilityError } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user?.id);

      if (liabilityError && !liabilityError.message.includes('relation "public.liabilities" does not exist')) {
        throw liabilityError;
      }
      setLiabilities(
        (liabilityData || []).map((l) => ({
          ...l,
          category: l.category as Liability['category'],
        }))
      );

    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const AssetCard = ({ asset }: { asset: Asset }) => {
    const category = assetCategories[asset.category];
    const Icon = category.icon;
    
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gray-100 ${category.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">{asset.name}</h4>
                <p className="text-sm text-muted-foreground">{category.label}</p>
                {asset.description && (
                  <p className="text-xs text-muted-foreground">{asset.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{formatCurrency(asset.amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LiabilityCard = ({ liability }: { liability: Liability }) => {
    const category = liabilityCategories[liability.category];
    const Icon = category.icon;
    
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gray-100 ${category.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">{liability.name}</h4>
                <p className="text-sm text-muted-foreground">{category.label}</p>
                {liability.due_date && (
                  <p className="text-xs text-orange-500">Due: {new Date(liability.due_date).toLocaleDateString()}</p>
                )}
                {liability.description && (
                  <p className="text-xs text-muted-foreground">{liability.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-600">{formatCurrency(liability.amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Net Worth Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">Total Assets</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(totalAssets)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-700">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${netWorth >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-red-50 to-red-100 border-red-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className={`w-8 h-8 ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-medium ${netWorth >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-blue-800' : 'text-red-800'}`}>{formatCurrency(netWorth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Assets and Liabilities */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Assets</h3>
            <Button size="sm" className="gap-2" onClick={() => setIsAssetDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Asset
            </Button>
          </div>
          
          {assets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assets added yet</p>
                <p className="text-sm text-muted-foreground">Start by adding your savings, investments, or other assets</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Liabilities</h3>
            <Button size="sm" className="gap-2" onClick={() => setIsLiabilityDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Liability
            </Button>
          </div>
          
          {liabilities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No liabilities added yet</p>
                <p className="text-sm text-muted-foreground">Track your debts, loans, and bills here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {liabilities.map((liability) => (
                <LiabilityCard key={liability.id} liability={liability} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AssetDialog
        isOpen={isAssetDialogOpen}
        onClose={() => setIsAssetDialogOpen(false)}
        onSuccess={loadFinancialData}
      />

      <LiabilityDialog
        isOpen={isLiabilityDialogOpen}
        onClose={() => setIsLiabilityDialogOpen(false)}
        onSuccess={loadFinancialData}
      />
    </div>
  );
}
