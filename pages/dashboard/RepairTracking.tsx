import React from 'react';
import { useNavigate } from 'react-router-dom';

const RepairTracking: React.FC = () => {
  return (
    <div class="max-w-[960px] mx-auto flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="text-[#111518] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Seguimiento de Reparación #4921</h1>
          <p class="text-[#617989] dark:text-gray-400 text-base font-normal leading-normal">Visualización en tiempo real del estado de su vehículo</p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center justify-center rounded-lg bg-[#eef8ff] dark:bg-gray-800 text-primary h-10 px-4 text-sm font-bold gap-2 hover:bg-[#dbeeff] transition-colors">
            <span class="material-symbols-outlined text-[20px]">chat</span>
            Contactar Taller
          </button>
          <button class="flex items-center justify-center rounded-lg bg-primary text-white h-10 px-4 text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
            Ver Presupuesto
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 flex flex-col gap-6">
          {/* Status Card */}
          <div class="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
            <div class="flex flex-col md:flex-row items-stretch gap-6">
              <div class="flex flex-col gap-3 flex-[2_2_0px] justify-center">
                <div class="inline-flex items-center gap-2 self-start rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  En Progreso
                </div>
                <h3 class="text-[#111518] dark:text-white text-2xl font-bold leading-tight">Estado Actual: Pruebas de Calidad</h3>
                <p class="text-[#617989] dark:text-gray-300 text-base font-normal leading-relaxed">
                  Estamos verificando la carga del alternador y la tensión de arranque. El equipo técnico está realizando las últimas pruebas de esfuerzo para asegurar que la falla reportada ha sido solucionada completamente.
                </p>
                <div class="mt-2 flex items-center gap-2 text-sm text-[#617989] dark:text-gray-400 bg-background-light dark:bg-black/20 p-3 rounded-lg">
                  <span class="material-symbols-outlined text-primary">schedule</span>
                  <span>Entrega Estimada: <strong>Viernes 14 de Octubre, 16:00 hs</strong></span>
                </div>
              </div>
              <div class="w-full md:w-1/3 bg-center bg-no-repeat bg-cover rounded-lg min-h-[160px]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCZcTaaosqaWY4kUNucgGdU31V6eyJqd0JWSkpPKe-XHcXXjWUmxnkrV0-jVpaypiL1Qj9Cl-n1Ut0YthF5UH-N3RX1txlM-ss3KOLBwYrAcEnjTiiOus7Q_Yx43uyEuW8_RbZ025zK5FLxhan8NIQ-BtOLLDtCcjWoTG3jvc-9w5gWhVbh3tD7IaaHNZWbH4bhqE5ojCmHLB9NpAx-QwDXj_jty7lTjWRu4m_BVPKZ5WbLuOhaWcwsKiMDpXTnXd6Kri4rhe_uITc")'}}></div>
            </div>
          </div>

          {/* Timeline */}
          <div class="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 overflow-hidden">
            <h3 class="text-lg font-bold text-[#111518] dark:text-white mb-6">Línea de Tiempo</h3>
            <div class="hidden md:flex justify-between items-center relative px-2">
               <div class="absolute top-[15px] left-0 w-full h-[3px] bg-[#dbe1e6] dark:bg-gray-700 -z-10"></div>
               {['Recibido', 'Diagnóstico', 'Aprobado', 'Repuestos'].map((step, i) => (
                  <div key={i} class="flex flex-col items-center gap-2 relative w-24">
                     <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center z-10"><span class="material-symbols-outlined text-sm font-bold">check</span></div>
                     <p class="text-xs font-bold text-center text-[#111518] dark:text-white">{step}</p>
                     <div class="absolute top-[15px] left-1/2 w-full h-[3px] bg-green-500 -z-10"></div>
                     <div class="absolute top-[15px] right-1/2 w-full h-[3px] bg-green-500 -z-10"></div>
                  </div>
               ))}
               <div class="flex flex-col items-center gap-2 relative w-24">
                   <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center z-10"><span class="material-symbols-outlined text-sm font-bold">check</span></div>
                   <p class="text-xs font-bold text-center text-[#111518] dark:text-white">Reparación</p>
                   <div class="absolute top-[15px] left-1/2 w-full h-[3px] bg-primary -z-10"></div>
                   <div class="absolute top-[15px] right-1/2 w-full h-[3px] bg-green-500 -z-10"></div>
               </div>
               <div class="flex flex-col items-center gap-2 relative w-24">
                   <div class="w-8 h-8 rounded-full bg-primary text-white ring-4 ring-blue-100 dark:ring-blue-900 flex items-center justify-center z-10 shadow-lg scale-110"><span class="material-symbols-outlined text-sm font-bold">flag</span></div>
                   <p class="text-xs font-bold text-center text-primary">Pruebas</p>
                   <div class="absolute top-[15px] left-1/2 w-full h-[3px] bg-[#dbe1e6] dark:bg-gray-700 -z-10"></div>
                   <div class="absolute top-[15px] right-1/2 w-full h-[3px] bg-primary -z-10"></div>
               </div>
               <div class="flex flex-col items-center gap-2 relative w-24">
                   <div class="w-8 h-8 rounded-full bg-white border-2 border-[#dbe1e6] dark:border-gray-600 dark:bg-gray-800 text-[#dbe1e6] flex items-center justify-center z-10"><span class="material-symbols-outlined text-sm font-bold">check</span></div>
                   <p class="text-xs font-medium text-center text-[#617989] dark:text-gray-500">Listo</p>
                   <div class="absolute top-[15px] right-1/2 w-full h-[3px] bg-[#dbe1e6] dark:bg-gray-700 -z-10"></div>
               </div>
            </div>
             {/* Mobile Timeline */}
            <div class="md:hidden flex flex-col pl-2">
               {[
                 {step: 'Recibido', time: '10 Oct, 09:00', status: 'done'},
                 {step: 'Diagnóstico', time: '11 Oct, 11:30', status: 'done'},
                 {step: 'Esperando Aprobación', time: '11 Oct, 14:00', status: 'done'},
                 {step: 'Repuestos Pedidos', time: '12 Oct, 09:15', status: 'done'},
                 {step: 'En Reparación', time: '12 Oct, 16:45', status: 'done'},
                 {step: 'Pruebas de Calidad', time: 'En curso', status: 'active'},
               ].map((item, i) => (
                  <div key={i} class="flex gap-4 min-h-[3rem]">
                     <div class="flex flex-col items-center">
                        <div class={`w-6 h-6 rounded-full ${item.status === 'done' ? 'bg-green-500 text-white' : 'bg-primary text-white ring-4 ring-blue-100 dark:ring-blue-900'} flex items-center justify-center shrink-0`}>
                           <span class="material-symbols-outlined text-[14px]">{item.status === 'active' ? 'flag' : 'check'}</span>
                        </div>
                        <div class={`w-[2px] ${item.status === 'done' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'} h-full`}></div>
                     </div>
                     <div class="pb-6">
                        <p class={`text-sm font-bold ${item.status === 'active' ? 'text-primary' : 'text-[#111518] dark:text-white'}`}>{item.step}</p>
                        <p class={`text-xs ${item.status === 'active' ? 'text-primary' : 'text-gray-500'}`}>{item.time}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-6">
           {/* Details */}
           <div class="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
               <h3 class="text-[#111518] dark:text-white text-lg font-bold leading-tight mb-4">Detalles del Vehículo</h3>
               <div class="flex flex-col gap-4">
                  {[
                    {icon: 'agriculture', label: 'Vehículo', value: 'Tractor John Deere 6155M'},
                    {icon: 'pin', label: 'Patente', value: 'AE 921 QQ'},
                    {icon: 'build', label: 'Problema', value: 'Falla en el arranque'},
                    {icon: 'person', label: 'Técnico', value: 'Carlos M.'}
                  ].map((d, i) => (
                    <div key={i} class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                       <div class="flex items-center gap-3">
                          <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300"><span class="material-symbols-outlined">{d.icon}</span></div>
                          <span class="text-[#617989] dark:text-gray-400 text-sm font-medium">{d.label}</span>
                       </div>
                       <span class="text-[#111518] dark:text-white text-sm font-semibold text-right">{d.value}</span>
                    </div>
                  ))}
               </div>
           </div>
           
           {/* Activity */}
           <div class="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col h-full">
               <h3 class="text-[#111518] dark:text-white text-lg font-bold leading-tight mb-4">Actividad Reciente</h3>
               <div class="flex flex-col gap-4 relative">
                   <div class="absolute top-2 left-[7px] w-[1px] h-[80%] bg-gray-200 dark:bg-gray-700 -z-10"></div>
                   {[
                     {time: 'Hoy, 10:30 AM', text: 'Inicio de pruebas de carga', color: 'bg-primary'},
                     {time: 'Ayer, 16:45 PM', text: 'Reparación completada', color: 'bg-gray-300 dark:bg-gray-600'},
                     {time: '12 Oct, 09:15 AM', text: 'Repuestos recibidos', color: 'bg-gray-300 dark:bg-gray-600'},
                     {time: '11 Oct, 14:00 PM', text: 'Presupuesto aprobado por el cliente', color: 'bg-gray-300 dark:bg-gray-600'}
                   ].map((act, i) => (
                      <div key={i} class="flex gap-3">
                         <div class={`w-4 h-4 rounded-full ${act.color} border-2 border-white dark:border-[#1a2632] shrink-0 mt-1`}></div>
                         <div class="flex flex-col">
                            <p class="text-xs text-[#617989] dark:text-gray-400">{act.time}</p>
                            <p class="text-sm font-medium text-[#111518] dark:text-white">{act.text}</p>
                         </div>
                      </div>
                   ))}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RepairTracking;