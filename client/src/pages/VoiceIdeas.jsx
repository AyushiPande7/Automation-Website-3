import { motion } from 'framer-motion';
import { Atom } from 'lucide-react';

export default function VoiceIdeas() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-20">
      {/* Header — same font style as Ideas Inventory / Core Team */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl
                             bg-primary-50 border border-primary-100">
              <Atom className="w-5 h-5 text-primary-600" />
            </span>
            VOICE Ideas
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-base">
            Value, Operational, Innovation, Customer, and Efficiency Ideas.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex justify-center"
        >
          <img
            src="/assets/voice-ideas.jpg"
            alt="VOICE Ideas"
            className="max-w-full h-auto rounded-2xl shadow-lg border border-gray-200"
          />
        </motion.div>
      </div>
    </div>
  );
}
