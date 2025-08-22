import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
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

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, currentDate]);

  const fetchTransactions = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
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
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedTransactions = data.map(transaction => ({
        ...transaction,
        type: transaction.type as 'income' | 'expense',
        category: transaction.categories,
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getTransactionsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return transactions.filter(t => t.date === dateStr);
  };

  const getDayTotal = (day: number) => {
    const dayTransactions = getTransactionsForDate(day);
    return dayTransactions.reduce((total, t) => {
      return total + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  };

  const getSelectedDateTransactions = () => {
    if (!selectedDate) return [];
    return transactions.filter(t => t.date === selectedDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const monthTotal = transactions.reduce((total, t) => {
    return total + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const monthIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((total, t) => total + t.amount, 0);

  const monthExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((total, t) => total + t.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        
        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Calendar View
                </h1>
                <p className="text-muted-foreground">
                  Track your transactions by date
                </p>
              </div>
            </div>
            <ProfileDropdown />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <CardTitle>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Monthly total: {monthTotal >= 0 ? '+' : ''}{formatCurrency(monthTotal)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="h-8 bg-muted rounded" />
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth().map((day, index) => {
                        if (!day) {
                          return <div key={index} className="h-20" />;
                        }

                        const dayTransactions = getTransactionsForDate(day);
                        const dayTotal = getDayTotal(day);
                        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                          .toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        const isToday = new Date().toDateString() === 
                          new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                        return (
                          <div
                            key={day}
                            className={`h-20 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isSelected 
                                ? 'bg-primary/10 border-primary' 
                                : isToday 
                                ? 'bg-accent/10 border-accent' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleDateClick(day)}
                          >
                            <div className="text-sm font-medium">{day}</div>
                            {dayTransactions.length > 0 && (
                              <div className="mt-1">
                                <div className={`text-xs font-medium ${
                                  dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {dayTotal >= 0 ? '+' : ''}{formatCurrency(Math.abs(dayTotal))}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {dayTransactions.slice(0, 3).map((transaction, i) => (
                                    <div
                                      key={i}
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: transaction.category.color }}
                                    />
                                  ))}
                                  {dayTransactions.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{dayTransactions.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sidebar with month stats and selected date transactions */}
            <div className="space-y-6">
              {/* Month Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Month Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Income</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(monthIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Expenses</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(monthExpenses)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Net Total</span>
                    <span className={`font-bold ${monthTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthTotal >= 0 ? '+' : ''}{formatCurrency(monthTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Transactions */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    <CardDescription>
                      {getSelectedDateTransactions().length} transaction{getSelectedDateTransactions().length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getSelectedDateTransactions().length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No transactions on this date
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {getSelectedDateTransactions().map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                style={{ backgroundColor: `${transaction.category.color}20` }}
                              >
                                {transaction.category.icon}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">{transaction.category.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold text-sm ${
                                transaction.type === 'income' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                                {transaction.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}