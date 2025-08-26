import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiabilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LiabilityDialog({ isOpen, onClose, onSuccess }: LiabilityDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'credit_card',
    amount: '',
    due_date: '',
    description: ''
  });

  const liabilityCategories = [
    { value: 'credit_card', label: 'Credit Cards' },
    { value: 'personal_loan', label: 'Personal Loans' },
    { value: 'bills', label: 'Bills Due' },
    { value: 'overdraft', label: 'Overdrafts' },
    { value: 'emi', label: 'EMIs' },
    { value: 'other', label: 'Other Liabilities' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('liabilities')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date || null,
          description: formData.description || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Liability added successfully!",
      });

      setFormData({ name: '', category: 'credit_card', amount: '', due_date: '', description: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding liability:', error);
      toast({
        title: "Error",
        description: "Failed to add liability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Liability</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Liability Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Credit Card XYZ"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {liabilityCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount Due</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this liability"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Liability"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
