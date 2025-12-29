import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-[#111518] dark:text-gray-100">
      {/* SideNavBar */}
      <aside class="w-72 bg-white dark:bg-surface-dark border-r border-[#dbe1e6] dark:border-gray-800 hidden md:flex flex-col h-full flex-shrink-0 transition-colors duration-200">
        <div class="p-6 flex flex-col h-full justify-between">
          <div class="flex flex-col gap-8">
            {/* Brand / User Profile */}
            <div class="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div 
                class="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm ring-2 ring-primary/10" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5_s_jvBLB2FfMisxj2YBgtsFL0iKH_7woLaCe5v4PD53QcNr9jI52S0PWR65vqq8cvzbtnkHbtp2p476eYVKRgZoRzm7urQXwK8bU6le7VXfynQqUjeZ8gBil7l24_YkbJclPQBi9xVfXeYleCHnnbk-Nh0Ryn1esRoOtvAaRi0iXmz53TxGdT2HNYRLNnvJcIucQsfNjMfCYcM_IxP1TRz7GTRmLk352tyy7wZJ-6ZF16mk4UhGBrdlj_jDKaob9X5A21YAuhNU")'}}
              ></div>
              <div class="flex flex-col">
                <h1 class="text-[#111518] dark:text-white text-base font-bold leading-normal">Taller Charli</h1>
                <p class="text-[#617989] dark:text-gray-400 text-xs font-normal leading-normal uppercase tracking-wider">Panel del Cliente</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav class="flex flex-col gap-2">
              <a 
                onClick={() => navigate('/dashboard')}
                class={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
              >
                <span class={`material-symbols-outlined ${isActive('/dashboard') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>dashboard</span>
                <p class="text-sm font-semibold leading-normal">Tablero</p>
              </a>
              <a 
                 class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300 transition-colors group cursor-pointer"
              >
                <span class="material-symbols-outlined text-[#617989] dark:text-gray-400 group-hover:text-primary transition-colors">directions_car</span>
                <p class="text-sm font-medium leading-normal">Mis Vehículos</p>
              </a>
              <a 
                onClick={() => navigate('/dashboard/history')}
                class={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group ${isActive('/dashboard/history') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300'}`}
              >
                <span class={`material-symbols-outlined ${isActive('/dashboard/history') ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'} transition-colors`}>history</span>
                <p class="text-sm font-medium leading-normal">Historial</p>
              </a>
              <a class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300 transition-colors group cursor-pointer">
                <span class="material-symbols-outlined text-[#617989] dark:text-gray-400 group-hover:text-primary transition-colors">description</span>
                <p class="text-sm font-medium leading-normal">Presupuestos</p>
              </a>
              <a class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111518] dark:text-gray-300 transition-colors group cursor-pointer">
                <span class="material-symbols-outlined text-[#617989] dark:text-gray-400 group-hover:text-primary transition-colors">settings</span>
                <p class="text-sm font-medium leading-normal">Configuración</p>
              </a>
            </nav>
          </div>
          
          <div class="flex flex-col gap-4">
             <button 
               onClick={() => navigate('/')}
               class="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#dbe1e6] dark:border-gray-700 text-[#111518] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
             >
                <span class="material-symbols-outlined text-lg">logout</span>
                Cerrar Sesión
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div class="md:hidden flex items-center justify-between p-4 bg-white dark:bg-surface-dark border-b border-[#dbe1e6] dark:border-gray-800">
           <div class="flex items-center gap-2" onClick={() => navigate('/')}>
              <span class="material-symbols-outlined text-primary">electric_bolt</span>
              <span class="font-bold text-lg text-[#111518] dark:text-white">Taller Charli</span>
           </div>
           <button class="text-[#111518] dark:text-white">
              <span class="material-symbols-outlined">menu</span>
           </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;