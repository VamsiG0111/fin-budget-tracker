import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetCategory {
  name: string
  spent: number
  budget: number
  icon: string
}

interface BudgetProgressProps {
  categories: BudgetCategory[]
}

export function BudgetProgress({ categories }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 90) return "danger"
    if (percentage >= 75) return "warning"
    return "success"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>
          Track your spending against your budget limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => {
          const percentage = (category.spent / category.budget) * 100
          const variant = getProgressVariant(percentage)
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                  </p>
                  <p className={`text-xs ${
                    variant === 'danger' ? 'text-danger' :
                    variant === 'warning' ? 'text-warning' : 'text-success'
                  }`}>
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}