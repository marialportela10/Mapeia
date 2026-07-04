import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Map, Shield, FileText, LogOut, Menu, X, LayoutDashboard, List } from 'lucide-react';
import figmaIcon from "../../imports/Intersect.svg";
import { Button } from '../components/ui/button';
import { LayoutProvider, useLayoutContext } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';

function AppLayoutContent() {
  const location = useLocation();
  const { isNavOpen, setIsNavOpen, isDashboardSidebarOpen, setIsDashboardSidebarOpen } = useLayoutContext();
  const { logout, user } = useAuth();

  // Close nav on route change, and close dashboard sidebar if leaving dashboard on mobile
  React.useEffect(() => {
    setIsNavOpen(false);
    if (location.pathname !== '/' && window.innerWidth < 768) {
      setIsDashboardSidebarOpen(false);
    }
  }, [location.pathname, setIsNavOpen, setIsDashboardSidebarOpen]);

  const navItems = [
    { path: '/', icon: Map, label: 'Mapa' },
    { path: '/properties', icon: List, label: 'Lista de Imóveis' },
    { path: '/analytics', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  if (user?.role === 'Admin' || user?.role === 'Editor') {
    navItems.splice(1, 0, { path: '/property/new', icon: FileText, label: 'Cadastrar Imóvel' });
  }

  if (user?.role === 'Admin') {
    navItems.push({ path: '/admin/access', icon: Shield, label: 'Controle de Acesso' });
  }

  return (
    <div className="w-full h-screen flex bg-gray-50 overflow-hidden font-sans text-[#1E1E1E]">
      {/* Mobile Top App Bar (Optional, if we want the logo, or we just rely on bottom nav) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-sm border-b border-[#8C3A27]/10 z-[40] flex items-center justify-between px-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <img src={figmaIcon} alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-[#212121] tracking-tight">Mapeia</span>
        </div>
      </div>

      {/* Side Navigation Rail (Desktop) */}
      <nav className="hidden md:flex relative z-[55] h-full w-20 bg-white border-r border-[#8C3A27]/20 shadow-lg flex-col items-center py-6">
        <div className="flex items-center justify-center w-full mb-8">
          <Link to="/">
            <img src={figmaIcon} alt="Logo" className="w-10 h-10 object-contain" />
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 w-full items-center px-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex justify-center items-center p-3 rounded-xl transition-all w-12 group relative ${isActive ? 'bg-[#3B5935] text-white shadow-md' : 'text-[#1E1E1E]/60 hover:bg-gray-100 hover:text-[#1E1E1E]'}`}
              >
                <Icon className="w-6 h-6 shrink-0" />
                {/* Tooltip on desktop */}
                <div className="hidden md:block absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={logout}
          className="mt-auto flex justify-center items-center p-3 rounded-xl transition-all w-12 text-[#EC3759] hover:bg-red-50 group relative"
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <div className="hidden md:block absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Sair
          </div>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative h-full overflow-hidden bg-gray-50 pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#8C3A27]/20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[60] flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#3B5935]' : 'text-[#1E1E1E]/50 hover:text-[#1E1E1E]'}`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-[#3B5935]/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-center leading-none tracking-tight">
                {item.label === 'Controle de Acesso' ? 'Acessos' : 
                 item.label === 'Cadastrar Imóvel' ? 'Cadastrar' : 
                 item.label === 'Lista de Imóveis' ? 'Imóveis' : item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[#EC3759]/70 hover:text-[#EC3759]"
        >
          <div className="p-1">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-center leading-none tracking-tight">Sair</span>
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <LayoutProvider>
      <AppLayoutContent />
    </LayoutProvider>
  );
}