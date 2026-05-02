import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try { const { data } = await api.post('/api/auth/login', { email, password }); login(data.token, data.user); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-16 relative overflow-hidden"
      style={{ backgroundColor: '#ffff00' }}>
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#00fbfb] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-full -z-0" style={{ animation: 'spin 20s linear infinite' }} />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#ffd7f5] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-12 -z-0" />
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-45 -z-0" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-[#f9f9f9] relative z-10">
        {/* Left: Branding */}
        <div className="hidden md:flex w-1/2 border-r-4 border-black relative bg-[#ffff00] flex-col justify-between overflow-hidden">
          <div className="relative p-10 h-full flex flex-col justify-between z-10">
            <div>
              <h1 className="inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black text-5xl font-black uppercase italic tracking-tighter -rotate-2">
                TASKFLOW
              </h1>
            </div>
            <div className="mt-16">
              <p className="inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#00fbfb] text-black text-3xl font-black uppercase mb-4">
                CRUSH
              </p><br/>
              <p className="inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black text-3xl font-black uppercase mt-2">
                THE CHAOS.
              </p>
            </div>
          </div>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")` }} />
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <h1 className="inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#ffff00] text-black text-3xl font-black uppercase italic tracking-tighter">
              TASKFLOW
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-[48px] font-black text-black uppercase leading-[1.1] tracking-tighter mb-4">WELCOME BACK</h2>
            <p className="text-lg text-black/60 font-medium">System initialized. Awaiting credentials.</p>
          </div>

          {error && (
            <div className="border-4 border-black bg-red-100 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600 text-xl">error</span>
              <span className="text-sm font-bold text-red-600 uppercase">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="relative">
              <label className="neo-label bg-[#ffff00] absolute -top-4 left-4 z-10" htmlFor="email">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black text-2xl font-bold z-10">mail</span>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                  placeholder="USER@DOMAIN.COM"
                  className="neo-input py-4 pl-14 pr-6 text-lg uppercase" />
              </div>
            </div>

            <div className="relative">
              <label className="neo-label bg-[#ffd7f5] absolute -top-4 left-4 z-10" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black text-2xl font-bold z-10">lock</span>
                <input type={showPw ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                  placeholder="••••••••"
                  className="neo-input py-4 pl-14 pr-14 text-lg" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black/60 transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPw ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="neo-btn w-full py-4 mt-2 text-2xl font-black uppercase bg-[#00fbfb] disabled:opacity-50 group">
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> LOADING...</>
              ) : (
                <>SIGN IN <span className="material-symbols-outlined text-3xl font-black group-hover:translate-x-1 transition-transform">arrow_forward</span></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t-4 border-black pt-8 relative">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
              OR
            </span>
            <p className="text-base font-bold text-black mt-4">
              NO ACCOUNT?{' '}
              <Link to="/signup" className="bg-[#ffff00] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00fbfb] transition-colors uppercase">
                INITIALIZE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
