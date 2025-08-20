import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ExpenseChart } from "@/components/dashboard/ExpenseChart"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { IncomeChart } from "@/components/dashboard/IncomeChart"

// Initial empty data - everything starts at zero
const mockExpenseData = [
  { name: 'Food & Dining', value: 0, color: '#ff6b6b' },
  { name: 'Rent', value: 0, color: '#4ecdc4' },
  { name: 'Transportation', value: 0, color: '#45b7d1' },
  { name: 'Entertainment', value: 0, color: '#96ceb4' },
  { name: 'Shopping', value: 0, color: '#ffeaa7' },
  { name: 'Utilities', value: 0, color: '#dda0dd' },
]

const mockBudgetData = [
  { name: 'Food & Dining', spent: 0, budget: 0, icon: '🍽️' },
  { name: 'Rent', spent: 0, budget: 0, icon: '🏠' },
  { name: 'Transportation', spent: 0, budget: 0, icon: '🚗' },
  { name: 'Entertainment', spent: 0, budget: 0, icon: '🎬' },
  { name: 'Shopping', spent: 0, budget: 0, icon: '🛍️' },
  { name: 'Utilities', spent: 0, budget: 0, icon: '⚡' },
]

const mockIncomeData = [
  { month: 'Jan', income: 0, expenses: 0 },
  { month: 'Feb', income: 0, expenses: 0 },
  { month: 'Mar', income: 0, expenses: 0 },
  { month: 'Apr', income: 0, expenses: 0 },
  { month: 'May', income: 0, expenses: 0 },
  { month: 'Jun', income: 0, expenses: 0 },
]

const Index = () => {
  const totalIncome = 0
  const totalExpenses = 0
  const savings = 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        <DashboardHeader 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          savings={savings}
        />
        
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          <ExpenseChart data={mockExpenseData} />
          <BudgetProgress categories={mockBudgetData} />
        </div>
        
        <IncomeChart data={mockIncomeData} />
      </div>
    </div>
  )
}

export default Index