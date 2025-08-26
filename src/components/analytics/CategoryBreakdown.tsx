import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryData {
  name: string;
  amount: number;
  icon: string;
  color: string;
  percentage: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
  title: string;
  description: string;
}

export function CategoryBreakdown({ data, title, description }: CategoryBreakdownProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{data.icon}</span>
            <p className="font-medium">{label}</p>
          </div>
          <p className="text-primary">{`Amount: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-muted-foreground">{`${data.percentage.toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Filter out zero amounts and ensure we have valid data
  const filteredData = data?.filter(item => item.amount > 0) || [];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-2 block animate-bounce">📊</span>
            <p className="font-medium">No data available</p>
            <p className="text-sm">Add some transactions to see the breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Advanced Analytics Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg border border-primary/10">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {filteredData.length}
                </div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {formatCurrency(filteredData.reduce((sum, item) => sum + item.amount, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">
                  {formatCurrency(filteredData.reduce((sum, item) => sum + item.amount, 0) / filteredData.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg per Category</div>
              </div>
            </div>

            {/* Enhanced Bar Chart with gradient */}
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={filteredData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]}
                  className="hover:opacity-80 transition-all duration-200"
                  fill="url(#barGradient)"
                >
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:brightness-110 transition-all duration-200 cursor-pointer"
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Smart Insights */}
            <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-4 border border-border/30">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-primary">🧠</span>
                Smart Insights
              </h4>
              <div className="space-y-2 text-sm">
                {filteredData.length > 0 && (
                  <>
                    <p className="text-muted-foreground">
                      • <span className="font-medium text-foreground">{filteredData[0].name}</span> is your top expense category at{' '}
                      <span className="font-semibold text-primary">{filteredData[0].percentage.toFixed(1)}%</span> of total spending
                    </p>
                    {filteredData[0].percentage > 40 && (
                      <p className="text-amber-600 dark:text-amber-400">
                        ⚠️ Consider reducing <span className="font-medium">{filteredData[0].name}</span> spending for better balance
                      </p>
                    )}
                    {filteredData.length >= 3 && (
                      <p className="text-muted-foreground">
                        • Top 3 categories account for{' '}
                        <span className="font-semibold text-secondary">
                          {filteredData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                        </span> of your spending
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Category Grid with performance indicators */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Category Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                {filteredData.map((item, index) => (
                  <div 
                    key={`${item.name}-${index}`}
                    className="group relative overflow-hidden rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-background via-background to-muted/5"
                    style={{ animation: `slideIn 0.6s ease-out both ${index * 100}ms` }}
                  >
                    {/* Category rank indicator */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm"
                          style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}30` }}
                        >
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {item.percentage.toFixed(1)}% share
                            </span>
                            {item.percentage > 25 && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        
                        {/* Visual percentage bar */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                              animationDelay: `${index * 150}ms`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Card>
  );
}