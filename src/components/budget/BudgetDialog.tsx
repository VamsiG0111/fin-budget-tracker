import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface BudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export function BudgetDialog({ isOpen, onClose, onSuccess, categories }: BudgetDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget Goals</DialogTitle>
          <DialogDescription>
            Budget goal functionality coming soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No budget functionality available at the moment.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}