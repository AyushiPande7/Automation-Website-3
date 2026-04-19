import { motion } from 'framer-motion';
import { statusConfig } from './StatusBadge';
import {
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  Rocket,
  XCircle,
  Search,
  ThumbsUp,
  User
} from 'lucide-react';

const statusIcons = {
  Submitted: FileText,
  'Under Review': Search,
  Approved: ThumbsUp,
  'In Progress': Clock,
  Implemented: Rocket,
  Rejected: XCircle
};

export default function Timeline({ statusHistory = [] }) {
  if (!statusHistory.length) return null;

  return (
    <div className="relative">
      {statusHistory.map((entry, index) => {
        const Icon = statusIcons[entry.status] || CheckCircle2;
        const config = statusConfig[entry.status] || statusConfig.Submitted;
        const isLast = index === statusHistory.length - 1;
        const date = new Date(entry.date);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {/* Vertical Line */}
            {!isLast && (
              <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-32px)] bg-gray-200" />
            )}

            {/* Icon Circle */}
            <div
              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                border-2 ${isLast ? 'border-primary-500 bg-primary-50 glow-pulse' : `${config.border} ${config.bg}`}`}
            >
              <Icon
                className={`w-4 h-4 ${isLast ? 'text-primary-600' : config.text}`}
              />
            </div>

            {/* Content */}
            <div
              className={`flex-1 ${isLast ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-100'}
                rounded-xl border p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-semibold text-sm ${isLast ? 'text-primary-700' : 'text-slate-700'}`}
                >
                  {entry.status}
                </span>
                <span className="text-xs text-slate-400">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {entry.note && (
                <p className="text-sm text-slate-500 mt-1">{entry.note}</p>
              )}

              {entry.updatedBy?.name && (
                <div className="flex items-center gap-1.5 mt-2">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {entry.updatedBy.name}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
