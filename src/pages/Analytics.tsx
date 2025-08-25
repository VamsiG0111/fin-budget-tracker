import { useState, useEffect } from 'react';
import { SpendingTrends } from '@/components/analytics/SpendingTrends';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';
import { InsightsCards } from '@/components/analytics/InsightsCards';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        .limit(1000); // Get more data for analytics

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
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Monthly trends data
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
      savings: monthIncome - monthExpenses,
    });
  });

  // Category breakdown data
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense' && t.category.id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: category.name,
      amount: categoryExpenses,
      icon: category.icon,
      color: category.color,
      percentage: totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0,
    };
  }).filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const incomeByCategory = categories.map(category => {
    const categoryIncome = transactions
      .filter(t => t.type === 'income' && t.category.id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: category.name,
      amount: categoryIncome,
      icon: category.icon,
      color: category.color,
      percentage: totalIncome > 0 ? (categoryIncome / totalIncome) * 100 : 0,
    };
  }).filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Expense pie chart data
  const expensePieData = expensesByCategory.map(category => ({
    name: category.name,
    value: category.amount,
    color: category.color,
  }));

  // Budget progress data
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

  // Insights data
  const topExpenseCategory = expensesByCategory.length > 0 ? expensesByCategory[0].name : 'N/A';
  const averageMonthlyExpense = monthlyData.reduce((sum, month) => sum + month.expenses, 0) / 12;
  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0);
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  const insightsData = {
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    topExpenseCategory,
    averageMonthlyExpense,
    budgetUtilization,
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text-primary">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your financial data and spending patterns
        </p>
      </div>

      <InsightsCards data={insightsData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingTrends data={monthlyData} />
        <ExpenseChart data={expensePieData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown 
          data={expensesByCategory}
          title="Expense Breakdown"
          description="Spending by category this year"
        />
        {incomeByCategory.length > 0 && (
          <CategoryBreakdown 
            data={incomeByCategory}
            title="Income Sources"
            description="Income by category this year"
          />
        )}
      </div>

      {budgetData.length > 0 && (
        <BudgetProgress categories={budgetData} />
      )}
    </div>
  );
}