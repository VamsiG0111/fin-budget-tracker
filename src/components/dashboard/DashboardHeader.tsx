import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon } from "@radix-ui/react-icons"

interface DashboardHeaderProps {
  totalIncome: number
  totalExpenses: number
  savings: number
}

export function DashboardHeader({ totalIncome, totalExpenses, savings }: DashboardHeaderProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Budget Dashboard</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Track your financial health and manage your money wisely
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
            <DownloadIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button size="sm" className="flex-1 lg:flex-none">
            <PlusIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="gradient" className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-xs lg:text-sm font-medium">Total Income</p>
                <p className="text-xl lg:text-3xl font-bold text-primary-foreground">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-lg lg:text-xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="success">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success text-xs lg:text-sm font-medium">Savings</p>
                <p className="text-xl lg:text-3xl font-bold text-success">
                  {formatCurrency(savings)}
                </p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-success/20 flex items-center justify-center">
                <span className="text-lg lg:text-xl">🎯</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="warning">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning text-xs lg:text-sm font-medium">Total Expenses</p>
                <p className="text-xl lg:text-3xl font-bold text-warning">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <span className="text-lg lg:text-xl">💸</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}