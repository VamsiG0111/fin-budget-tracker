import { useState, useEffect } from 'react';
import { SpendingTrends } from '@/components/analytics/SpendingTrends';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';
import { InsightsCards } from '@/components/analytics/InsightsCards';
import { SmartInsights } from '@/components/analytics/SmartInsights';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';
import { useMonth } from '@/contexts/MonthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { selectedMonth, selectedYear, monthName } = useMonth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedMonth, selectedYear, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let transactionData;
      let transactionError;

      if (viewMode === 'monthly') {
        // Calculate date range for selected month
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        // Load transactions for SELECTED MONTH only
        const result = await supabase
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
          .gte('date', startDate)
          .lt('date', endDate)
          .order('date', { ascending: false })
          .limit(1000);
        
        transactionData = result.data;
        transactionError = result.error;
      } else {
        // Load all transactions for the selected year (annual view)
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear + 1}-01-01`;
        
        const result = await supabase
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
          .gte('date', startDate)
          .lt('date', endDate)
          .order('date', { ascending: false })
          .limit(10000);
        
        transactionData = result.data;
        transactionError = result.error;
      }

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

  // Updated monthly trends data based on view mode
  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (viewMode === 'annual') {
    // For annual view, show all 12 months of the selected year
    months.forEach((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === selectedYear && transactionDate.getMonth() === index;
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
  } else {
    // For monthly view, show context around selected month
    for (let i = 5; i >= 0; i--) {
      let month = selectedMonth - i;
      let year = selectedYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const isSelected = month === selectedMonth && year === selectedYear;
      
      monthlyData.push({
        month: months[month - 1],
        income: isSelected ? totalIncome : 0,
        expenses: isSelected ? totalExpenses : 0,
        savings: isSelected ? savings : 0,
      });
    }
  }

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
      const currentMonth = selectedMonth;
      const currentYear = selectedYear;

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

  const getAnalysisTitle = () => {
    if (viewMode === 'monthly') {
      return `Analytics for ${monthName} ${selectedYear}`;
    } else {
      return `Annual Analytics for ${selectedYear}`;
    }
  };

  const getAnalysisDescription = () => {
    if (viewMode === 'monthly') {
      return `Comprehensive insights for ${monthName} ${selectedYear}`;
    } else {
      return `Year-to-date cumulative analysis for ${selectedYear}`;
    }
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
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">{getAnalysisTitle()}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {getAnalysisDescription()}
          </p>
        </div>
        <Button
          variant={viewMode === 'annual' ? 'default' : 'outline'}
          onClick={() => setViewMode(viewMode === 'monthly' ? 'annual' : 'monthly')}
          className="gap-2"
        >
          {viewMode === 'monthly' ? (
            <>
              <TrendingUp className="w-4 h-4" />
              View Annual Analysis
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              View Monthly Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InsightsCards data={insightsData} />

          <div className="grid gap-4 lg:grid-cols-2">
            <SpendingTrends data={monthlyData} />
            <ExpenseChart data={expensePieData} />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <SmartInsights 
            data={insightsData}
            categories={expensesByCategory}
            trends={{
              incomeGrowth: 0, // You can calculate this based on historical data
              expenseGrowth: 0, // You can calculate this based on historical data
              consistentCategories: expensesByCategory.slice(0, 3).map(cat => cat.name)
            }}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryBreakdown 
              data={expensesByCategory}
              title="Detailed Expense Analysis"
              description={viewMode === 'monthly' ? `Spending breakdown for ${monthName}` : `Annual spending breakdown for ${selectedYear}`}
            />
            {incomeByCategory.length > 0 && (
              <CategoryBreakdown 
                data={incomeByCategory}
                title="Income Sources Analysis"
                description={viewMode === 'monthly' ? `Income breakdown for ${monthName}` : `Annual income breakdown for ${selectedYear}`}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}