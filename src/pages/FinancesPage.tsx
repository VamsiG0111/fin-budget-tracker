// Combined page with tabs for assets and liabilities
import { FinancesOverview } from '@/components/finances/FinancesOverview';

export function FinancesPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Finances
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your assets, liabilities, and net worth
        </p>
      </div>

      <FinancesOverview />
    </div>
  )
}
