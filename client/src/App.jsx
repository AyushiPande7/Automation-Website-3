import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Ideas from './pages/Ideas';
import Insights from './pages/Insights';
import IdeaDetail from './pages/IdeaDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import IdeasTable from './pages/IdeasTable';
import VoiceIdeas from './pages/VoiceIdeas';

/** Redirects authenticated users away from public-only pages */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/ideas" replace />;
}

/** Allows both guest and authenticated users */
function BaseRoute({ children }) {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return children;
}

/** Blocks unauthenticated users from protected pages */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Decorative Background Layer */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-white/60" />

        {/* Subtle Light mode abstract shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-slate-300/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Abstract SVG lines */}
        <svg className="absolute top-0 right-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0, 50 0, 100 100"  stroke="currentColor" fill="transparent" strokeWidth="0.1" className="text-primary-500" />
          <path d="M0 80 C 30 20, 60 20, 100 80"  stroke="currentColor" fill="transparent" strokeWidth="0.1" className="text-slate-400" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar shown for all users */}
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* ── Public/Base Routes ─────────────────────────── */}
            <Route path="/" element={<BaseRoute><Landing /></BaseRoute>} />
            
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute><Register /></PublicRoute>
            } />

            <Route path="/ideas" element={<BaseRoute><Ideas /></BaseRoute>} />
            <Route path="/ideas/:id" element={<BaseRoute><IdeaDetail /></BaseRoute>} />
            <Route path="/ideas-table" element={<BaseRoute><IdeasTable /></BaseRoute>} />
            <Route path="/insights" element={<BaseRoute><Insights /></BaseRoute>} />
            <Route path="/voice-ideas" element={<BaseRoute><VoiceIdeas /></BaseRoute>} />

            {/* ── Fallback ──────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
