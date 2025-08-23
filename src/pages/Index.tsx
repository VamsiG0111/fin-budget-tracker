import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { IncomeChart } from '@/components/dashboard/IncomeChart';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load transactions with categories
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50);

      if (transactionError) throw transactionError;

      const formattedTransactions = transactionData.map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense',
        category: transaction.categories,
      }));

      setTransactions(formattedTransactions);

      // Load categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (categoryError) throw categoryError;
      setCategories(categoryData);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setIsAddDialogOpen(false);
    loadData();
    toast({
      title: "Success",
      description: "Transaction added successfully!",
    });
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = totalIncome - totalExpenses;

  // Prepare chart data
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense' && t.category.id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: category.name,
      value: categoryExpenses,
      color: category.color,
    };
  }).filter(item => item.value > 0);

  // Prepare monthly data for income chart
  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  months.forEach((month, index) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === index;
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyData.push({
      month,
      income: monthIncome,
      expenses: monthExpenses,
    });
  });

  // Mock budget data for now (can be enhanced later)
  const budgetData = categories.map(category => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: category.name,
      spent,
      budget: spent * 1.2, // Mock budget as 120% of spent for demonstration
      icon: category.icon,
    };
  }).filter(item => item.spent > 0);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col ml-2">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b glass px-4 sticky top-0 z-40">
              <div className="flex-1">
                <h1 className="text-2xl font-bold gradient-text-primary">Budget Tracker</h1>
              </div>
              <ProfileDropdown />
            </header>
            <main className="flex-1 p-4 lg:p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col ml-2">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b glass px-4 sticky top-0 z-40">
            <div className="flex-1">
              <h1 className="text-2xl font-bold gradient-text-primary">Budget Tracker</h1>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
            <ProfileDropdown />
          </header>

          <main className="flex-1 p-4 lg:p-6 space-y-6">
            <DashboardHeader 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              savings={savings}
            />
            
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <ExpenseChart data={expensesByCategory} />
                  <BudgetProgress categories={budgetData} />
                </div>
                <IncomeChart data={monthlyData} />
              </div>
              
              <div className="space-y-6">
                <RecentTransactions 
                  transactions={transactions.slice(0, 8)} 
                  categories={categories}
                  onRefresh={loadData}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      <TransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleTransactionAdded}
        categories={categories}
      />
    </SidebarProvider>
  );
};

export default Index;