import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-[#111518] dark:text-gray-100">
      <BookingHeader />
      <main class="flex-grow flex flex-col items-center justify-center py-10 px-4 sm:px-6">
        <div class="w-full max-w-3xl bg-white dark:bg-[#1a2632] rounded-xl shadow-md border border-[#e5e7eb] dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div class="flex flex-col items-center text-center pt-10 pb-6 px-8 border-b border-[#f0f3f4] dark:border-gray-700 bg-gradient-to-b from-primary/5 to-transparent">
             <div class="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span class="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">check_circle</span>
             </div>
             <h1 class="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111518] dark:text-white mb-3">¡Turno Confirmado!</h1>
             <p class="text-[#617989] dark:text-gray-400 text-base font-normal leading-normal max-w-lg">
                Tu cita en <strong>Taller Charli</strong> ha sido agendada con éxito. Te esperamos para brindarte el mejor servicio.
             </p>
          </div>

          <div class="px-8 py-6">
             <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Detalles del Turno</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div class="flex flex-col gap-1 border-l-4 border-primary pl-4 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                   <span class="text-[#617989] dark:text-gray-400 text-xs font-medium uppercase">Fecha</span>
                   <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-sm">calendar_month</span>
                      <p class="text-[#111518] dark:text-white text-base font-semibold">15 de Noviembre, 2023</p>
                   </div>
                </div>
                <div class="flex flex-col gap-1 border-l-4 border-primary pl-4 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                   <span class="text-[#617989] dark:text-gray-400 text-xs font-medium uppercase">Hora</span>
                   <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                      <p class="text-[#111518] dark:text-white text-base font-semibold">09:30 AM</p>
                   </div>
                </div>
                <div class="flex flex-col gap-1 border-l-4 border-primary pl-4 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                   <span class="text-[#617989] dark:text-gray-400 text-xs font-medium uppercase">Vehículo / Parte</span>
                   <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-sm">directions_car</span>
                      <p class="text-[#111518] dark:text-white text-base font-semibold">Camión Scania (Alternador)</p>
                   </div>
                </div>
                <div class="flex flex-col gap-1 border-l-4 border-primary pl-4 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
                   <span class="text-[#617989] dark:text-gray-400 text-xs font-medium uppercase">Servicio Solicitado</span>
                   <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-sm">build</span>
                      <p class="text-[#111518] dark:text-white text-base font-semibold">Reparación eléctrica general</p>
                   </div>
                </div>
                <div class="col-span-1 md:col-span-2 flex flex-col gap-1 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1">
                   <span class="text-[#617989] dark:text-gray-400 text-xs font-medium uppercase">Dirección del Taller</span>
                   <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                         <span class="material-symbols-outlined text-gray-500 text-sm">location_on</span>
                         <p class="text-[#111518] dark:text-white text-base font-medium">Av. Principal 123, Zona Industrial</p>
                      </div>
                      <a href="#" class="text-primary text-xs font-bold hover:underline ml-2">Ver en Mapa</a>
                   </div>
                </div>
             </div>
          </div>

          <div class="px-8 pb-8 pt-2">
             <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-dashed border-[#dbe1e6] dark:border-gray-600 bg-primary/5 p-4">
                <div class="size-10 min-w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                   <span class="material-symbols-outlined">mark_email_read</span>
                </div>
                <div class="flex-1">
                   <p class="text-[#111518] dark:text-white text-sm font-bold leading-tight">Confirmación enviada</p>
                   <p class="text-[#617989] dark:text-gray-400 text-sm font-normal leading-normal mt-1">Hemos enviado los detalles del turno y el comprobante a tu correo electrónico registrado y por WhatsApp.</p>
                </div>
                <button class="text-primary hover:text-blue-700 text-sm font-bold whitespace-nowrap self-end sm:self-center">Reenviar</button>
             </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 px-8 py-6 bg-[#f8fafc] dark:bg-[#151f28] border-t border-[#e5e7eb] dark:border-gray-700">
             <button onClick={() => navigate('/dashboard')} class="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-sm hover:bg-blue-600 hover:shadow-md transition-all">
                <span class="mr-2 material-symbols-outlined text-[20px]">calendar_view_day</span>
                <span>Ver Mis Turnos</span>
             </button>
             <button class="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-[#1a2632] border border-[#dbe1e6] dark:border-gray-600 text-[#111518] dark:text-white text-base font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <span class="mr-2 material-symbols-outlined text-[20px]">download</span>
                <span>Descargar Comprobante</span>
             </button>
          </div>
        </div>

        <div class="mt-8 flex flex-col items-center gap-2">
           <p class="text-sm text-[#617989] dark:text-gray-400">¿Necesitas cambiar tu turno?</p>
           <div class="flex gap-6">
              <a href="#" class="text-sm font-semibold text-[#111518] dark:text-gray-300 hover:text-primary transition-colors border-b border-transparent hover:border-primary">Cancelar Turno</a>
              <a href="#" class="text-sm font-semibold text-[#111518] dark:text-gray-300 hover:text-primary transition-colors border-b border-transparent hover:border-primary">Reprogramar</a>
              <a href="#" class="text-sm font-semibold text-[#111518] dark:text-gray-300 hover:text-primary transition-colors border-b border-transparent hover:border-primary">Ayuda</a>
           </div>
        </div>
      </main>
    </div>
  );
};

export default BookingSuccess;