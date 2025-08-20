import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ExpenseChart } from "@/components/dashboard/ExpenseChart"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { IncomeChart } from "@/components/dashboard/IncomeChart"

// Mock data for demonstration
const mockExpenseData = [
  { name: 'Food & Dining', value: 1200, color: '#ff6b6b' },
  { name: 'Rent', value: 2000, color: '#4ecdc4' },
  { name: 'Transportation', value: 400, color: '#45b7d1' },
  { name: 'Entertainment', value: 300, color: '#96ceb4' },
  { name: 'Shopping', value: 600, color: '#ffeaa7' },
  { name: 'Utilities', value: 250, color: '#dda0dd' },
]

const mockBudgetData = [
  { name: 'Food & Dining', spent: 1200, budget: 1500, icon: '🍽️' },
  { name: 'Rent', spent: 2000, budget: 2000, icon: '🏠' },
  { name: 'Transportation', spent: 400, budget: 500, icon: '🚗' },
  { name: 'Entertainment', spent: 300, budget: 400, icon: '🎬' },
  { name: 'Shopping', spent: 600, budget: 800, icon: '🛍️' },
  { name: 'Utilities', spent: 250, budget: 300, icon: '⚡' },
]

const mockIncomeData = [
  { month: 'Jan', income: 5000, expenses: 4200 },
  { month: 'Feb', income: 5200, expenses: 4100 },
  { month: 'Mar', income: 5100, expenses: 4300 },
  { month: 'Apr', income: 5300, expenses: 4000 },
  { month: 'May', income: 5400, expenses: 4200 },
  { month: 'Jun', income: 5600, expenses: 4750 },
]

const Index = () => {
  const totalIncome = 5600
  const totalExpenses = 4750
  const savings = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          savings={savings}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <ExpenseChart data={mockExpenseData} />
          <BudgetProgress categories={mockBudgetData} />
        </div>
        
        <IncomeChart data={mockIncomeData} />
      </div>
    </div>
  )
}

export default Index