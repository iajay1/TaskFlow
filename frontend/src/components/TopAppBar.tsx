import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopAppBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';

  function handleSignOut() {
    logout();
    navigate('/login');
  }

  return (
    <header className="hidden md:flex justify-between items-center w-full px-6 h-20 bg-[#ffff00] text-black font-black uppercase tracking-tighter fixed top-0 border-b-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-3xl">menu</span>
        <span className="text-3xl font-black text-black italic">TASKFLOW</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-black/80">{user?.name?.toUpperCase()}</span>
        <div className="w-12 h-12 rounded-full border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-lg font-black">
          {initials}
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-sm font-black">
          <span className="material-symbols-outlined text-xl">logout</span>
          SIGN OUT
        </button>
      </div>
    </header>
  );
}
