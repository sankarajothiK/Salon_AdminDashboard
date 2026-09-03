import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Mail, Lock, Phone, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fdfaf7] flex flex-col justify-center items-center p-4 relative overflow-hidden font-alata">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FFEBB8]/50 to-transparent blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#EA9D9D]/30 blur-[70px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#601D49] via-[#BD5579] to-[#EA9D9D] flex items-center justify-center text-[#FFEBB8] shadow-plum-md mx-auto mb-4 border-2 border-[#FFEBB8]">
            <Crown className="w-8 h-8 text-[#FFEBB8]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFEBB8] text-black border border-[#BD5579]/40 text-xs font-bold mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#601D49]" />
            <span>SUPER ADMIN PORTAL</span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">SALON CRM PLATFORM</h1>
          <p className="text-xs text-black mt-1 font-bold">Full Executive Oversight & Multi-Salon Telemetry</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#BD5579]/20 rounded-3xl p-6 sm:p-8 shadow-card-elevated">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-black text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Tab Toggle */}
          <div className="flex rounded-xl bg-[#fdf2f6] p-1 mb-6 border border-[#BD5579]/20">
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'email'
                  ? 'bg-[#601D49] text-[#FFEBB8] shadow-2xs'
                  : 'text-black hover:text-[#601D49]'
              }`}
            >
              Email Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('phone')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'phone'
                  ? 'bg-[#601D49] text-[#FFEBB8] shadow-2xs'
                  : 'text-black hover:text-[#601D49]'
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
                    className="w-full bg-[#fdf9fa] border-2 border-[#BD5579]/25 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40 focus:border-[#601D49] transition-all"
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
                    className="w-full bg-[#fdf9fa] border-2 border-[#BD5579]/25 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40 focus:border-[#601D49] transition-all"
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
                  className="w-full bg-[#fdf9fa] border-2 border-[#BD5579]/25 text-black font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40 focus:border-[#601D49] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="berry"
              size="lg"
              loading={loading}
              className="w-full mt-4"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Sign In as Super Admin
            </Button>
          </form>

          {/* Quick Preset */}
          <div className="mt-6 pt-6 border-t border-[#BD5579]/15">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2.5 rounded-xl bg-[#FFEBB8] hover:bg-[#ffe39c] border border-[#BD5579]/40 text-xs font-bold text-black transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#601D49]" />
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
