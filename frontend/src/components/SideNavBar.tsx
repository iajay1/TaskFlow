import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/projects', label: 'Projects', icon: 'folder' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar_month' },
];

export default function SideNavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';

  return (
    <nav className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-white dark:bg-zinc-900 flex flex-col z-40 border-r-4 border-black overflow-y-auto">
      {/* User Profile */}
      <div className="p-6 border-b-4 border-black bg-[#a3e635]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 border-4 border-black bg-[#00fbfb] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-xl font-black">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{user?.name?.toUpperCase() || 'USER'}</h2>
            <p className="text-sm text-black/60 font-bold">Pro Plan</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col flex-grow py-6 font-bold uppercase">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link key={item.to} to={item.to}
              className={`mx-2 mb-2 p-4 flex items-center gap-4 border-2 transition-all active:translate-x-1 active:translate-y-1 ${
                isActive
                  ? 'bg-[#a3e635] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black'
                  : 'border-transparent text-black hover:border-black hover:bg-zinc-100'
              }`}>
              <span className={`material-symbols-outlined text-xl ${isActive ? 'font-bold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span className="text-[15px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <div className="px-2 mb-2">
        <button onClick={toggle}
          className="w-full mx-0 p-4 flex items-center gap-4 border-2 border-transparent text-black hover:border-black hover:bg-zinc-100 transition-all active:translate-x-1 active:translate-y-1 uppercase font-bold text-[15px]">
          <span className="material-symbols-outlined text-xl">{dark ? 'light_mode' : 'dark_mode'}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* New Project CTA */}
      <div className="px-4 pb-6">
        <Link to="/projects">
          <button className="neo-btn neo-btn-yellow w-full py-4 text-[15px] font-black">
            <span className="material-symbols-outlined text-xl">add</span> NEW PROJECT
          </button>
        </Link>
      </div>
    </nav>
  );
}
