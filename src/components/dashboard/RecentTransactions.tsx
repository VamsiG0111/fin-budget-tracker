import { useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
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

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>
                Your latest financial activities
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="hover:bg-primary/5 hover:border-primary/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Start by adding your first transaction
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: transaction.category.color + '20',
                      color: transaction.category.color 
                    }}
                  >
                    {transaction.category.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {transaction.description}
                    </p>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-3 w-3 text-success flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-danger flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.category.name}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transaction.date), 'MMM dd')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.type === 'income' ? 'text-success' : 'text-foreground'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          disabled={deletingId === transaction.id}
                        >
                          {deletingId === transaction.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
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