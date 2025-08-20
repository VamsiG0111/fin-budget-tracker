import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ExpenseCategory {
  name: string
  value: number
  color: string
}

interface ExpenseChartProps {
  data: ExpenseCategory[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

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
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>
          Your spending by category this month
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="h-[250px] lg:h-[300px] w-full">
          {data.every(item => item.value === 0) ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p>No expenses recorded yet</p>
                <p className="text-sm">Start adding transactions to see your expense breakdown</p>
              </div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}