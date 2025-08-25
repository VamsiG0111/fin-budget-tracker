import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Budget {
  id?: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
}

interface BudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export function BudgetDialog({ isOpen, onClose, onSuccess, categories }: BudgetDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    if (isOpen && user) {
      loadBudgets();
    }
  }, [isOpen, user, selectedMonth, selectedYear]);

  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (error) throw error;

      const budgetMap = new Map(data.map(b => [b.category_id, b]));
      const categoryBudgets = categories.map(category => ({
        category_id: category.id,
        amount: budgetMap.get(category.id)?.amount || 0,
        month: selectedMonth,
        year: selectedYear,
        ...(budgetMap.get(category.id)?.id && { id: budgetMap.get(category.id)?.id })
      }));

      setBudgets(categoryBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load budgets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBudgetAmount = (categoryId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setBudgets(prev => prev.map(budget => 
      budget.category_id === categoryId 
        ? { ...budget, amount: numAmount }
        : budget
    ));
  };

  const saveBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Prepare upsert data
      const upsertData = budgets
        .filter(budget => budget.amount > 0)
        .map(budget => ({
          id: budget.id,
          user_id: user.id,
          category_id: budget.category_id,
          amount: budget.amount,
          month: selectedMonth,
          year: selectedYear
        }));

      if (upsertData.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .upsert(upsertData, { onConflict: 'id' });

        if (error) throw error;
      }

      // Delete budgets with 0 amount
      const budgetsToDelete = budgets
        .filter(budget => budget.amount === 0 && budget.id)
        .map(budget => budget.id!);

      if (budgetsToDelete.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .in('id', budgetsToDelete);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Budget goals updated successfully!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving budgets:', error);
      toast({
        title: "Error",
        description: "Failed to save budget goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Budget Goals</DialogTitle>
          <DialogDescription>
            Set monthly budget limits for each category to track your spending progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Budget Limits</h3>
            <div className="grid gap-4">
              {categories.map(category => {
                const budget = budgets.find(b => b.category_id === category.id);
                return (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={budget?.amount || ''}
                            onChange={(e) => updateBudgetAmount(category.id, e.target.value)}
                            className="text-right"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveBudgets} disabled={loading}>
              {loading ? 'Saving...' : 'Save Budget Goals'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}