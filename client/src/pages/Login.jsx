// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { useAuth } from '../context/AuthContext';
// import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
// import toast from 'react-hot-toast';

// /* ─── Toyota Logo SVG ─────────────────────────────────────────── */
// function ToyotaLogo({ className = 'w-16 h-16' }) {
//   return (
//     <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
//       <ellipse cx="50" cy="30" rx="48" ry="28" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
//       <ellipse cx="50" cy="30" rx="20" ry="28" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
//       <ellipse cx="50" cy="14" rx="30" ry="10" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
//     </svg>
//   );
// }

// export default function Login() {
//   const [email,      setEmail]      = useState('');
//   const [password,   setPassword]   = useState('');
//   const [name,       setName]       = useState('');
//   const [department, setDepartment] = useState('');
//   const [isRegister, setIsRegister] = useState(false);
//   const [loading,    setLoading]    = useState(false);
//   const { login, register } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (isRegister) {
//         await register(name, email, password, department);
//         toast.success('Account created! Welcome aboard.');
//       } else {
//         await login(email, password);
//         toast.success('Welcome back!');
//       }
//       navigate('/ideas');
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//         (isRegister ? 'Registration failed. Please try again.' : 'Invalid credentials.')
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-white">

//       {/* ── Left Branding Panel ─────────────────────────────────── */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gray-50 border-r border-gray-100 relative overflow-hidden">
//         {/* Subtle red grid */}
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: 'linear-gradient(#EB0A1E 1px, transparent 1px), linear-gradient(90deg, #EB0A1E 1px, transparent 1px)',
//             backgroundSize: '40px 40px',
//           }}
//         />
//         {/* Red glow */}
//         <div className="absolute bottom-0 left-0 w-[70%] h-[60%] bg-primary-500/10 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
//         <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[80px] translate-x-1/4 -translate-y-1/4" />

//         <div className="relative z-10 flex flex-col justify-center px-16 w-full">
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.7 }}
//           >
//             {/* Logo */}
//             <div className="flex items-center gap-4 mb-12">
//               <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
//                 <ToyotaLogo className="w-12 h-12" />
//               </div>
//               <div>
//                 <p className="text-slate-900 font-black text-xl tracking-tight leading-none">TOYOTA</p>
//                 <p className="text-primary-600 text-xs font-bold tracking-[0.2em] uppercase">Automated Logistics</p>
//               </div>
//             </div>

//             <h1 className="text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
//               Turning ideas into{' '}
//               <span className="text-primary-600">automation.</span>
//             </h1>
//             <p className="text-slate-500 text-lg leading-relaxed max-w-md font-medium">
//               Submit, track, and implement automation ideas that reduce waste, improve efficiency, and scale operations.
//             </p>

//             {/* Stats row */}
//             <div className="mt-12 grid grid-cols-3 gap-6">
//               {[
//                 { value: '50+', label: 'Ideas Submitted' },
//                 { value: '12',  label: 'Implemented' },
//                 { value: '4',   label: 'Departments' },
//               ].map((s) => (
//                 <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
//                   <p className="text-2xl font-black text-primary-600">{s.value}</p>
//                   <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Right Form Panel ────────────────────────────────────── */}
//       <div className="flex-1 flex items-center justify-center p-8 bg-white">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Back to home */}
//           <Link
//             to="/"
//             className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Home
//           </Link>

//           {/* Mobile Toyota logo */}
//           <div className="lg:hidden flex items-center gap-3 mb-8">
//             <div className="bg-white border border-gray-100 shadow-sm p-2 rounded-xl">
//               <ToyotaLogo className="w-10 h-6" />
//             </div>
//             <div>
//               <p className="font-black text-slate-800 text-base leading-none">TOYOTA</p>
//               <p className="text-primary-500 text-[10px] font-bold tracking-widest uppercase">Automated Logistics</p>
//             </div>
//           </div>

//           <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-100">
//             <h2 className="text-2xl font-bold text-slate-800 mb-1">
//               {isRegister ? 'Create Account' : 'Sign In'}
//             </h2>
//             <p className="text-slate-500 mb-8 text-sm">
//               {isRegister
//                 ? 'Register to start submitting automation ideas'
//                 : 'Access your Toyota Automated Logistics platform'}
//             </p>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {isRegister && (
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="John Doe"
//                     className="input-field"
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="email"
//                     value={email}
//                     autoComplete="email"
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@toyota.com"
//                     className="input-field pl-11"
//                     required
//                   />
//                 </div>
//               </div>

//               {isRegister && (
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
//                   <input
//                     type="text"
//                     value={department}
//                     onChange={(e) => setDepartment(e.target.value)}
//                     placeholder="e.g. Software, Controls"
//                     className="input-field"
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="password"
//                     value={password}
//                     autoComplete="current-password"
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="input-field pl-11"
//                     required
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 id="login-submit-btn"
//                 disabled={loading}
//                 className="btn-primary w-full flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <>
//                     {isRegister ? 'Create Account' : 'Sign In'}
//                     <ArrowRight className="w-4 h-4" />
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-slate-500">
//                 {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
//                 <button
//                   type="button"
//                   onClick={() => setIsRegister(!isRegister)}
//                   className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
//                 >
//                   {isRegister ? 'Sign In' : 'Register here'}
//                 </button>
//               </p>
//             </div>

//             {/* Demo credentials */}
//             {/* <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
//               <p className="text-xs font-semibold text-gray-600 mb-2">Demo Credentials</p>
//               <p className="text-xs text-gray-500">
//                 👑 Admin: <span className="font-mono text-slate-700">admin@company.com</span> / <span className="font-mono text-slate-700">admin123</span>
//               </p>
//             </div> */}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Toyota Logo SVG ─────────────────────────────────────────── */
function ToyotaLogo({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="30" rx="48" ry="28" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
      <ellipse cx="50" cy="30" rx="20" ry="28" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
      <ellipse cx="50" cy="14" rx="30" ry="10" stroke="#EB0A1E" strokeWidth="4.5" fill="none" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/ideas');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Invalid credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left Branding Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 border-r border-gray-100 relative overflow-hidden">
        
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#EB0A1E 1px, transparent 1px), linear-gradient(90deg, #EB0A1E 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="absolute bottom-0 left-0 w-[70%] h-[60%] bg-primary-500/10 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[80px] translate-x-1/4 -translate-y-1/4" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <ToyotaLogo className="w-12 h-12" />
              </div>
              <div>
                <p className="text-slate-900 font-black text-xl tracking-tight leading-none">TOYOTA</p>
                <p className="text-primary-600 text-xs font-bold tracking-[0.2em] uppercase">
                  Automated Logistics
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
              Turning ideas into{' '}
              <span className="text-primary-600">automation.</span>
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed max-w-md font-medium">
              Submit, track, and implement automation ideas that reduce waste, improve efficiency, and scale operations.
            </p>

            {/* <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: '50+', label: 'Ideas Submitted' },
                { value: '12', label: 'Implemented' },
                { value: '4', label: 'Departments' },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-2xl font-black text-primary-600">{s.value}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div> */}

          </motion.div>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-white border border-gray-100 shadow-sm p-2 rounded-xl">
              <ToyotaLogo className="w-10 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-base leading-none">TOYOTA</p>
              <p className="text-primary-500 text-[10px] font-bold tracking-widest uppercase">
                Automated Logistics
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-100">
            
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Sign In
            </h2>

            <p className="text-slate-500 mb-8 text-sm">
              Access your Toyota Automated Logistics platform
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@toyota.com"
                    className="input-field pl-11"
                    required
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
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

          </div>
        </motion.div>
      </div>
    </div>
  );
}