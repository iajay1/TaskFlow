import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideNavBar from './SideNavBar';
import TopAppBar from './TopAppBar';

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex">
      <TopAppBar />
      <SideNavBar />
      <div className="flex-1 flex flex-col ml-72 mt-20 min-h-screen">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
