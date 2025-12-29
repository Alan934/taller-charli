import React from 'react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div class="w-full flex flex-col gap-6">
            <div class="flex flex-wrap justify-between gap-3 pt-4">
                <div class="flex min-w-72 flex-col gap-2">
                    <h1 class="text-[#111518] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Historial de Servicio</h1>
                    <p class="text-[#617989] dark:text-gray-400 text-base font-normal leading-normal">Archivo digital de reparaciones, facturas y recomendaciones técnicas para su flota.</p>
                </div>
                <div class="flex items-center">
                    <button 
                        onClick={() => navigate('/book/step1')}
                        class="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <span class="material-symbols-outlined text-[20px]">add_circle</span>
                        Nuevo Turno
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Gasto Total (Año)', value: '$450.000', sub: '+12% vs año anterior', icon: 'payments', subColor: 'text-green-600' },
                    { label: 'Último Servicio', value: '12 Oct 2023', sub: 'Reparación Burro de Arranque', icon: 'history', subColor: 'text-[#617989] dark:text-gray-500' },
                    { label: 'Próximo Mantenimiento', value: '15 Nov 2023', sub: 'Toyota Hilux AB-123-CD', icon: 'event_upcoming', subColor: 'text-orange-600' }
                ].map((stat, i) => (
                    <div key={i} class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2632] border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm">
                        <div class="flex items-center justify-between">
                            <p class="text-[#617989] dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                            <span class="material-symbols-outlined text-primary">{stat.icon}</span>
                        </div>
                        <p class="text-[#111518] dark:text-white text-3xl font-bold leading-tight tracking-tight">{stat.value}</p>
                        <p class={`text-xs font-medium flex items-center gap-1 ${stat.subColor}`}>
                             {i === 2 && <span class="material-symbols-outlined text-[16px]">warning</span>}
                             {i === 0 && <span class="material-symbols-outlined text-[16px]">trending_up</span>}
                             {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            <div class="bg-white dark:bg-[#1A2632] rounded-xl border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm overflow-hidden">
                <div class="border-b border-[#dbe1e6] dark:border-[#2A3B4C] overflow-x-auto">
                    <div class="flex px-4 gap-8 min-w-max">
                        {['Todos', 'Camiones', 'Autos', 'Tractores', 'Partes Sueltas'].map((tab, i) => (
                             <a key={i} class={`group flex items-center justify-center border-b-[3px] ${i===0 ? 'border-b-primary' : 'border-b-transparent hover:border-b-gray-300'} py-4 px-2 gap-2 cursor-pointer transition-colors`}>
                                <span class={`material-symbols-outlined ${i===0 ? 'text-primary' : 'text-[#617989] dark:text-gray-400 group-hover:text-primary'}`}>
                                    {['format_list_bulleted', 'local_shipping', 'directions_car', 'agriculture', 'build'][i]}
                                </span>
                                <p class={`${i===0 ? 'text-primary' : 'text-[#617989] dark:text-gray-400'} group-hover:text-primary text-sm font-bold leading-normal tracking-[0.015em]`}>{tab}</p>
                            </a>
                        ))}
                    </div>
                </div>

                <div class="p-4 flex flex-col md:flex-row gap-4 items-center bg-background-light dark:bg-[#141e26] border-b border-[#dbe1e6] dark:border-[#2A3B4C]">
                    <label class="flex flex-col min-w-40 h-10 w-full md:flex-1">
                        <div class="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                            <div class="text-[#617989] flex border border-[#dbe1e6] dark:border-[#3A4D60] bg-white dark:bg-[#1A2632] items-center justify-center pl-3 rounded-l-lg border-r-0">
                                <span class="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input class="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[#111518] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe1e6] dark:border-[#3A4D60] bg-white dark:bg-[#1A2632] focus:border-primary h-full placeholder:text-[#617989] px-3 border-l-0 text-sm font-normal leading-normal" placeholder="Buscar por patente, tipo de reparación..." />
                        </div>
                    </label>
                    <div class="flex gap-3 w-full md:w-auto">
                        <button class="flex items-center gap-2 px-4 h-10 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] bg-white dark:bg-[#1A2632] text-sm font-medium text-[#111518] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#253341] transition-colors shadow-sm">
                            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>Fecha</span>
                        </button>
                        <button class="flex items-center gap-2 px-4 h-10 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] bg-white dark:bg-[#1A2632] text-sm font-medium text-[#111518] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#253341] transition-colors shadow-sm">
                            <span class="material-symbols-outlined text-[18px]">filter_list</span>
                            <span>Filtrar</span>
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 dark:bg-[#202E3C] border-b border-[#dbe1e6] dark:border-[#2A3B4C]">
                                {['Fecha', 'Vehículo / Parte', 'Descripción Servicio', 'Mecánico', 'Costo', 'Estado', 'Acciones'].map((h, i) => (
                                    <th key={i} class={`p-4 text-xs font-bold text-[#617989] dark:text-gray-400 uppercase tracking-wider ${i>=4 ? 'text-right' : ''} ${i===5 || i===6 ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#dbe1e6] dark:divide-[#2A3B4C]">
                             {[
                                {date: '12 Oct 2023', vehicle: 'Scania R450', plate: 'AA-123-BB', type: 'local_shipping', desc: 'Revisión Alternador', sub: 'Cambio de carbones...', mech: 'Carlos Gomez', cost: '$120.000', status: 'Pagado', color: 'green'},
                                {date: '05 Oct 2023', vehicle: 'John Deere 6155J', plate: 'AG-992-ZZ', type: 'agriculture', desc: 'Arranque Defectuoso', sub: 'Reparación solenoide...', mech: 'Miguel Angel', cost: '$85.500', status: 'Pagado', color: 'green'},
                                {date: '28 Sep 2023', vehicle: 'Ford Ranger', plate: 'CC-555-DD', type: 'directions_car', desc: 'Cambio Batería', sub: 'Instalación batería...', mech: 'Carlos Gomez', cost: '$150.000', status: 'Pendiente', color: 'yellow'},
                                {date: '15 Sep 2023', vehicle: 'Alternador #402', plate: 'Parte Suelta', type: 'build', desc: 'Rebobinado Estator', sub: 'Rebobinado completo...', mech: 'Roberto Ruiz', cost: '$94.500', status: 'Pagado', color: 'green'},
                             ].map((row, i) => (
                                <tr key={i} class="group hover:bg-gray-50 dark:hover:bg-[#202E3C] transition-colors">
                                    <td class="p-4 text-sm text-[#111518] dark:text-gray-200 font-medium whitespace-nowrap">{row.date}</td>
                                    <td class="p-4">
                                        <div class="flex items-center gap-3">
                                            <div class={`flex items-center justify-center size-10 rounded-lg ${i===0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : i===1 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : i===2 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
                                                <span class="material-symbols-outlined">{row.type}</span>
                                            </div>
                                            <div class="flex flex-col">
                                                <span class="text-sm font-bold text-[#111518] dark:text-white">{row.vehicle}</span>
                                                <span class="text-xs text-[#617989] dark:text-gray-400">{row.plate}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <div class="flex flex-col max-w-xs">
                                            <span class="text-sm font-semibold text-[#111518] dark:text-gray-200">{row.desc}</span>
                                            <span class="text-xs text-[#617989] dark:text-gray-400 line-clamp-1">{row.sub}</span>
                                        </div>
                                    </td>
                                    <td class="p-4 text-sm text-[#617989] dark:text-gray-400 whitespace-nowrap">{row.mech}</td>
                                    <td class="p-4 text-sm font-bold text-[#111518] dark:text-white text-right font-mono">{row.cost}</td>
                                    <td class="p-4 text-center">
                                        <span class={`inline-flex items-center gap-1 rounded-full ${row.color==='green' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'} px-2 py-1 text-xs font-semibold`}>
                                            <span class={`size-1.5 rounded-full ${row.color==='green' ? 'bg-green-700 dark:bg-green-400' : 'bg-yellow-700 dark:bg-yellow-400'}`}></span>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td class="p-4 text-center">
                                         <div class="flex justify-center gap-2">
                                            <button class="p-2 text-[#617989] hover:text-primary dark:text-gray-400 hover:bg-primary/10 rounded-lg transition-colors"><span class="material-symbols-outlined text-[20px]">description</span></button>
                                            <button class="p-2 text-[#617989] hover:text-primary dark:text-gray-400 hover:bg-primary/10 rounded-lg transition-colors"><span class="material-symbols-outlined text-[20px]">assignment</span></button>
                                        </div>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>

                <div class="flex items-center justify-between p-4 border-t border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-[#1A2632]">
                    <p class="text-sm text-[#617989] dark:text-gray-400">Mostrando <span class="font-bold text-[#111518] dark:text-white">1-4</span> de <span class="font-bold text-[#111518] dark:text-white">24</span> resultados</p>
                    <div class="flex gap-2">
                         <button class="flex items-center justify-center size-8 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] text-[#617989] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#253341] disabled:opacity-50" disabled><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                         <button class="flex items-center justify-center size-8 rounded-lg bg-primary text-white font-bold text-sm">1</button>
                         <button class="flex items-center justify-center size-8 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] text-[#617989] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#253341] text-sm font-medium">2</button>
                         <button class="flex items-center justify-center size-8 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] text-[#617989] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#253341] text-sm font-medium">3</button>
                         <button class="flex items-center justify-center size-8 rounded-lg border border-[#dbe1e6] dark:border-[#3A4D60] text-[#617989] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#253341]"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;