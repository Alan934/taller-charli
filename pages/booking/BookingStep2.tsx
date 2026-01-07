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
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111518] dark:text-gray-100 antialiased min-h-screen flex flex-col">
      <BookingHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-[960px]">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Progreso de solicitud</span>
            <span className="text-sm font-medium text-primary">Paso 2 de 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: '66%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Vehículo</span>
            <span className="font-bold text-primary">Descripción</span>
            <span>Confirmación</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111518] dark:text-white mb-3">Describe el problema</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Cuéntanos qué sucede con tu vehículo o repuesto para que el equipo de Charli pueda prepararse.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">build_circle</span>
                <h3 className="text-lg font-bold text-[#111518] dark:text-white">Fallas Comunes <span className="text-sm font-normal text-gray-500">(Opcional)</span></h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Selecciona una o más opciones que describan tu situación.</span>
                {assetType === 'PART' && selectedPartCategory && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
                    Categoría: {selectedPartCategory.name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {loadingIssues && <p className="text-sm text-gray-500">Cargando fallas...</p>}
                {!loadingIssues && !issueList.length && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assetType === 'PART'
                      ? 'No hay fallas comunes cargadas para esta categoría. Podés describir el problema en Detalles Específicos.'
                      : 'No hay fallas comunes disponibles. Podés describir el problema en Detalles Específicos.'}
                  </p>
                )}
                {!loadingIssues && issueList.map((item) => (
                  <label key={item.id} className="cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="issue"
                      type="checkbox"
                      value={item.id}
                      checked={commonIssueIds.includes(item.id)}
                      onChange={() => toggleCommonIssue(item.id)}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-gray-800 rounded-lg peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary peer-checked:text-primary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">add</span>
                <h3 className="text-lg font-bold text-[#111518] dark:text-white">Fallas adicionales <span className="text-sm font-normal text-gray-500">(Opcional)</span></h3>
              </div>
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ej: Testigo ABS encendido"
                />
                <button
                  onClick={addCustom}
                  type="button"
                  className="px-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
                >
                  Agregar
                </button>
              </div>
              {customIssues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {customIssues.map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">{c}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <h3 className="text-lg font-bold text-[#111518] dark:text-white">Detalles Específicos</h3>
              </div>
              <div className="relative">
                <textarea 
                  className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-gray-800 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6 resize-none" 
                  placeholder="Ej: El auto hace un sonido 'click-click' cuando giro la llave en frío, pero las luces prenden normal. Es un Volkswagen Gol 2015." 
                  rows={6}
                  value={details ?? ''}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">0 / 500</div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-center w-full">
                  <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <label className="font-medium">URL de foto o video (Cloudinary)</label>
                    <input
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                      placeholder="https://res.cloudinary.com/..."
                      value={mediaUrl ?? ''}
                      onChange={(e) => setMediaUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden relative">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDP_l0Apa_Gh_liQdZ5TIWdJ0FMyepYWWb-7PttUu72fJ5Y_m48PL_6Yn4cd-WpH5c3rbquRtJoPOhCX-Xwbv0JKndEF_zXyKNHFQJ690rr8KfdFzqc91ipFbj48hyjM94NsYwxTdjY4cuHOs33heugSIBlBLwTkH_4fzWnOQs6WA4vNUxRknjhGdEWLFgH8Us3RPRo7b0GuubHiPWSVlVtFErE7g76DcQohTBIBW9QlBtnAO5IWsWf3iRTffJ-pSYXgJFNK1rb7wU")' }}>
                  <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-90">Resumen</p>
                  <h4 className="font-bold text-lg">Tu Solicitud</h4>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="bg-primary/10 p-2 rounded-lg h-fit text-primary">
                      <span className="material-symbols-outlined">{assetType === 'VEHICLE' ? 'directions_car' : 'electrical_services'}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{assetType === 'VEHICLE' ? 'Vehículo' : 'Pieza'}</p>
                      {assetType === 'VEHICLE' && vehicle ? (
                        <p className="text-sm font-medium text-[#111518] dark:text-white">
                          {[vehicleTypeName, vehicleBrandName, vehicle.model].filter(Boolean).join(' ')}{' '}
                          {vehicle.year ? `(${vehicle.year})` : ''}
                        </p>
                      ) : null}
                      {assetType === 'PART' && selectedPartCategory && part ? (
                        <p className="text-sm font-medium text-[#111518] dark:text-white">
                          {selectedPartCategory.name} — {part.description}
                        </p>
                      ) : null}
                      {(!vehicle && assetType === 'VEHICLE') || (!part && assetType === 'PART') ? (
                        <p className="text-xs text-red-500 mt-1">Faltan datos. Volvé al paso 1.</p>
                      ) : (
                        <button
                          onClick={() => navigate('/book/step1')}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg h-fit text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Turno</p>
                      <p className="text-sm italic text-gray-400">Pendiente de selección</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/book/step4')}
                    className="flex w-full items-center justify-center rounded-lg h-12 px-6 text-base font-bold leading-normal shadow-md transition-all bg-primary text-white hover:bg-primary-dark hover:shadow-lg"
                  >
                    <span className="truncate">Continuar a Horarios</span>
                    <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                  </button>
                  <button 
                    onClick={() => navigate('/book/step1')}
                    className="flex w-full items-center justify-center rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 h-10 px-6 text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal transition-colors"
                  >
                    Atrás
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 mt-auto py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} Taller Charli Electricidad Automotriz. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingStep2;