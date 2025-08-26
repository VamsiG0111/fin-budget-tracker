import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, DollarSign, PiggyBank, CreditCard } from 'lucide-react';

interface SmartInsightsProps {
  data: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
    topExpenseCategory: string;
    averageMonthlyExpense: number;
    budgetUtilization: number;
  };
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  trends: {
    incomeGrowth: number;
    expenseGrowth: number;
    consistentCategories: string[];
  };
}

export function SmartInsights({ data, categories, trends }: SmartInsightsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Generate insights based on data
  const insights = [
    // Savings insights
    {
      id: 'savings-rate',
      title: 'Savings Performance',
      icon: PiggyBank,
      type: data.savingsRate >= 20 ? 'success' : data.savingsRate >= 10 ? 'warning' : 'danger',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Current Savings Rate</span>
            <Badge variant={data.savingsRate >= 20 ? 'default' : data.savingsRate >= 10 ? 'secondary' : 'destructive'}>
              {formatPercent(data.savingsRate)}
            </Badge>
          </div>
          <Progress value={Math.min(data.savingsRate, 100)} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {data.savingsRate >= 20 
              ? "🎉 Excellent! You're saving more than the recommended 20%."
              : data.savingsRate >= 10 
              ? "👍 Good progress! Consider increasing to 20% for optimal financial health."
              : "⚠️ Try to save at least 10% of your income. Small changes can make a big difference."}
          </p>
          {data.savingsRate < 20 && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">💡 Quick tip:</p>
              <p className="text-sm text-muted-foreground">
                To reach 20% savings rate, you need to save an additional {formatCurrency((data.totalIncome * 0.2) - data.savings)} per month.
              </p>
            </div>
          )}
        </div>
      )
    },

    // Spending pattern insights
    {
      id: 'spending-patterns',
      title: 'Spending Patterns',
      icon: TrendingDown,
      type: 'info',
      content: (
        <div className="space-y-4">
          {categories.slice(0, 3).map((category, index) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">#{index + 1} {category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatPercent(category.percentage)}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(category.amount)}
                  </Badge>
                </div>
              </div>
              <Progress value={category.percentage} className="h-1.5" />
            </div>
          ))}
          
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              💰 Top 3 categories account for {formatPercent(categories.slice(0, 3).reduce((sum, cat) => sum + cat.percentage, 0))} of your spending
            </p>
          </div>

          {categories[0]?.percentage > 40 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border-l-4 border-amber-400">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                ⚠️ Alert: {categories[0].name} takes up {formatPercent(categories[0].percentage)} of your budget
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Consider reviewing this category for potential savings opportunities.
              </p>
            </div>
          )}
        </div>
      )
    },

    // Budget performance
    {
      id: 'budget-performance',
      title: 'Budget Performance',
      icon: Target,
      type: data.budgetUtilization > 90 ? 'warning' : data.budgetUtilization > 75 ? 'info' : 'success',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Budget Utilization</span>
            <Badge variant={data.budgetUtilization > 90 ? 'destructive' : data.budgetUtilization > 75 ? 'secondary' : 'default'}>
              {formatPercent(data.budgetUtilization)}
            </Badge>
          </div>
          <Progress value={Math.min(data.budgetUtilization, 100)} className="h-2" />
          
          {data.budgetUtilization > 100 && (
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border-l-4 border-red-400">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                🚨 Over Budget: You've exceeded your budget by {formatPercent(data.budgetUtilization - 100)}
              </p>
            </div>
          )}
          
          {data.budgetUtilization > 90 && data.budgetUtilization <= 100 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                ⚠️ Approaching Budget Limit
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                You have {formatPercent(100 - data.budgetUtilization)} budget remaining this month.
              </p>
            </div>
          )}

          {data.budgetUtilization <= 75 && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Well Under Budget
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Great job! You have {formatPercent(100 - data.budgetUtilization)} budget remaining.
              </p>
            </div>
          )}
        </div>
      )
    },

    // Recommendations
    {
      id: 'recommendations',
      title: 'Smart Recommendations',
      icon: Lightbulb,
      type: 'info',
      content: (
        <div className="space-y-3">
          <div className="grid gap-3">
            {data.savingsRate < 15 && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <PiggyBank className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Boost Your Savings</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categories[0]?.percentage > 35 && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Reduce Top Category</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Consider cutting {categories[0].name} spending by 10% to improve balance
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Goal</p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Target savings for next month: {formatCurrency(data.totalIncome * 0.2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Emergency Fund</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Aim for 3-6 months expenses: {formatCurrency(data.totalExpenses * 3)} - {formatCurrency(data.totalExpenses * 6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Smart Financial Insights
        </h2>
        <p className="text-muted-foreground">
          AI-powered analysis of your spending patterns and personalized recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const typeColors = {
            success: 'border-green-200 bg-green-50 dark:bg-green-950/10',
            warning: 'border-amber-200 bg-amber-50 dark:bg-amber-950/10',
            danger: 'border-red-200 bg-red-50 dark:bg-red-950/10',
            info: 'border-blue-200 bg-blue-50 dark:bg-blue-950/10',
          };

          return (
            <Card 
              key={insight.id} 
              className={`shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${typeColors[insight.type]}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {insight.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {insight.content}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Health Score */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>
            Overall assessment of your financial wellness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Score calculation */}
            {(() => {
              const savingsScore = Math.min((data.savingsRate / 20) * 100, 100);
              const budgetScore = data.budgetUtilization <= 100 ? (100 - data.budgetUtilization) : 0;
              const diversityScore = Math.min(categories.length * 10, 100);
              const overallScore = (savingsScore + budgetScore + diversityScore) / 3;
              
              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {overallScore.toFixed(0)}/100
                    </div>
                    <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'} className="text-sm">
                      {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Savings Rate</span>
                      <span>{savingsScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={savingsScore} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Budget Control</span>
                      <span>{budgetScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={budgetScore} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Spending Diversity</span>
                      <span>{diversityScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={diversityScore} className="h-2" />
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
