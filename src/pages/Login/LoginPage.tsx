import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Mail, Lock, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('admin@stylefleet.com');
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
    await login('admin@stylefleet.com', 'admin12345');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center items-center p-4 relative overflow-hidden font-alata">
      {/* Background Radial Glows in Gold & Dark Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#D4AF37]/20 to-transparent blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#FCF9EE] blur-[70px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#161826] flex items-center justify-center text-[#DFB847] shadow-dark-md mx-auto mb-4 border-2 border-[#D4AF37]/50">
            <Crown className="w-8 h-8 text-[#DFB847]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/40 text-xs font-bold mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>SUPER ADMIN PORTAL</span>
          </div>
          <h1 className="text-2xl font-bold text-[#161826] tracking-tight">STYLE FLEET</h1>
          <p className="text-xs text-[#161826]/80 mt-1 font-bold">Executive Oversight & Multi-Salon Fleet Telemetry</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-card-elevated">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Tab Toggle */}
          <div className="flex rounded-xl bg-[#FCF9EE] p-1 mb-6 border border-[#D4AF37]/25">
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'email'
                  ? 'bg-[#161826] text-[#DFB847] shadow-dark-sm'
                  : 'text-[#161826] hover:text-[#D4AF37]'
              }`}
            >
              Email Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('phone')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'phone'
                  ? 'bg-[#161826] text-[#DFB847] shadow-dark-sm'
                  : 'text-[#161826] hover:text-[#D4AF37]'
              }`}
            >
              Mobile / Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'email' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161826] mb-1.5">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@stylefleet.com"
                    className="w-full bg-[#FCF9EE]/40 border-2 border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#161826] transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161826] mb-1.5">
                  Super Admin Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="8888888888"
                    className="w-full bg-[#FCF9EE]/40 border-2 border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#161826] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#161826] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FCF9EE]/40 border-2 border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#161826] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              className="w-full mt-4"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Sign In to Style Fleet
            </Button>
          </form>

          {/* Quick Preset */}
          <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2.5 rounded-xl bg-[#FCF9EE] hover:bg-[#F9F2D6] border border-[#D4AF37]/40 text-xs font-bold text-[#161826] transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>1-Click Super Admin Sign In</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#161826]/75 font-bold mt-6">
          Style Fleet &copy; 2026. Direct Supabase Cloud Connection.
        </p>
      </div>
    </div>
  );
};
