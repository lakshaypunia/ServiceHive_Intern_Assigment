import { Users } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}

export function EmptyState({ hasFilters, onClear, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-slate-400" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No leads match your filters</h3>
          <p className="text-slate-500 text-sm mb-5">Try adjusting your search or filter criteria.</p>
          <Button variant="secondary" onClick={onClear}>Clear filters</Button>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No leads yet</h3>
          <p className="text-slate-500 text-sm mb-5">Add your first lead to get started.</p>
          <Button onClick={onCreate}>Add lead</Button>
        </>
      )}
    </div>
  );
}
