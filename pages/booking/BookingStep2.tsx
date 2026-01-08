import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { useBooking } from '../../context/BookingContext';

const BookingStep2: React.FC = () => {
  const navigate = useNavigate();
  const {
    assetType,
    vehicle,
    part,
    partCategories,
    issues,
    loadingIssues,
    loadIssues,
    loadPartCategories,
    vehicleTypes,
    vehicleBrands,
    commonIssueIds,
    toggleCommonIssue,
    customIssues,
    setCustomIssues,
    details,
    setDetails,
    mediaUrl,
    setMediaUrl,
    lastBooking,
  } = useBooking();
  const [customInput, setCustomInput] = useState('');
  const currentYear = new Date().getFullYear();

  // no redirigir automáticamente si existe lastBooking: dejamos que el flujo muestre Success

  const vehicleTypeName = useMemo(() => {
    if (!vehicle?.typeId) return undefined;
    return vehicleTypes.find((t) => t.id === vehicle.typeId)?.name;
  }, [vehicle?.typeId, vehicleTypes]);

  const vehicleBrandName = useMemo(() => {
    if (!vehicle) return undefined;
    if (vehicle.brandId) {
      return vehicleBrands.find((b) => b.id === vehicle.brandId)?.name;
    }
    return vehicle.brandOther;
  }, [vehicle, vehicleBrands]);

  useEffect(() => {
    const categoryId = assetType === 'PART' ? part?.partCategoryId : undefined;
    if (assetType === 'PART' && !categoryId) return;
    loadIssues(categoryId).catch(() => undefined);
  }, [assetType, part?.partCategoryId, loadIssues]);

  useEffect(() => {
    if (assetType === 'PART' && !partCategories.length) {
      loadPartCategories().catch(() => undefined);
    }
  }, [assetType, partCategories.length, loadPartCategories]);

  const issueList = useMemo(() => issues, [issues]);

  const selectedPartCategory = useMemo(
    () => (part?.partCategoryId ? partCategories.find((c) => c.id === part.partCategoryId) : undefined),
    [part?.partCategoryId, partCategories],
  );

  const addCustom = () => {
    if (!customInput.trim()) return;
    setCustomIssues([...customIssues, customInput.trim()]);
    setCustomInput('');
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0f1720] font-sans text-slate-900 dark:text-gray-100 antialiased min-h-screen flex flex-col">
      <BookingHeader step={2} title="Confirmar Problema" />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 lg:py-10 max-w-[1024px]">
        
        <div className="text-center mb-10 space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                Describe el problema
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
                Ayúdanos a entender qué le sucede a tu vehículo para prepararnos antes de tu llegada.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Fallas Comunes */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-3 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                   <span className="material-symbols-outlined">build_circle</span>
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-900 dark:text-white">Fallas Comunes</h3>
                   <p className="text-xs text-slate-500">Opciones frecuentes según tu tipo de vehículo</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {loadingIssues && <p className="text-sm text-slate-400 py-4 italic">Cargando opciones...</p>}
                {!loadingIssues && issueList.map((item) => (
                  <label key={item.id} className="cursor-pointer relative group">
                    <input
                      className="peer sr-only"
                      type="checkbox"
                      checked={commonIssueIds.includes(item.id)}
                      onChange={() => toggleCommonIssue(item.id)}
                    />
                    <div className="px-4 py-2 rounded-xl text-sm font-medium transition-all
                      border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50
                      peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 peer-checked:shadow-md
                      hover:bg-white hover:border-blue-300
                    ">
                      {item.label}
                    </div>
                  </label>
                ))}
                {!loadingIssues && !issueList.length && (
                   <p className="text-sm text-slate-400 italic">No hay fallas predefinidas disponibles.</p>
                )}
              </div>
            </div>

            {/* Fallas Adicionales Custom */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Otros síntomas</h3>
               </div>
               <div className="flex gap-2">
                  <input
                     className="flex-1 rounded-xl border-slate-200 bg-slate-50 text-sm px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-800 dark:border-slate-600"
                     value={customInput}
                     onChange={(e) => setCustomInput(e.target.value)}
                     placeholder="Ej: Luz tablero parpadea..."
                     onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  />
                  <button
                     onClick={addCustom}
                     type="button"
                     className="px-5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 active:scale-95 transition-all shadow-lg"
                  >
                     Agregar
                  </button>
               </div>
               {customIssues.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                     {customIssues.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 flex items-center gap-2 animate-fadeIn">
                           {c} 
                           <button onClick={() => setCustomIssues(customIssues.filter((_, idx) => idx !== i))} className="hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                        </span>
                     ))}
                  </div>
               )}
            </div>

            {/* Detalles Texto */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Detalle Específico</h3>
               <textarea 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:bg-slate-800 dark:border-slate-600"
                  rows={4}
                  placeholder="Describe aquí cualquier otro detalle relevante o ruido extraño..."
                  value={details ?? ''}
                  onChange={(e) => setDetails(e.target.value)}
               />
               
               <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Link Foto/Video (Opcional)</label>
                  <input
                     className="w-full rounded-lg border-slate-200 bg-white text-xs px-3 py-2 text-slate-600 dark:bg-slate-800 dark:border-slate-600"
                     placeholder="https://..."
                     value={mediaUrl ?? ''}
                     onChange={(e) => setMediaUrl(e.target.value)}
                  />
               </div>
            </div>
          </div>

          {/* Right Column Summary Fixed */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden sticky top-24">
              <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center px-6 relative overflow-hidden">
                 <span className="material-symbols-outlined text-8xl text-white/5 absolute -right-4 -bottom-4">calendar_clock</span>
                 <div>
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">Resumen</p>
                    <h2 className="text-white font-bold text-xl">Tu Turno</h2>
                 </div>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Asset Info */}
                 <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-2xl ${assetType === 'VEHICLE' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                       <span className="material-symbols-outlined text-2xl">
                          {assetType === 'VEHICLE' ? 'directions_car' : 'build'}
                       </span>
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">
                          {assetType === 'VEHICLE' ? 'Vehículo' : 'Pieza'}
                       </p>
                       <p className="font-bold text-slate-800 dark:text-white leading-tight">
                          {assetType === 'VEHICLE' 
                             ? [vehicleTypeName, vehicleBrandName, vehicle?.model].filter(Boolean).join(' ')
                             : `${selectedPartCategory?.name} - ${part?.description}`}
                       </p>
                       <button onClick={() => navigate('/book/step1')} className="text-xs text-emerald-600 font-semibold hover:underline mt-1">
                          Editar / Cambiar
                       </button>
                    </div>
                 </div>

                 {/* Botones Acción */}
                 <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button 
                       onClick={() => navigate('/book/step4')}
                       className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       Elegir Horario
                       <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                    <button 
                       onClick={() => navigate('/book/step1')}
                       className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                       Volver
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingStep2;