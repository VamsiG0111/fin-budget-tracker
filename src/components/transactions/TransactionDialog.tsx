import { useState } from 'react';
import { CalendarDays, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  transaction?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: Category;
    date: string;
  };
}

export function TransactionDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categories,
  transaction 
}: TransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    categoryId: transaction?.category?.id || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: formData.categoryId,
        date: formData.date,
        user_id: user?.id,
      };

      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
      }

      onSuccess();
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
      });
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction ? 'Update your transaction details below.' : 'Enter the details for your new transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className="flex-1"
              >
                Income
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className="flex-1"
              >
                Expense
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category">
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[100] bg-card border border-border shadow-lg">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <Badge 
                        variant="secondary" 
                        className="ml-auto"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: category.color }}
                        />
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                transaction ? 'Update Transaction' : 'Add Transaction'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}