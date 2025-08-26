import { useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDate } from 'date-fns';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  [x: string]: any;
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onRefresh: () => void;
}

export function RecentTransactions({ transactions, categories, onRefresh }: RecentTransactionsProps) {
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    try {
      setDeletingId(transactionId);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
    onRefresh();
    toast({
      title: "Success",
      description: "Transaction updated successfully!",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '🏷️';
  };

  return (
    <>
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest financial activity
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-110 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-2 block animate-bounce">📝</span>
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Start adding transactions to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction.id}
                  className="group p-3 rounded-lg border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-gradient-to-r from-background to-muted/10 hover:from-muted/20 hover:to-muted/30"
                  style={{ 
                    animation: `slideIn 0.6s ease-out both ${index * 100}ms` 
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform"
                        style={{ backgroundColor: `${getCategoryColor(transaction.category?.id || '')}20` }}
                      >
                        <span className="text-lg">{transaction.category?.icon ?? '🏷️'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{format(new Date(transaction.date), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold transition-all duration-300 group-hover:scale-105 transform ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

      {editingTransaction && (
        <TransactionDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleEditSuccess}
          categories={categories}
          transaction={editingTransaction}
        />
      )}
    </>
  );
}