import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationsDropdown } from '../components/NotificationsDropdown';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const goTo = (path: string) => {
    navigate(path);
    closeMobile();
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-2">
      <a
        onClick={() => goTo('/dashboard')}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/dashboard') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>dashboard</span>
        <p className="text-sm font-semibold leading-normal">Tablero</p>
      </a>

      <a
        onClick={() => goTo('/dashboard/vehicles')}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/vehicles') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/dashboard/vehicles') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>directions_car</span>
        <p className="text-sm font-medium leading-normal">{user?.role === 'ADMIN' ? 'Gestión de Flota' : 'Mis Vehículos'}</p>
      </a>

      <a
        onClick={() => goTo('/dashboard/parts')}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/parts') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/dashboard/parts') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>extension</span>
        <p className="text-sm font-medium leading-normal">{user?.role === 'ADMIN' ? 'Gestión de Piezas' : 'Mis Piezas'}</p>
      </a>

      <a
        onClick={() => goTo('/dashboard/history')}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/history') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
      >
        <span className={`material-symbols-outlined ${isActive('/dashboard/history') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>history</span>
        <p className="text-sm font-medium leading-normal">Historial</p>
      </a>

      {user?.role === 'ADMIN' && (
        <a
          onClick={() => goTo('/dashboard/calendar')}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/calendar') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/dashboard/calendar') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>calendar_month</span>
          <p className="text-sm font-medium leading-normal">Calendario</p>
        </a>
      )}
      {user?.role === 'ADMIN' && (
        <a
          onClick={() => goTo('/dashboard/clients')}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/clients') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/dashboard/clients') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>group</span>
          <p className="text-sm font-medium leading-normal">Clientes</p>
        </a>
      )}
      {user?.role === 'ADMIN' && (
        <a
          onClick={() => goTo('/dashboard/admin')}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/admin') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/dashboard/admin') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>settings</span>
          <p className="text-sm font-medium leading-normal">Administración</p>
        </a>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-[#111518] dark:text-gray-100">
      {/* SideNavBar */}
      <aside className="w-72 bg-white dark:bg-surface-dark border-r border-[#dbe1e6] dark:border-gray-800 hidden md:flex flex-col h-full flex-shrink-0 transition-colors duration-200">
        <div className="p-6 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-8">
            {/* Brand / User Profile */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm ring-2 ring-primary/10" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5_s_jvBLB2FfMisxj2YBgtsFL0iKH_7woLaCe5v4PD53QcNr9jI52S0PWR65vqq8cvzbtnkHbtp2p476eYVKRgZoRzm7urQXwK8bU6le7VXfynQqUjeZ8gBil7l24_YkbJclPQBi9xVfXeYleCHnnbk-Nh0Ryn1esRoOtvAaRi0iXmz53TxGdT2HNYRLNnvJcIucQsfNjMfCYcM_IxP1TRz7GTRmLk352tyy7wZJ-6ZF16mk4UhGBrdlj_jDKaob9X5A21YAuhNU")'}}
              ></div>
              <div className="flex flex-col">
                <h1 className="text-[#111518] dark:text-white text-base font-bold leading-normal">Taller Charli</h1>
                <p className="text-[#617989] dark:text-gray-400 text-xs font-normal leading-normal uppercase tracking-wider">Panel del Cliente</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <NavLinks />
          </div>
          
          <div className="flex flex-col gap-4">
             <button 
               onClick={handleLogout}
               className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#dbe1e6] dark:border-gray-700 text-[#111518] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
             >
                <span className="material-symbols-outlined text-lg">logout</span>
                Cerrar Sesión
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-surface-dark border-b border-[#dbe1e6] dark:border-gray-800">
           <div className="flex items-center gap-2" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-primary">electric_bolt</span>
              <span className="font-bold text-lg text-[#111518] dark:text-white">Taller Charli</span>
           </div>
           <div className="flex items-center gap-2">
             <NotificationsDropdown />
             <button className="text-[#111518] dark:text-white" onClick={() => setMobileOpen((v) => !v)} aria-label="Abrir menú">
                <span className="material-symbols-outlined">menu</span>
             </button>
           </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex">
            <div className="w-72 bg-white dark:bg-surface-dark h-full shadow-xl border-r border-[#dbe1e6] dark:border-gray-800 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2" onClick={() => goTo('/')}>
                  <span className="material-symbols-outlined text-primary">electric_bolt</span>
                  <span className="font-bold text-lg text-[#111518] dark:text-white">Taller Charli</span>
                </div>
                <button className="text-[#617989] hover:text-primary" onClick={closeMobile} aria-label="Cerrar menú">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <NavLinks />
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#dbe1e6] dark:border-gray-700 text-[#111518] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={closeMobile} />
          </div>
        )}

        {/* Desktop Header for Notifications */}
        <div className="hidden md:flex justify-end items-center px-8 py-4 bg-transparent absolute top-0 right-0 z-30">
           <NotificationsDropdown />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
           <Outlet />
        </div>
      </main>
    </div>
  );
};


export default DashboardLayout;