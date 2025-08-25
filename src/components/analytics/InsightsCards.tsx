import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';

interface InsightData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  topExpenseCategory: string;
  averageMonthlyExpense: number;
  budgetUtilization: number;
}

interface InsightsCardsProps {
  data: InsightData;
}

export function InsightsCards({ data }: InsightsCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const insights = [
    {
      title: 'Savings Rate',
      value: formatPercent(data.savingsRate),
      description: data.savingsRate >= 20 ? 'Excellent savings rate!' : data.savingsRate >= 10 ? 'Good progress' : 'Consider saving more',
      icon: data.savingsRate >= 20 ? TrendingUp : data.savingsRate >= 10 ? Target : TrendingDown,
      color: data.savingsRate >= 20 ? 'success' : data.savingsRate >= 10 ? 'warning' : 'danger',
    },
    {
      title: 'Monthly Average',
      value: formatCurrency(data.averageMonthlyExpense),
      description: 'Average monthly expenses',
      icon: Target,
      color: 'primary',
    },
    {
      title: 'Budget Usage',
      value: formatPercent(data.budgetUtilization),
      description: data.budgetUtilization > 90 ? 'Close to budget limit' : data.budgetUtilization > 75 ? 'On track' : 'Under budget',
      icon: data.budgetUtilization > 90 ? AlertTriangle : data.budgetUtilization > 75 ? Target : TrendingUp,
      color: data.budgetUtilization > 90 ? 'danger' : data.budgetUtilization > 75 ? 'warning' : 'success',
    },
    {
      title: 'Top Category',
      value: data.topExpenseCategory,
      description: 'Highest spending category',
      icon: TrendingUp,
      color: 'primary',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        const colorClasses = {
          success: 'text-success border-success/20 bg-success/5',
          warning: 'text-warning border-warning/20 bg-warning/5',
          danger: 'text-danger border-danger/20 bg-danger/5',
          primary: 'text-primary border-primary/20 bg-primary/5',
        };

        return (
          <Card key={index} className="glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              <div className={`p-2 rounded-lg ${colorClasses[insight.color as keyof typeof colorClasses]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insight.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {insight.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}