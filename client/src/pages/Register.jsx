import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Lightbulb,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.department);
      toast.success('🎉 Account created successfully!');
      navigate('/ideas');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 border-r border-gray-100 relative overflow-hidden">
        {/* Subtle red grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#EB0A1E 1px, transparent 1px), linear-gradient(90deg, #EB0A1E 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Toyota logo */}
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <svg viewBox="0 0 100 60" className="w-12 h-12" fill="none">
                  <ellipse cx="50" cy="30" rx="48" ry="28" stroke="#EB0A1E" strokeWidth="5" fill="none" />
                  <ellipse cx="50" cy="30" rx="20" ry="28" stroke="#EB0A1E" strokeWidth="5" fill="none" />
                  <ellipse cx="50" cy="14" rx="30" ry="10" stroke="#EB0A1E" strokeWidth="5" fill="none" />
                </svg>
              </div>
              <div>
                <p className="text-slate-900 font-black text-xl tracking-tight leading-none">TOYOTA</p>
                <p className="text-primary-600 text-xs font-bold tracking-[0.2em] uppercase">Automated Logistics</p>
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
              Join the<br />
              <span className="text-primary-600">Innovation Team</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">
              Create your account and start submitting automation ideas that make a real impact.
            </p>

            <div className="mt-12 space-y-3">
              {['Submit ideas in seconds', 'Track progress in real-time', 'Measure automation impact'].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-slate-600 font-medium"
                >
                  <div className="w-6 h-6 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-xs">✓</span>
                  </div>
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
          >
            ← Back to Home
          </Link>

          {/* Mobile TAL logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-white border border-gray-100 shadow-sm p-2 rounded-xl">
              <svg viewBox="0 0 100 60" className="w-10 h-6" fill="none">
                <ellipse cx="50" cy="30" rx="48" ry="28" stroke="#EB0A1E" strokeWidth="6" fill="none" />
                <ellipse cx="50" cy="30" rx="20" ry="28" stroke="#EB0A1E" strokeWidth="6" fill="none" />
                <ellipse cx="50" cy="14" rx="30" ry="10" stroke="#EB0A1E" strokeWidth="6" fill="none" />
              </svg>
            </div>
            <div>
              <p className="font-black text-slate-800 text-base leading-none">TOYOTA</p>
              <p className="text-primary-500 text-[10px] font-bold tracking-widest uppercase">Automated Logistics</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
            <p className="text-slate-500 mb-8">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g., Operations, IT, Finance"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="input-field pl-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
