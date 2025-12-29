import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';

const BookingStep2: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="bg-background-light dark:bg-background-dark font-display text-[#111518] dark:text-gray-100 antialiased min-h-screen flex flex-col">
      <BookingHeader />
      <main class="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-[960px]">
        {/* Progress Bar */}
        <div class="mb-10">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Progreso de solicitud</span>
            <span class="text-sm font-medium text-primary">Paso 2 de 3</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{width: '66%'}}></div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Vehículo</span>
            <span class="font-bold text-primary">Descripción</span>
            <span>Confirmación</span>
          </div>
        </div>

        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-[#111518] dark:text-white mb-3">Describe el problema</h1>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Cuéntanos qué sucede con tu vehículo o repuesto para que el equipo de Charli pueda prepararse.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-primary">build_circle</span>
                <h3 class="text-lg font-bold text-[#111518] dark:text-white">Fallas Comunes</h3>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecciona una o más opciones que describan tu situación (Opcional):</p>
              <div class="flex flex-wrap gap-3">
                {[
                  { id: 'no_arranca', icon: 'no_crash', label: 'No arranca' },
                  { id: 'bateria', icon: 'battery_alert', label: 'Batería muerta' },
                  { id: 'luces', icon: 'lightbulb', label: 'Luces no funcionan' },
                  { id: 'tablero', icon: 'warning', label: 'Testigo tablero' },
                  { id: 'alternador', icon: 'bolt', label: 'Alternador no carga' },
                  { id: 'burro', icon: 'settings_power', label: 'Burro de arranque' },
                  { id: 'ruido', icon: 'volume_up', label: 'Ruido extraño' },
                  { id: 'mantenimiento', icon: 'car_repair', label: 'Mantenimiento' }
                ].map((item) => (
                  <label key={item.id} class="cursor-pointer group">
                    <input class="peer sr-only" name="issue" type="checkbox" value={item.id} />
                    <div class="flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-gray-800 rounded-lg peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary peer-checked:text-primary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                      <span class="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span class="text-sm font-medium">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-primary">edit_note</span>
                <h3 class="text-lg font-bold text-[#111518] dark:text-white">Detalles Específicos</h3>
              </div>
              <div class="relative">
                <textarea 
                  class="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-gray-800 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6 resize-none" 
                  placeholder="Ej: El auto hace un sonido 'click-click' cuando giro la llave en frío, pero las luces prenden normal. Es un Volkswagen Gol 2015." 
                  rows={6}
                ></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">0 / 500</div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 transition-colors" htmlFor="dropzone-file">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <span class="material-symbols-outlined text-gray-400 text-3xl mb-2">cloud_upload</span>
                      <p class="text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click para subir foto/video</span> o arrastra y suelta</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG o MP4 (MAX. 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" class="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Summary */}
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
              <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden relative">
                <div class="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDP_l0Apa_Gh_liQdZ5TIWdJ0FMyepYWWb-7PttUu72fJ5Y_m48PL_6Yn4cd-WpH5c3rbquRtJoPOhCX-Xwbv0JKndEF_zXyKNHFQJ690rr8KfdFzqc91ipFbj48hyjM94NsYwxTdjY4cuHOs33heugSIBlBLwTkH_4fzWnOQs6WA4vNUxRknjhGdEWLFgH8Us3RPRo7b0GuubHiPWSVlVtFErE7g76DcQohTBIBW9QlBtnAO5IWsWf3iRTffJ-pSYXgJFNK1rb7wU")'}}>
                  <div class="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
                </div>
                <div class="absolute bottom-4 left-4 text-white">
                  <p class="text-xs font-medium uppercase tracking-wider opacity-90">Resumen</p>
                  <h4 class="font-bold text-lg">Tu Solicitud</h4>
                </div>
              </div>
              <div class="p-6">
                <div class="flex flex-col gap-4">
                  <div class="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div class="bg-primary/10 p-2 rounded-lg h-fit text-primary">
                      <span class="material-symbols-outlined">directions_car</span>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Vehículo</p>
                      <p class="text-sm font-medium text-[#111518] dark:text-white">Ford Ranger 2019</p>
                      <a href="#" class="text-xs text-primary hover:underline mt-1 inline-block">Editar</a>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg h-fit text-gray-500 dark:text-gray-400">
                      <span class="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Turno</p>
                      <p class="text-sm italic text-gray-400">Pendiente de selección</p>
                    </div>
                  </div>
                </div>
                <div class="mt-8 flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/book/step3')}
                    class="flex w-full items-center justify-center rounded-lg bg-primary h-12 px-6 text-white text-base font-bold leading-normal hover:bg-primary-dark shadow-md hover:shadow-lg transition-all"
                  >
                    <span class="truncate">Continuar a Horarios</span>
                    <span class="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                  </button>
                  <button 
                    onClick={() => navigate('/book/step1')}
                    class="flex w-full items-center justify-center rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 h-10 px-6 text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal transition-colors"
                  >
                    Atrás
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer class="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 mt-auto py-8">
        <div class="container mx-auto px-4 sm:px-6 text-center text-gray-500 text-sm">
          <p>© 2024 Taller Charli Electricidad Automotriz. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingStep2;