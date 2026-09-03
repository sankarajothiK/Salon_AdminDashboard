import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Mail, Lock, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('admin@saloncrm.com');
  const [phone, setPhone] = useState('8888888888');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const credential = authMode === 'email' ? email : phone;
    const res = await login(credential, password);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleQuickLogin = async () => {
    await login('admin@saloncrm.com', 'admin12345');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden font-alata">
      {/* Background Radial Glows in Emerald */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-200/50 to-transparent blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-100/60 blur-[70px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-md mx-auto mb-4 border-2 border-emerald-300">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>SUPER ADMIN PORTAL</span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">SALON CRM PLATFORM</h1>
          <p className="text-xs text-black mt-1 font-bold">Executive Oversight & Multi-Salon Telemetry</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-card-elevated">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-black text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Tab Toggle */}
          <div className="flex rounded-xl bg-emerald-50/70 p-1 mb-6 border border-emerald-200">
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'email'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-black hover:text-emerald-800'
              }`}
            >
              Email Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('phone')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'phone'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-black hover:text-emerald-800'
              }`}
            >
              Mobile / Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'email' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@saloncrm.com"
                    className="w-full bg-[#f8fafc] border-2 border-emerald-200 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Super Admin Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-black absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="8888888888"
                    className="w-full bg-[#f8fafc] border-2 border-emerald-200 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-black absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f8fafc] border-2 border-emerald-200 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-4"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Sign In as Super Admin
            </Button>
          </form>

          {/* Quick Preset */}
          <div className="mt-6 pt-6 border-t border-emerald-100">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-xs font-bold text-black transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-emerald-700" />
              <span>1-Click Super Admin Sign In</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-black font-bold mt-6">
          Salon CRM Platform &copy; 2026. Direct Supabase Cloud Connection.
        </p>
      </div>
    </div>
  );
};
