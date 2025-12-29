import React from 'react';

const Budget: React.FC = () => {
  return (
    <div class="max-w-[1280px] mx-auto flex flex-col gap-8">
       {/* Header Card */}
       <div class="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div class="flex flex-col md:flex-row justify-between gap-4 md:items-start">
             <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                   <span class="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Pendiente de Aprobación</span>
                   <span class="text-gray-400 text-sm">Emitido: 12 Oct, 2023</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-[#111518] dark:text-white leading-tight">Reparación de Alternador y Sistema de Arranque</h1>
                <p class="text-gray-500 dark:text-gray-400">Presupuesto #4023</p>
             </div>
             <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">download</span>
                <span>Descargar PDF</span>
             </button>
          </div>
          <hr class="my-6 border-gray-100 dark:border-gray-700"/>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div><p class="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Vehículo</p><p class="font-medium">Toyota Hilux 2018</p></div>
             <div><p class="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Patente</p><p class="font-medium uppercase">AA123BB</p></div>
             <div><p class="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Kilometraje</p><p class="font-medium">145.200 km</p></div>
             <div><p class="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Válido Hasta</p><p class="font-medium text-red-600 dark:text-red-400">27 Oct, 2023</p></div>
          </div>
       </div>

       <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main class="lg:col-span-8 flex flex-col gap-8">
             {/* Evidence */}
             <div class="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                   <span class="material-symbols-outlined text-primary">perm_media</span>
                   <h2 class="text-xl font-bold">Evidencia del Diagnóstico</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div class="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                      <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCgHreFc3w7QgdohCETG4FMfkN1Y4YtD9fk0hHGFaOz5XHDwNtvKmxHUnexpYi01tL5oBxIbDfAqV9f1PPcYEKS_O5mJJzXcaeVwMO3sNhfCWH9sWnJhZjK88tqhUzCsCScVDh7bvsQ5CD6Reln4diC0JEtr9aBDxSazIM_m8zIFdmbYilY-or7O-g1ROab3zNtydWAJmK2AwvvM8xXhBPLOSrop9kCDcrNGuQsa90fVwxwepOByknPnLT1spo-uH45ruOz7qf3t1M")'}}></div>
                      <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><p class="text-white text-xs font-medium">Bobina quemada</p></div>
                   </div>
                   <div class="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                      <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDz7rLViUUIsPCcCX4zUTVqAuSeU-crfkmfw5rq6ciPYmVIsAKRnzd5eS2J1EyDE6_RjA2BMcQLEcUXgQ2bwE46rpQZ8UWpNEE7zGQy-Xs-W5YhSADgmsv_DxUc-j8kdc63BQTKHF7n5sb1S9geMqT_W3_QHSnsYRt8tfb4ESZkXvoz3jR8cFRW9rsQiyQnKZgYnIKkpLvU4FvTrxrzbymGkowppHuiZEVcBO0JIIog3Cp9IUDuDY3JTQS6ClkGqP2uidq_JUucgx4")'}}></div>
                      <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><p class="text-white text-xs font-medium">Lectura de voltaje baja</p></div>
                   </div>
                   <div class="group relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer">
                      <div class="absolute inset-0 bg-cover bg-center opacity-80" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5tHeXDoH6Wo5Mb6svQACM0IeDZoEtBSOsphrfHzuEFAOaf5XExQ4HgwUPZE1K5xwWocwBrFxUjUjkmUuMGZ11HH1WqC0fJpg5xYisMxdE8IOOkpUS3ffp8OCn-F6QiCJk0i2aySUukjJZTHxKwAUmAc1eDFkxjk34nb7y9K6odLEJIlp3yibGaL4VByI8t5EH_w6tgluEXi8l7DmSVaGbPP4HW66XVCv9ZeGgNMQyb2sgAK2pvA44RDHA9KPiccVNA0CvnX75ogI")'}}></div>
                      <div class="z-10 size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40"><span class="material-symbols-outlined text-white">play_arrow</span></div>
                      <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><p class="text-white text-xs font-medium">Prueba de arranque (Video)</p></div>
                   </div>
                </div>
                <div class="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                   <p class="text-sm text-gray-700 dark:text-gray-300">
                      <span class="font-bold text-primary">Diagnóstico Técnico:</span> Se detectó una falla crítica en el regulador de voltaje del alternador, lo que causó sobrecalentamiento en la bobina. Se recomienda el reemplazo del alternador y la revisión del cableado principal.
                   </p>
                </div>
             </div>

             {/* Labor & Parts */}
             <div class="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                   <span class="material-symbols-outlined text-primary">engineering</span>
                   <h2 class="text-xl font-bold">Detalle de Costos</h2>
                </div>
                <div class="mb-8">
                   <h3 class="text-sm font-bold uppercase text-gray-500 tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Mano de Obra</h3>
                   <div class="flex flex-col gap-3">
                      {[
                        {desc: 'Diagnóstico Computarizado y Eléctrico', sub: '2.5 horas', cost: '$25,000'},
                        {desc: 'Desmontaje y Montaje de Alternador', sub: '1.5 horas', cost: '$15,000'},
                        {desc: 'Reparación de Cableado Principal', sub: 'Insumos incluidos', cost: '$8,500'},
                      ].map((item, i) => (
                         <div key={i} class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                            <div><p class="font-medium">{item.desc}</p><p class="text-xs text-gray-500">{item.sub}</p></div>
                            <p class="font-bold font-mono">{item.cost}</p>
                         </div>
                      ))}
                   </div>
                </div>
                <div>
                    <div class="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                       <h3 class="text-sm font-bold uppercase text-gray-500 tracking-wider">Repuestos</h3>
                       <span class="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium">Seleccione una opción</span>
                    </div>
                    <div class="flex flex-col gap-6">
                       {/* Part 1 */}
                       <div class="flex flex-col">
                          <div class="flex items-center gap-2 mb-3">
                             <span class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 rounded"><span class="material-symbols-outlined text-[18px]">settings</span></span>
                             <p class="font-bold">Alternador Completo (12V 90A)</p>
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-8">
                             <label class="relative flex items-start p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-all hover:shadow-md">
                                <div class="flex items-center h-5"><input defaultChecked type="radio" name="alternator" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/></div>
                                <div class="ml-3 flex-1">
                                   <div class="flex justify-between"><span class="block text-sm font-bold text-primary">Original (OEM)</span><span class="block text-sm font-bold font-mono">$245,000</span></div>
                                   <p class="mt-1 text-xs text-gray-500">Marca: Denso / Toyota. Garantía: 12 meses.</p>
                                   <span class="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Recomendado</span>
                                </div>
                             </label>
                             <label class="relative flex items-start p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70 hover:opacity-100 cursor-pointer transition-all hover:border-gray-300">
                                <div class="flex items-center h-5"><input type="radio" name="alternator" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/></div>
                                <div class="ml-3 flex-1">
                                   <div class="flex justify-between"><span class="block text-sm font-bold text-gray-700 dark:text-gray-300">Alternativo</span><span class="block text-sm font-bold font-mono">$165,000</span></div>
                                   <p class="mt-1 text-xs text-gray-500">Marca: Genérica. Garantía: 3 meses.</p>
                                </div>
                             </label>
                          </div>
                       </div>
                       {/* Part 2 */}
                       <div class="flex flex-col">
                          <div class="flex items-center gap-2 mb-3">
                             <span class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 rounded"><span class="material-symbols-outlined text-[18px]">battery_charging_full</span></span>
                             <p class="font-bold">Correa Poli-V</p>
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-8">
                             <label class="relative flex items-start p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70 hover:opacity-100 cursor-pointer transition-all hover:border-gray-300">
                                <div class="flex items-center h-5"><input type="radio" name="belt" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/></div>
                                <div class="ml-3 flex-1">
                                   <div class="flex justify-between"><span class="block text-sm font-bold text-gray-700 dark:text-gray-300">Original (OEM)</span><span class="block text-sm font-bold font-mono">$28,000</span></div>
                                   <p class="mt-1 text-xs text-gray-500">Marca: Toyota.</p>
                                </div>
                             </label>
                             <label class="relative flex items-start p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-all hover:shadow-md">
                                <div class="flex items-center h-5"><input defaultChecked type="radio" name="belt" class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/></div>
                                <div class="ml-3 flex-1">
                                   <div class="flex justify-between"><span class="block text-sm font-bold text-primary">Alternativo</span><span class="block text-sm font-bold font-mono">$12,000</span></div>
                                   <p class="mt-1 text-xs text-gray-500">Marca: SKF / Gates.</p>
                                   <span class="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Seleccionado</span>
                                </div>
                             </label>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </main>
          
          <aside class="lg:col-span-4 space-y-6">
             <div class="sticky top-4">
                <div class="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg shadow-gray-100 dark:shadow-none">
                   <h3 class="text-lg font-bold mb-6">Resumen del Presupuesto</h3>
                   <div class="space-y-4 mb-6">
                      <div class="flex justify-between text-sm"><span class="text-gray-500">Mano de Obra (Subtotal)</span><span class="font-medium">$48,500</span></div>
                      <div class="flex justify-between text-sm"><span class="text-gray-500">Repuestos (Subtotal)</span><span class="font-medium">$257,000</span></div>
                      <div class="flex justify-between text-sm"><span class="text-gray-500">IVA (21%)</span><span class="font-medium">$64,155</span></div>
                   </div>
                   <div class="border-t-2 border-dashed border-gray-200 dark:border-gray-700 py-4 mb-6">
                      <div class="flex justify-between items-end">
                         <span class="text-base font-bold text-gray-700 dark:text-gray-300">Total Estimado</span>
                         <span class="text-3xl font-black text-primary font-mono tracking-tight">$369,655</span>
                      </div>
                      <p class="text-xs text-gray-400 mt-2 text-right">Pesos Argentinos</p>
                   </div>
                   <div class="flex flex-col gap-3">
                      <button class="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                         <span class="material-symbols-outlined group-hover:scale-110 transition-transform">check_circle</span>
                         Aprobar Presupuesto
                      </button>
                      <button class="w-full bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                         <span class="material-symbols-outlined text-red-500">cancel</span>
                         Rechazar
                      </button>
                   </div>
                   <div class="mt-6 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                      <span class="material-symbols-outlined text-[16px] mt-0.5">verified_user</span>
                      <p>Al aprobar, usted autoriza el inicio inmediato de las reparaciones. Sin costos ocultos.</p>
                   </div>
                </div>
                <div class="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                   <div class="size-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm text-primary">
                      <span class="material-symbols-outlined">support_agent</span>
                   </div>
                   <div>
                      <p class="text-xs font-bold text-gray-500 uppercase">¿Dudas?</p>
                      <p class="font-bold text-sm">+54 11 1234-5678</p>
                   </div>
                </div>
             </div>
          </aside>
       </div>
    </div>
  );
};

export default Budget;