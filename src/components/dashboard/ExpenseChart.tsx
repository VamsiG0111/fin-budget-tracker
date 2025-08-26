import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface ExpenseCategory {
  name: string
  value: number
  color: string
}

interface ExpenseChartProps {
  data: ExpenseCategory[]
  title?: string
  description?: string
}

export function ExpenseChart({ 
  data, 
  title = "Expense Breakdown",
  description = "Spending distribution by category"
}: ExpenseChartProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            {formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-2 block animate-bounce">💰</span>
            <p className="font-medium">No expenses yet</p>
            <p className="text-sm">Start adding expense transactions to see the breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={140}
                    dataKey="value"
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Compact Legend in 2 columns */}
            <div className="grid grid-cols-2 gap-2">
              {data.map((item, index) => (
                <div 
                  key={item.name}
                  className="group flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:border-border transition-all duration-300 hover:shadow-sm hover:scale-105 bg-gradient-to-r from-background to-muted/5"
                  style={{ animation: `slideIn 0.6s ease-out both ${index * 50}ms` }}
                >
                  <div 
                    className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform duration-300 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300 truncate block">
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-all duration-300">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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