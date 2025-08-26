import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetCategory {
  name: string
  spent: number
  icon: string
}

interface BudgetProgressProps {
  categories: BudgetCategory[]
}

export function BudgetProgress({ categories }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Category Spending
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          View your spending by category
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-2 block animate-bounce">💳</span>
            <p className="font-medium">No spending data yet</p>
            <p className="text-sm">Start adding transactions to see your category spending</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div 
                key={category.name} 
                className="group p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-gradient-to-r from-background to-muted/10 hover:from-muted/20 hover:to-muted/30"
                style={{ 
                  animation: `slideIn 0.6s ease-out both ${index * 100}ms` 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-105 transform">
                      {formatCurrency(category.spent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
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