import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SpendingCategory {
  name: string;
  amount: number;
  icon: string;
  color: string;
  percentage: number;
}

interface TopSpendingCategoriesProps {
  categories: Array<{name: string; spent: number; budget?: number; icon: string;}>;
  transactions: Array<{
    type: 'income' | 'expense';
    amount: number;
    payment_source: string | null;
  }>;
}

export function TopSpendingCategories({ categories, transactions }: TopSpendingCategoriesProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  
  // Calculate payment method breakdown
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const savingsSpent = expenseTransactions
    .filter(t => !t.payment_source || t.payment_source === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const creditSpent = expenseTransactions
    .filter(t => t.payment_source === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseAmount = savingsSpent + creditSpent;
  const savingsPercentage = totalExpenseAmount > 0 ? (savingsSpent / totalExpenseAmount) * 100 : 0;
  const creditPercentage = totalExpenseAmount > 0 ? (creditSpent / totalExpenseAmount) * 100 : 0;

  const topCategories = categories
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4)
    .map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0
    }));

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Top Spending Categories
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your biggest expense categories & payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {topCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-2 block animate-bounce">🎯</span>
            <p className="font-medium">No spending data yet</p>
            <p className="text-sm">Start adding expense transactions to see your top categories</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Categories Section */}
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div 
                  key={category.name}
                  className="group flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-gradient-to-r from-background to-muted/10 hover:from-muted/20 hover:to-muted/30"
                  style={{ 
                    animation: `slideIn 0.6s ease-out both ${index * 100}ms` 
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                        <span className="text-sm">{category.icon}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{category.percentage.toFixed(1)}% of total spending</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-105 transform">
                      {formatCurrency(category.spent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method Breakdown */}
            {totalExpenseAmount > 0 && (
              <div className="mt-6 pt-4 border-t border-border/30">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Payment Method Breakdown</h4>
                <div className="space-y-2">
                  {/* Savings/Cash */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <span className="text-xs">💰</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Savings/Cash
                        </span>
                        <p className="text-xs text-green-600 dark:text-green-500">
                          {savingsPercentage.toFixed(1)}% of expenses
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {formatCurrency(savingsSpent)}
                    </span>
                  </div>

                  {/* Credit Card */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <span className="text-xs">💳</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                          Credit Card
                        </span>
                        <p className="text-xs text-orange-600 dark:text-orange-500">
                          {creditPercentage.toFixed(1)}% of expenses
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-orange-700 dark:text-orange-400">
                      {formatCurrency(creditSpent)}
                    </span>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="mt-3 pt-2 border-t border-border/50">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">Total Monthly Spending</span>
                    <span className="text-primary">{formatCurrency(totalExpenseAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
      `}</style>
    </Card>
  )
}
