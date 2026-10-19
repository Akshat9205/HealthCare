import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      {Icon && (
        <div className="w-14 h-14 mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all focus:ring-4 focus:ring-brand-100"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
