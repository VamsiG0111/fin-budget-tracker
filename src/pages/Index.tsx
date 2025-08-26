import { useState, useEffect } from 'react';
import { Plus, CalendarDays, Calendar } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { TopSpendingCategories } from '@/components/dashboard/TopSpendingCategories';
import { IncomeChart } from '@/components/dashboard/IncomeChart';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BudgetDialog } from '@/components/budget/BudgetDialog';
import { cn } from '@/lib/utils';
import { useMonth } from '@/contexts/MonthContext';

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
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, monthName } = useMonth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedMonth, selectedYear]);

  // Auto-transfer savings to assets on first day of next month
  const checkAndTransferMonthEndSavings = async (currentTransactions: Transaction[]) => {
    const now = new Date();
    const isFirstDayOfMonth = now.getDate() === 1;
    
    if (isFirstDayOfMonth) {
      // Calculate previous month
      let previousMonth = now.getMonth(); // This gives us previous month (0-based)
      let previousYear = now.getFullYear();
      
      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear = previousYear - 1;
      }
      
      // Only process if we have transactions from previous month
      if (currentTransactions.length > 0) {
        const monthlyIncome = currentTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlyExpenses = currentTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlySavings = monthlyIncome - monthlyExpenses;

        if (monthlySavings > 0) {
          try {
            // Check if savings already transferred for previous month
            const { data: existingSavings } = await supabase
              .from('assets')
              .select('*')
              .eq('user_id', user?.id)
              .eq('category', 'savings')
              .ilike('name', `%${months[previousMonth - 1]} ${previousYear}%`)
              .single();

            if (!existingSavings) {
              await supabase
                .from('assets')
                .insert({
                  user_id: user?.id,
                  name: `Monthly Savings - ${months[previousMonth - 1]} ${previousYear}`,
                  category: 'savings',
                  amount: monthlySavings,
                  description: `Auto-transferred savings for ${months[previousMonth - 1]} ${previousYear} (Income: ${formatCurrency(monthlyIncome)} - Expenses: ${formatCurrency(monthlyExpenses)})`
                });

              toast({
                title: "Previous Month Complete! 🎉",
                description: `${formatCurrency(monthlySavings)} from ${months[previousMonth - 1]} automatically added to your assets!`,
              });
            }
          } catch (error) {
            console.error('Error transferring month-end savings:', error);
          }
        }
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range for selected month
      const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      
      // Load transactions for SELECTED MONTH only
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
        .gte('date', startDate)
        .lt('date', endDate)
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

      // Check for auto-transfer on first day of month
      await checkAndTransferMonthEndSavings(formattedTransactions);

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

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleTransactionAdded = () => {
    setIsAddDialogOpen(false);
    loadData(); // This will reload everything including budget data
    toast({
      title: "Success",
      description: "Transaction added successfully!",
    });
  };

  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };

  const handleYearChange = (newYear: number) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    // If changing to current year, go to current month
    // If changing to other years, keep current selected month
    if (newYear === currentDate.getFullYear()) {
      setSelectedMonth(currentMonth);
      setSelectedYear(newYear);
    } else {
      setSelectedYear(newYear);
    }
  };

  const CalendarPicker = () => {
    const currentDate = new Date();
    const displayYear = selectedYear;
    
    return (
      <div className="p-4 w-80 bg-gradient-to-br from-background to-muted/50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleYearChange(selectedYear - 1)}
            className="p-2 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-110"
          >
            <span className="text-lg font-bold text-primary">‹</span>
          </button>
          <h3 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {displayYear}
          </h3>
          <button
            onClick={() => handleYearChange(selectedYear + 1)}
            className="p-2 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-110"
          >
            <span className="text-lg font-bold text-primary">›</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {months.map((month, index) => {
            const monthNumber = index + 1;
            const isSelected = selectedMonth === monthNumber && selectedYear === displayYear;
            const isCurrent = currentDate.getMonth() + 1 === monthNumber && currentDate.getFullYear() === displayYear;
            
            return (
              <button
                key={month}
                onClick={() => handleMonthSelect(monthNumber, displayYear)}
                className={cn(
                  "p-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-110 hover:rotate-1",
                  "border-2 backdrop-blur-sm",
                  isSelected
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl scale-110 border-primary/30"
                    : isCurrent
                    ? "bg-gradient-to-r from-accent/20 to-primary/20 text-primary border-primary/40 shadow-lg"
                    : "bg-card/60 hover:bg-accent/30 border-border/50 hover:border-primary/30 hover:shadow-lg"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{month}</span>
                  {isCurrent && <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>}
                  {isSelected && <div className="w-2 h-0.5 bg-current rounded-full"></div>}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">Selected: <span className="text-primary">{months[selectedMonth - 1]} {selectedYear}</span></span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate totals for SELECTED MONTH only (fresh calculation)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = totalIncome - totalExpenses;

  // Prepare chart data for selected month context
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

  // Prepare monthly data showing selected month context
  const monthlyData = [];
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
    });
  }

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

      // Only include categories that have transactions
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
      }).filter(item => item.spent > 0); // Changed from item.budget > 0 to item.spent > 0

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
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>Viewing: {monthName} {selectedYear}</span>
        </div>
        <div className="flex items-center gap-2">
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

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-10 p-0 hover:bg-accent hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg border-2 hover:border-primary/30"
              >
                <Calendar className="h-5 w-5 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto border-2 border-primary/20 shadow-2xl" align="end">
              <CalendarPicker />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DashboardHeader
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        savings={savings} />
        
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseChart 
              data={expensesByCategory}
              title="Monthly Expenses Overview"
              description="Current month spending by category"
            />
            <TopSpendingCategories 
              categories={budgetData} 
              transactions={transactions.map(t => ({
                type: t.type,
                amount: t.amount,
                payment_source: (t as any).payment_source ?? null
              }))}
            />
          </div>
          <IncomeChart data={monthlyData} />
        </div>

        <div className="space-y-6">
          <RecentTransactions 
            transactions={transactions} 
            categories={categories}
            onRefresh={loadData}
          />
        </div>
      </div>

      <TransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleTransactionAdded}
        categories={categories} />
        
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
        categories={categories} />
    </div>
  );
};

export default Index;