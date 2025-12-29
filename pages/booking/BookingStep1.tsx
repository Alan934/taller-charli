import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';

const BookingStep1: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col">
      <BookingHeader />
      <div class="flex flex-1 flex-col items-center w-full px-4 md:px-40 py-8">
        <div class="layout-content-container flex flex-col max-w-[800px] w-full flex-1 gap-6">
          {/* Page Heading & Progress */}
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap justify-between items-end gap-3">
              <div class="flex min-w-72 flex-col gap-2">
                <p class="text-[#111518] dark:text-white tracking-tight text-[32px] font-bold leading-tight">Solicitar Turno</p>
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <p class="text-[#617989] dark:text-slate-400 text-sm font-medium leading-normal">Tipo de Servicio</p>
                </div>
              </div>
            </div>
            <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-primary w-1/4 rounded-full"></div>
            </div>
          </div>

          <div class="py-4 text-center">
            <h2 class="text-[#111518] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-3">¿Qué necesitas reparar hoy?</h2>
            <p class="text-[#617989] dark:text-slate-400 text-base font-normal leading-normal max-w-lg mx-auto">
              Selecciona si traerás el vehículo completo o solo una parte eléctrica para reparar en banco.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Vehicle Card */}
            <div 
              onClick={() => navigate('/book/step2')}
              class="group relative cursor-pointer flex flex-col bg-white dark:bg-[#1a2632] rounded-xl border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50"
            >
              <div class="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary group-active:bg-primary group-active:border-primary transition-colors flex items-center justify-center">
                 <div class="h-3 w-3 rounded-full bg-primary opacity-0 group-active:opacity-100 transition-opacity"></div>
              </div>
              <div class="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <span class="material-symbols-outlined text-7xl text-primary/80">local_shipping</span>
              </div>
              <div class="p-6 flex flex-col gap-2">
                <h3 class="text-[#111518] dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">Vehículo Completo</h3>
                <p class="text-[#617989] dark:text-slate-400 text-sm leading-relaxed">
                  Traerás el vehículo al taller. Incluye autos, camionetas, camiones, tractores o motos.
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  {['Auto', 'Camión', 'Tractor'].map(tag => (
                    <span key={tag} class="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Part Card */}
             <div 
               onClick={() => navigate('/book/step2')}
               class="group relative cursor-pointer flex flex-col bg-white dark:bg-[#1a2632] rounded-xl border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50"
             >
              <div class="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors flex items-center justify-center"></div>
              <div class="h-40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <span class="material-symbols-outlined text-7xl text-amber-500/80">electrical_services</span>
              </div>
              <div class="p-6 flex flex-col gap-2">
                <h3 class="text-[#111518] dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">Pieza / Repuesto</h3>
                <p class="text-[#617989] dark:text-slate-400 text-sm leading-relaxed">
                  Traerás la pieza suelta para reparación en banco. Alternadores, arranques, baterías.
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                   {['Alternador', 'Burro', 'Batería'].map(tag => (
                    <span key={tag} class="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-8 w-full">
            <button 
              onClick={() => navigate('/book/step2')}
              class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-sm transition-all"
            >
              <span class="truncate">Continuar</span>
              <span class="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStep1;