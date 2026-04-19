/**
 * StatusBadge — only the 4 valid statuses that exist in the Mongoose enum:
 * 'Pending' | 'Approved' | 'In Progress' | 'Implemented'
 */
const statusConfig = {
  Pending: {
    bg:     'bg-blue-50',
    text:   'text-blue-700',
    border: 'border-blue-200',
    dot:    'bg-blue-500',
  },
  Approved: {
    bg:     'bg-emerald-50',
    text:   'text-emerald-700',
    border: 'border-emerald-200',
    dot:    'bg-emerald-500',
  },
  'In Progress': {
    bg:     'bg-amber-50',
    text:   'text-amber-700',
    border: 'border-amber-200',
    dot:    'bg-amber-500',
  },
  Implemented: {
    bg:     'bg-green-50',
    text:   'text-green-700',
    border: 'border-green-200',
    dot:    'bg-green-600',
  },
  Rejected: {
    bg:     'bg-rose-50',
    text:   'text-rose-700',
    border: 'border-rose-200',
    dot:    'bg-rose-500',
  },
};

/** Fall back to Pending styling if an unrecognised value arrives */
const fallback = statusConfig.Pending;

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] ?? fallback;
  const sizeClasses = size === 'lg' ? 'text-sm px-4 py-1.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border
        ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse-soft`} />
      {status}
    </span>
  );
}

export { statusConfig };
