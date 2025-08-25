import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { BudgetDialog } from '@/components/budget/BudgetDialog';

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
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);

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
    loadData(); // This will reload everything including budget data
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

  // Load real budget data
  const [budgetData, setBudgetData] = useState<Array<{name: string; spent: number; budget: number; icon: string;}>>([]);

  const loadBudgetData = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) throw error;

      const budgetMap = new Map(budgets.map(b => [b.category_id, b.amount]));

      const budgetProgress = categories.map(category => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category.id === category.id)
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const budget = budgetMap.get(category.id) || 0;
        
        return {
          name: category.name,
          spent,
          budget,
          icon: category.icon,
        };
      }).filter(item => item.budget > 0);

      setBudgetData(budgetProgress);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  useEffect(() => {
    if (user && categories.length > 0 && transactions.length > 0) {
      loadBudgetData();
    }
  }, [user, categories, transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsBudgetDialogOpen(true)}
          >
            🎯 Set Budget Goals
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

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

      <TransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleTransactionAdded}
        categories={categories}
      />

      <BudgetDialog
        isOpen={isBudgetDialogOpen}
        onClose={() => setIsBudgetDialogOpen(false)}
        onSuccess={() => {
          setIsBudgetDialogOpen(false);
          loadBudgetData();
          toast({
            title: "Success",
            description: "Budget goals updated successfully!",
          });
        }}
        categories={categories}
      />
    </div>
  );
};

export default Index;