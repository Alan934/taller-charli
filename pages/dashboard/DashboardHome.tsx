import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div class="flex flex-wrap justify-between items-end gap-4 animate-fade-in-up">
        <div class="flex flex-col gap-1">
          <h1 class="text-[#111518] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Hola, Juan</h1>
          <p class="text-[#617989] dark:text-gray-400 text-base font-normal">Bienvenido a tu panel de control.</p>
        </div>
        <div class="flex gap-2">
          <button 
            onClick={() => navigate('/book/step1')}
            class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <span class="material-symbols-outlined text-[20px]">add_circle</span>
            Nuevo Turno
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div class="lg:col-span-2 flex flex-col sm:flex-row gap-4">
          <div class="flex-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span class="material-symbols-outlined text-primary">car_repair</span>
              </div>
              <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <p class="text-[#617989] dark:text-gray-400 text-sm font-medium">Vehículos en Taller</p>
            <p class="text-[#111518] dark:text-white text-3xl font-bold mt-1">1</p>
          </div>

          <div class="flex-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-500">pending_actions</span>
              </div>
              <span class="flex h-2 w-2 rounded-full bg-yellow-500"></span>
            </div>
            <p class="text-[#617989] dark:text-gray-400 text-sm font-medium">Presupuestos Pendientes</p>
            <p class="text-[#111518] dark:text-white text-3xl font-bold mt-1">2</p>
          </div>
        </div>

        {/* Action Panel */}
        <div class="lg:col-span-1">
          <div class="h-full flex flex-col justify-center gap-4 rounded-xl border border-l-4 border-[#dbe1e6] border-l-primary bg-white dark:bg-surface-dark dark:border-gray-800 dark:border-l-primary p-6 shadow-sm">
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                  <span class="material-symbols-outlined text-lg">notification_important</span>
                  Acción Requerida
                </div>
                <p class="text-[#111518] dark:text-white text-lg font-bold leading-tight mt-1">Presupuesto Listo</p>
                <p class="text-[#617989] dark:text-gray-400 text-sm leading-relaxed">El alternador del Tractor John Deere ha sido diagnosticado.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/budget/4023')}
              class="mt-auto w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Ver y Aprobar
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Repairs Section */}
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[#111518] dark:text-white text-xl font-bold">Reparación en Curso</h2>
          <a class="text-primary text-sm font-medium hover:underline cursor-pointer" onClick={() => navigate('/dashboard/repair/4921')}>Ver todo</a>
        </div>
        
        <div 
          onClick={() => navigate('/dashboard/repair/4921')}
          class="bg-white dark:bg-surface-dark border border-[#dbe1e6] dark:border-gray-800 rounded-xl p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <span class="material-symbols-outlined text-3xl">agriculture</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-[#111518] dark:text-white">Tractor John Deere 6155M</h3>
                <p class="text-[#617989] dark:text-gray-400 text-sm">Problema de encendido / Alternador</p>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <span class="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wide">En Proceso</span>
              <p class="text-xs text-gray-400 mt-1">Est. Finalización: 24 Oct</p>
            </div>
          </div>
          
          <div class="relative px-2 md:px-6">
            <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full"></div>
            <div class="absolute top-1/2 left-0 w-[60%] h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000"></div>
            <div class="relative flex justify-between w-full">
               <div class="flex flex-col items-center gap-2 group">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-dark z-10">
                     <span class="material-symbols-outlined text-sm">check</span>
                  </div>
                  <p class="text-xs font-medium text-primary absolute -bottom-8 w-24 text-center">Ingreso</p>
               </div>
               <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-dark z-10">
                     <span class="material-symbols-outlined text-sm">check</span>
                  </div>
                  <p class="text-xs font-medium text-primary absolute -bottom-8 w-24 text-center">Diagnóstico</p>
               </div>
               <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-white dark:bg-surface-dark border-4 border-primary flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/30 z-10 animate-pulse">
                     <div class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                  <p class="text-xs font-bold text-[#111518] dark:text-white absolute -bottom-8 w-24 text-center">Reparación</p>
               </div>
               <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 ring-4 ring-white dark:ring-surface-dark z-10">
                     <span class="material-symbols-outlined text-sm">science</span>
                  </div>
                  <p class="text-xs font-medium text-gray-400 absolute -bottom-8 w-24 text-center hidden sm:block">Pruebas</p>
               </div>
               <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 ring-4 ring-white dark:ring-surface-dark z-10">
                     <span class="material-symbols-outlined text-sm">flag</span>
                  </div>
                  <p class="text-xs font-medium text-gray-400 absolute -bottom-8 w-24 text-center">Listo</p>
               </div>
            </div>
          </div>
          <div class="mt-12 text-center sm:hidden">
            <p class="text-xs text-gray-500">Desliza para ver más detalles</p>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div class="xl:col-span-2 flex flex-col gap-4">
            <div class="flex items-center justify-between">
               <h2 class="text-[#111518] dark:text-white text-xl font-bold">Mis Vehículos</h2>
               <button class="text-primary hover:bg-primary/10 p-1 rounded transition-colors"><span class="material-symbols-outlined">add</span></button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Vehicles */}
               {[
                 {name: 'Ford Cargo 1722', plate: 'AA-123-BC', icon: 'local_shipping', status: null},
                 {name: 'John Deere 6155M', plate: null, icon: 'agriculture', status: 'En Taller'},
                 {name: 'Toyota Hilux', plate: 'AC-987-ZZ', icon: 'directions_car', status: null}
               ].map((v, i) => (
                  <div key={i} class="bg-white dark:bg-surface-dark p-4 rounded-xl border border-[#dbe1e6] dark:border-gray-800 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                     <div class="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#111518] dark:text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">{v.icon}</span>
                     </div>
                     <div class="flex-1">
                        <p class="text-[#111518] dark:text-white font-bold text-sm">{v.name}</p>
                        {v.plate ? <p class="text-[#617989] dark:text-gray-400 text-xs">Patente: {v.plate}</p> : null}
                        {v.status ? <p class="text-[#617989] dark:text-gray-400 text-xs text-orange-500 font-medium">● {v.status}</p> : null}
                     </div>
                     <span class="material-symbols-outlined text-gray-300 group-hover:text-primary">chevron_right</span>
                  </div>
               ))}
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-dashed border-[#dbe1e6] dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500 hover:text-primary h-full min-h-[80px]">
                  <span class="material-symbols-outlined">add_circle</span>
                  <span class="font-medium text-sm">Registrar Vehículo</span>
                </div>
            </div>
         </div>

         <div class="flex flex-col gap-4">
            <h2 class="text-[#111518] dark:text-white text-xl font-bold">Actividad Reciente</h2>
            <div class="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 overflow-hidden">
               <div class="divide-y divide-[#dbe1e6] dark:divide-gray-800">
                  <div class="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                     <div class="bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg p-2 h-fit"><span class="material-symbols-outlined text-lg">receipt_long</span></div>
                     <div>
                        <p class="text-sm font-bold text-[#111518] dark:text-white">Factura #B001-492</p>
                        <p class="text-xs text-gray-500">Toyota Hilux - Servicio 10k</p>
                        <p class="text-[10px] text-gray-400 mt-1">Hace 2 días</p>
                     </div>
                  </div>
                   <div class="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/budget/4023')}>
                     <div class="bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg p-2 h-fit"><span class="material-symbols-outlined text-lg">request_quote</span></div>
                     <div>
                        <p class="text-sm font-bold text-[#111518] dark:text-white">Presupuesto #2023-88</p>
                        <p class="text-xs text-gray-500">Alternador John Deere</p>
                        <p class="text-[10px] text-gray-400 mt-1">Ayer</p>
                     </div>
                  </div>
                   <div class="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                     <div class="bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-lg p-2 h-fit"><span class="material-symbols-outlined text-lg">calendar_month</span></div>
                     <div>
                        <p class="text-sm font-bold text-[#111518] dark:text-white">Turno Completado</p>
                        <p class="text-xs text-gray-500">Revisión Eléctrica General</p>
                        <p class="text-[10px] text-gray-400 mt-1">10 Oct</p>
                     </div>
                  </div>
               </div>
               <div class="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-[#dbe1e6] dark:border-gray-800 text-center">
                  <a class="text-xs font-medium text-primary hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard/history')}>Ver historial completo</a>
               </div>
            </div>
         </div>
      </div>
      <div class="h-10"></div>
    </div>
  );
};

export default DashboardHome;