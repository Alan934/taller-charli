import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';

const BookingStep3: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white transition-colors duration-200 min-h-screen">
      <BookingHeader />
      <main class="flex flex-col items-center justify-start w-full py-8 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-4xl flex flex-col gap-6">
          {/* Progress Section */}
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-800">
            <div class="flex flex-col gap-3">
              <div class="flex gap-6 justify-between items-end">
                <div>
                  <p class="text-slate-900 dark:text-white text-lg font-bold">Solicitar Turno</p>
                  <p class="text-slate-500 dark:text-gray-400 text-sm mt-1">Paso 3 de 4: Evidencia Visual</p>
                </div>
                <p class="text-primary font-bold text-lg">75%</p>
              </div>
              <div class="h-2.5 w-full rounded-full bg-background-light dark:bg-background-dark overflow-hidden">
                <div class="h-full bg-primary rounded-full" style={{width: '75%'}}></div>
              </div>
              <div class="flex justify-between text-xs font-medium text-slate-500 dark:text-gray-400 mt-1">
                <span>Vehículo</span>
                <span>Servicio</span>
                <span class="text-primary">Archivos</span>
                <span>Confirmación</span>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-gray-800 flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Adjuntar Fotos o Videos
              </h1>
              <p class="text-slate-500 dark:text-gray-400 text-base leading-relaxed max-w-2xl">
                Ayudanos a entender el problema antes de que llegues para un pre-diagnóstico más eficiente. 
                <span class="font-semibold text-slate-900 dark:text-white mx-1">Esto es opcional</span>, pero muy recomendado.
              </p>
            </div>

            <div class="group relative flex flex-col items-center justify-center w-full min-h-[240px] rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-background-light/50 dark:bg-background-dark/50">
              <input type="file" multiple accept="image/*,video/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div class="flex flex-col items-center gap-4 text-center px-4 pointer-events-none transition-transform group-hover:scale-105 duration-200">
                <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span class="material-symbols-outlined text-4xl">cloud_upload</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                  Arrastrá tus archivos aquí
                </h3>
                <p class="text-slate-500 dark:text-gray-400 text-sm">
                  o <span class="text-primary font-bold underline decoration-2 decoration-primary/30 underline-offset-4">haz clic para buscar</span> en tu dispositivo
                </p>
                <p class="text-xs text-slate-500 dark:text-gray-400 mt-2 bg-surface-light dark:bg-surface-dark px-3 py-1 rounded-full border border-slate-200 dark:border-gray-700">
                  Soporta: JPG, PNG, MP4 (Máx 20MB)
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <h4 class="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Archivos Seleccionados</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Item 1 */}
                <div class="relative flex items-start gap-4 p-3 rounded-lg border border-slate-200 dark:border-gray-800 bg-background-light dark:bg-background-dark group">
                  <div class="relative size-16 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeJFmPfhcaXZUAWQP0FWhUJwIWHJDLO2ZYJAUf7C3NhBgt0HH7FwnRudBzmgGSi6CTUQWYeflXqcbsBJFN8heL4LC3FFpbWZdNLEict3W7OSPJ0FiIkQNAMabmPEoEVwK0FltTldoPIGnLA2-QLi3yVgYR4GIUB1FuCL0_JJTAPvxh2QKpoFsCiBXvtmAEGmxBRzRTD6WycWSIdc6OGFPcRltxyPuAw3mEPvZ0LpLwsrDEs2s4CT1ax5ixfrCqLKUXNO-iyWtGY08" alt="Evidence" class="size-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col justify-center h-full gap-1">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">foto_tablero_error.jpg</p>
                    <p class="text-xs text-slate-500 dark:text-gray-400">2.4 MB</p>
                    <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <span class="material-symbols-outlined text-base">check_circle</span>
                      Listo
                    </div>
                  </div>
                  <button class="p-2 text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
                {/* File Item 2 */}
                <div class="relative flex items-start gap-4 p-3 rounded-lg border border-slate-200 dark:border-gray-800 bg-background-light dark:bg-background-dark group">
                   <div class="relative size-16 shrink-0 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center text-white/80">
                      <span class="material-symbols-outlined text-3xl">play_circle</span>
                      <div class="absolute inset-0 bg-black/20"></div>
                   </div>
                   <div class="flex-1 min-w-0 flex flex-col justify-center h-full gap-2">
                      <div class="flex justify-between items-baseline">
                         <p class="text-sm font-bold text-slate-900 dark:text-white truncate">ruido_arranque.mp4</p>
                         <span class="text-xs font-medium text-primary">85%</span>
                      </div>
                      <div class="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                         <div class="h-full bg-primary rounded-full animate-pulse" style={{width: '85%'}}></div>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-gray-400">14.2 MB • Subiendo...</p>
                   </div>
                   <button class="p-2 text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <span class="material-symbols-outlined">close</span>
                   </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 mt-2 border-t border-slate-200 dark:border-gray-800">
              <button 
                onClick={() => navigate('/book/step2')}
                class="w-full sm:w-auto px-6 h-12 rounded-lg text-slate-500 dark:text-gray-400 font-medium hover:bg-background-light dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">arrow_back</span>
                <span>Volver</span>
              </button>
              <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                 <button 
                   onClick={() => navigate('/book/step4')}
                   class="hidden sm:flex px-6 h-12 rounded-lg text-primary font-medium hover:bg-primary/5 transition-colors items-center justify-center"
                 >
                   Omitir este paso
                 </button>
                 <button 
                   onClick={() => navigate('/book/step4')}
                   class="w-full sm:w-auto px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                 >
                   <span>Continuar</span>
                   <span class="material-symbols-outlined">arrow_forward</span>
                 </button>
              </div>
              <button onClick={() => navigate('/book/step4')} class="sm:hidden w-full h-10 rounded-lg text-sm text-slate-500 font-medium flex items-center justify-center">
                 Omitir este paso
              </button>
            </div>
          </div>
          
           <div class="flex gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <div class="shrink-0 text-primary">
                 <span class="material-symbols-outlined">info</span>
              </div>
              <div>
                 <p class="text-sm font-bold text-slate-900 dark:text-white mb-1">¿Por qué subir evidencia?</p>
                 <p class="text-sm text-slate-500 dark:text-gray-400">
                    Las fotos y videos nos permiten preparar los repuestos necesarios antes de tu llegada, reduciendo el tiempo de espera en el taller hasta en un 40%.
                 </p>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
};

export default BookingStep3;