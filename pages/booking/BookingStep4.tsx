import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';

const BookingStep4: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col">
      <BookingHeader />
      <main class="flex-1 flex flex-col items-center py-8 px-4 md:px-8">
        <div class="w-full max-w-[1100px] flex flex-col gap-6">
          {/* Progress */}
          <div class="w-full bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div class="flex gap-6 justify-between mb-3">
              <p class="text-base font-medium dark:text-white">Paso 4 de 5: Fecha y Hora</p>
              <span class="text-sm text-slate-500 dark:text-gray-400 font-medium">80% completado</span>
            </div>
            <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div class="h-full rounded-full bg-primary transition-all duration-500" style={{width: '80%'}}></div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
            <div class="flex flex-col gap-2">
              <h1 class="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] dark:text-white">Seleccioná tu Turno</h1>
              <p class="text-slate-500 dark:text-gray-400 text-base font-normal max-w-2xl">
                Elegí el momento ideal para traer tu vehículo. Los tiempos están ajustados según el servicio de <strong>Electricidad General</strong> para <strong>Tractor</strong> solicitado.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Column */}
            <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
               <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div class="flex items-center justify-between mb-6">
                     <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><span class="material-symbols-outlined dark:text-white">chevron_left</span></button>
                     <h2 class="text-lg font-bold text-center flex-1 dark:text-white">Agosto 2023</h2>
                     <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><span class="material-symbols-outlined dark:text-white">chevron_right</span></button>
                  </div>
                  <div class="grid grid-cols-7 gap-y-2 gap-x-1 md:gap-x-2">
                     {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(day => (
                        <div key={day} class="text-center text-xs font-bold text-slate-500 dark:text-gray-500 py-2">{day}</div>
                     ))}
                     <div class="h-12 md:h-14"></div>
                     <div class="h-12 md:h-14"></div>
                     {/* Days mockup */}
                     {[...Array(14)].map((_, i) => (
                        <button key={i} class="h-12 md:h-14 w-full rounded-lg flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 cursor-not-allowed" disabled>
                           <span class="text-sm font-medium">{i + 1}</span>
                        </button>
                     ))}
                     {/* Active Day 15 */}
                     <button class="h-12 md:h-14 w-full bg-primary text-white rounded-lg flex flex-col items-center justify-center shadow-lg shadow-primary/30 relative transform scale-105 transition-transform">
                        <span class="text-sm font-bold">15</span>
                     </button>
                     {/* Future days */}
                     {[16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(d => (
                        <button key={d} class="h-12 md:h-14 w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-slate-900 dark:text-white transition-colors relative group">
                            <span class="text-sm font-medium">{d}</span>
                            {[16,17,19,21,22,24,25].includes(d) && <span class="size-1.5 bg-green-500 rounded-full mt-1"></span>}
                            {[18,23].includes(d) && <span class="size-1.5 bg-yellow-500 rounded-full mt-1"></span>}
                            {[27].includes(d) && <span class="size-1.5 bg-red-500 rounded-full mt-1"></span>}
                        </button>
                     ))}
                      <button class="h-12 md:h-14 w-full bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent">
                          <span class="text-sm font-medium line-through">20</span>
                          <span class="text-[10px] text-red-400 mt-0.5 font-medium">Lleno</span>
                      </button>
                  </div>
                   <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div class="flex items-center gap-2"><span class="size-2 rounded-full bg-green-500"></span><span class="text-xs text-slate-500 dark:text-gray-400">Alta Disponibilidad</span></div>
                      <div class="flex items-center gap-2"><span class="size-2 rounded-full bg-yellow-500"></span><span class="text-xs text-slate-500 dark:text-gray-400">Pocos Lugares</span></div>
                      <div class="flex items-center gap-2"><span class="size-2 rounded-full bg-red-500"></span><span class="text-xs text-slate-500 dark:text-gray-400">Muy Limitado</span></div>
                      <div class="flex items-center gap-2"><span class="size-2 rounded-full bg-gray-300"></span><span class="text-xs text-slate-500 dark:text-gray-400">Completo / Cerrado</span></div>
                   </div>
               </div>
            </div>

            {/* Sidebar Column */}
            <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
               <div class="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                   <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-4">Resumen del Turno</h3>
                   <div class="flex items-start gap-4 mb-4">
                       <div class="bg-primary/10 p-2.5 rounded-lg text-primary"><span class="material-symbols-outlined">agriculture</span></div>
                       <div>
                           <p class="text-sm font-medium text-slate-500 dark:text-gray-400">Vehículo</p>
                           <p class="text-base font-bold text-slate-900 dark:text-white">Tractor John Deere</p>
                       </div>
                   </div>
                   <div class="flex items-start gap-4 mb-4">
                       <div class="bg-primary/10 p-2.5 rounded-lg text-primary"><span class="material-symbols-outlined">build</span></div>
                       <div>
                           <p class="text-sm font-medium text-slate-500 dark:text-gray-400">Servicio</p>
                           <p class="text-base font-bold text-slate-900 dark:text-white">Electricidad General</p>
                       </div>
                   </div>
                   <div class="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                       <span class="material-symbols-outlined text-primary text-xl">info</span>
                       <p class="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                           Debido al tipo de vehículo, hemos reservado un bloque de <strong>3 horas</strong> en nuestra agenda para asegurar un servicio completo.
                       </p>
                   </div>
               </div>

               {/* Time Slots */}
               <div class="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col flex-1">
                  <div class="mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                     <h2 class="text-lg font-bold text-slate-900 dark:text-white">Horarios: 15 de Agosto</h2>
                  </div>
                  <div class="overflow-y-auto max-h-[400px] pr-1">
                     <div class="mb-6">
                        <div class="flex items-center gap-2 mb-3">
                           <span class="material-symbols-outlined text-slate-500 text-sm">wb_sunny</span>
                           <span class="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase">Mañana</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                           <button class="py-2 px-1 rounded border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-sm font-medium line-through cursor-not-allowed" disabled>08:00</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">08:30</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">09:00</button>
                           <button class="py-2 px-1 rounded bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-surface-dark">10:00</button>
                           <button class="py-2 px-1 rounded border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-sm font-medium line-through cursor-not-allowed" disabled>11:00</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">11:30</button>
                        </div>
                     </div>
                     <div>
                        <div class="flex items-center gap-2 mb-3">
                           <span class="material-symbols-outlined text-slate-500 text-sm">wb_twilight</span>
                           <span class="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase">Tarde</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">13:30</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">14:00</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">15:00</button>
                           <button class="py-2 px-1 rounded border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-sm font-medium line-through cursor-not-allowed" disabled>16:30</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">17:00</button>
                           <button class="py-2 px-1 rounded border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-medium transition-all hover:bg-primary/5">17:30</button>
                        </div>
                     </div>
                  </div>
                   <div class="mt-auto pt-4 text-center">
                      <p class="text-xs text-slate-500 dark:text-gray-500">* Horario Argentina (GMT-3)</p>
                   </div>
               </div>
            </div>
          </div>

          <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={() => navigate('/book/step3')}
                class="w-full md:w-auto px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  Atrás
              </button>
              <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <p class="text-sm text-slate-500 dark:text-gray-400 hidden md:block">
                      Turno seleccionado: <strong class="text-slate-900 dark:text-white">15 Ago, 10:00 hs</strong>
                  </p>
                  <button 
                    onClick={() => navigate('/book/success')}
                    class="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                  >
                      Confirmar Horario
                      <span class="material-symbols-outlined text-sm">check</span>
                  </button>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingStep4;