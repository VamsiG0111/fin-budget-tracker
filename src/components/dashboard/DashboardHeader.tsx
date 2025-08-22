import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  totalIncome: number
  totalExpenses: number
  savings: number
}

export function DashboardHeader({ totalIncome, totalExpenses, savings }: DashboardHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Budget Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your financial health and manage your money wisely
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-success/3 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-danger/5 via-danger/3 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <div className="p-2 bg-danger/10 rounded-lg group-hover:bg-danger/20 transition-colors">
              <TrendingDown className="h-4 w-4 text-danger" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-danger">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-danger rounded-full"></span>
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            savings >= 0 
              ? 'from-primary/5 via-primary/3 to-transparent' 
              : 'from-warning/5 via-warning/3 to-transparent'
          }`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Savings
            </CardTitle>
            <div className={`p-2 rounded-lg transition-colors ${
              savings >= 0 
                ? 'bg-primary/10 group-hover:bg-primary/20' 
                : 'bg-warning/10 group-hover:bg-warning/20'
            }`}>
              <DollarSign className={`h-4 w-4 ${
                savings >= 0 ? 'text-primary' : 'text-warning'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-2xl font-bold ${
              savings >= 0 ? 'text-primary' : 'text-warning'
            }`}>
              {formatCurrency(Math.abs(savings))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${
                savings >= 0 ? 'bg-primary' : 'bg-warning'
              }`}></span>
              <p className="text-xs text-muted-foreground">
                {savings >= 0 ? 'Surplus' : 'Deficit'}
              </p>
              {savings >= 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {savingsRate.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-accent/3 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial Health
            </CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Wallet className="h-4 w-4 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-2">
              <Badge 
                variant={savings >= 0 ? "default" : "destructive"}
                className="text-sm font-semibold"
              >
                {savings >= 0 ? 'Healthy' : 'At Risk'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {savings >= 0 
                ? 'You\'re saving money!' 
                : 'Review your spending'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}