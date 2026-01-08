import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { bookingApi } from '../../services/booking';
import { usersApi } from '../../services/users';
import { vehiclesApi } from '../../services/vehicles';
import { CustomerSummary, CustomerVehicle } from '../../types/booking';

const BookingStep1: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const {
    assetType,
    lastBooking,
    setAssetType,
    setCustomerId,
    setCreateCustomer,
    setExistingVehicleId,
    setVehicle,
    setPart,
    partCategories,
    loadPartCategories,
    loadingPartCategories,
    vehicleTypes,
    vehicleBrands,
    loadVehicleTypes,
    loadVehicleBrands,
    loadingVehicleTypes,
    loadingVehicleBrands,
  } = useBooking();
  const [vehicleForm, setVehicleForm] = useState({
    typeId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    brandOther: '',
    model: '',
    year: '',
  });
  const [partForm, setPartForm] = useState<{ partCategoryId?: number; description: string }>({
    partCategoryId: undefined,
    description: '',
  });
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({ email: '', fullName: '', phone: '', password: '' });
  const [pendingNewCustomer, setPendingNewCustomer] = useState<typeof newCustomerForm | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [useExistingVehicle, setUseExistingVehicle] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isFastClient, setIsFastClient] = useState(false);

  // allow starting un nuevo turno incluso si existe un lastBooking previo (se limpia en Success)

  useEffect(() => {
    // sync mutually exclusive forms; avoid including setters in deps to prevent infinite loop
    if (assetType === 'VEHICLE') {
      setPart(undefined);
    } else {
      setVehicle(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType]);

  useEffect(() => {
    if (assetType === 'PART') {
      loadPartCategories().catch(() => undefined);
    } else {
      loadVehicleTypes().catch(() => undefined);
      loadVehicleBrands().catch(() => undefined);
    }
  }, [assetType, loadPartCategories, loadVehicleTypes, loadVehicleBrands]);

  useEffect(() => {
    if (partCategories.length && !partForm.partCategoryId) {
      setPartForm((prev) => ({ ...prev, partCategoryId: partCategories[0].id }));
    }
  }, [partCategories, partForm.partCategoryId]);

  useEffect(() => {
    if (vehicleTypes.length && !vehicleForm.typeId) {
      setVehicleForm((prev) => ({ ...prev, typeId: vehicleTypes[0].id }));
    }
  }, [vehicleTypes, vehicleForm.typeId]);

  useEffect(() => {
    if (vehicleBrands.length && vehicleForm.brandId === undefined && !vehicleForm.brandOther) {
      setVehicleForm((prev) => ({ ...prev, brandId: vehicleBrands[0].id }));
    }
  }, [vehicleBrands, vehicleForm.brandId, vehicleForm.brandOther]);

  // If a customer is already selected and we have no vehicles loaded yet, fetch them so the existing vehicle id persists across navigation.
  useEffect(() => {
    if (isAdmin && selectedCustomer && !customerVehicles.length && !loadingVehicles) {
      loadVehiclesForCustomer(selectedCustomer.id).catch(() => undefined);
    } else if (!isAdmin && user?.id && !customerVehicles.length && !loadingVehicles) {
      loadVehiclesForCustomer(user.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, user?.id, isAdmin]);

  useEffect(() => {
    if (selectedCustomer || (!isAdmin && user)) {
      setUseExistingVehicle(true);
    } else {
      setUseExistingVehicle(false);
      setExistingVehicleId(undefined);
      setSelectedVehicleId(undefined);
    }
    // we intentionally ignore setters in deps to avoid re-runs on stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, user?.id, isAdmin]);

  const searchCustomers = async () => {
    if (!isAdmin || !token) return;
    const query = customerQuery.trim();
    if (!query) {
      setCustomerResults([]);
      return;
    }
    setSearchingCustomers(true);
    try {
      const res = await bookingApi.searchCustomers(query, token);
      setCustomerResults(res);
    } catch (err) {
      console.error(err);
      setError('No se pudo buscar clientes.');
    } finally {
      setSearchingCustomers(false);
    }
  };

  const loadVehiclesForCustomer = async (customerId: number) => {
    if (!token) return;
    setLoadingVehicles(true);
    try {
      let res: CustomerVehicle[] = [];
      
      // Si soy admin viendo otro cliente, uso endpoint de admin
      if (isAdmin && customerId !== user?.id) {
         res = await bookingApi.listCustomerVehicles(customerId, token);
      } else {
         // Si es para mí mismo (sea admin o user normal), uso endpoint /me
         // Nota: getMyVehicles retorna CustomerVehicle[] (tipado compatible)
         res = await vehiclesApi.getMyVehicles(token);
      }

      setCustomerVehicles(res);
      if (res.length) {
        setSelectedVehicleId(res[0].id);
        setExistingVehicleId(res[0].id);
        setUseExistingVehicle(true);
      } else {
        setSelectedVehicleId(undefined);
        setExistingVehicleId(undefined);
        setUseExistingVehicle(false);
      }
    } catch (err) {
      console.error(err);
      // Don't show error if it's just empty or permission issue for safety, but log it
      // setError('No se pudieron cargar los vehículos.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const selectCustomer = (customer: CustomerSummary) => {
    setSelectedCustomer(customer);
    setCustomerId(customer.id);
    setCreateCustomer(undefined);
    setPendingNewCustomer(null);
    setNewCustomerForm({ email: '', fullName: '', phone: '', password: '' });
    setCustomerResults([]);
    loadVehiclesForCustomer(customer.id).catch(() => undefined);
  };

  const resetNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerId(undefined);
    setExistingVehicleId(undefined);
    setCustomerVehicles([]);
    setUseExistingVehicle(false);
    setSelectedVehicleId(undefined);
    setPendingNewCustomer(null);
    setCreateCustomer(undefined);
    setNewCustomerForm({ email: '', fullName: '', phone: '', password: '' });
    setShowCustomerModal(false);
    setModalError(null);
  };

  const openCustomerModal = () => {
    setIsFastClient(false);
    setModalError(null);
    setNewCustomerForm(pendingNewCustomer ?? { email: '', fullName: '', phone: '', password: '' });
    setShowCustomerModal(true);
  };

  const confirmNewCustomer = async () => {
    setModalError(null);
    const email = newCustomerForm.email.trim();
    const password = newCustomerForm.password.trim();
    const phone = newCustomerForm.phone.trim();
    const fullName = newCustomerForm.fullName.trim();

    if (isFastClient) {
      if (!fullName || !phone) {
        setModalError('Nombre y teléfono son obligatorios.');
        return;
      }
      try {
        if (!token) return;
        const created = await usersApi.createFastClient({ fullName, phone }, token);
        selectCustomer({
          id: created.id,
          email: created.email || null,
          fullName: created.fullName || null,
          phone: created.phone || null,
        });
        setShowCustomerModal(false);
      } catch (err) {
        console.error(err);
        setModalError('No se pudo crear el cliente rápido.');
      }
      return;
    }

    if (!email || !password) {
      setModalError('Completá email y contraseña.');
      return;
    }
    if (password.length < 8) {
      setModalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!phone) {
      setModalError('Ingresá un teléfono de contacto.');
      return;
    }

    const payload = { email, password, phone, fullName };
    setPendingNewCustomer(payload);
    setCreateCustomer(payload);
    setCustomerId(undefined);
    setSelectedCustomer(null);
    setExistingVehicleId(undefined);
    setCustomerVehicles([]);
    setSelectedVehicleId(undefined);
    setUseExistingVehicle(false);
    setShowCustomerModal(false);
  };

  const isSelectedCategoryOther = () => {
    const c = partCategories.find((cat) => cat.id === partForm.partCategoryId);
    if (!c) return false;
    return c.code === 'OTHER' || ['otro', 'otros', 'other'].includes(c.name.toLowerCase());
  };

  const handleContinue = () => {
    setError(null);
    const newCustomerDraft = pendingNewCustomer && pendingNewCustomer.email ? pendingNewCustomer : null;

    if (isAdmin) {
      if (selectedCustomer) {
        setCustomerId(selectedCustomer.id);
        setPendingNewCustomer(null);
      } else if (newCustomerDraft) {
        setCreateCustomer(newCustomerDraft);
        setCustomerId(undefined);
      } else {
        setError('Seleccioná un cliente existente o crea uno nuevo.');
        return;
      }
    } else {
       // Si es cliente normal, el customerId es el propio usuario
       if (user?.id) {
          setCustomerId(user.id);
       }
    }

    if (assetType === 'VEHICLE') {
      if (useExistingVehicle) {
        // Validation for existing vehicle (Admin selecting for client OR Client selecting their own)
        if (isAdmin && !selectedCustomer) {
          setError('Seleccioná un cliente para poder elegir un vehículo.');
          return;
        }
        
        const vehicleToUse = selectedVehicleId ?? (customerVehicles.length ? customerVehicles[0].id : undefined);
        if (!vehicleToUse) {
          setError(customerVehicles.length ? 'Elegí un vehículo existente.' : 'No tenés vehículos cargados.');
          return;
        }
        setSelectedVehicleId(vehicleToUse);
        setExistingVehicleId(vehicleToUse);
        
        // Populate vehicle state for UI summary in next steps
        const selectedV = customerVehicles.find(v => v.id === vehicleToUse);
        if (selectedV) {
          setVehicle({
            typeId: selectedV.type.id,
            brandId: selectedV.brand?.id,
            brandOther: selectedV.brandOther || undefined,
            model: selectedV.model,
            year: selectedV.year || undefined,
          });
        }
      } else {
        if (!vehicleForm.typeId) {
          setError('Seleccioná el tipo de vehículo.');
          return;
        }
        const hasBrand = vehicleForm.brandId || vehicleForm.brandOther.trim();
        if (!hasBrand || !vehicleForm.model.trim()) {
          setError('Completá marca y modelo del vehículo.');
          return;
        }
        setExistingVehicleId(undefined);
        setVehicle({
          typeId: vehicleForm.typeId,
          brandId: vehicleForm.brandId,
          brandOther: vehicleForm.brandOther.trim() || undefined,
          model: vehicleForm.model,
          year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
        });
      }
    } else {
      if (!partForm.partCategoryId) {
        setError('Seleccioná la categoría de la pieza.');
        return;
      }

      const isOther = isSelectedCategoryOther();
      const selectedCat = partCategories.find(c => c.id === partForm.partCategoryId);
      
      // If it's OTHER, user must provide a description.
      // If NOT OTHER, we use the category name as description (or keep existing logic).
      let finalDescription = partForm.description.trim();
      
      if (isOther) {
        if (!finalDescription) {
          setError('Ingresá el nombre de la pieza.');
          return;
        }
      } else {
        // Automatically set description to category name if hidden or empty
        finalDescription = selectedCat?.name || '';
      }

      setPart({
        partCategoryId: partForm.partCategoryId,
        description: finalDescription,
      });
    }
    navigate('/book/step2');
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0f1720] font-sans antialiased min-h-screen flex flex-col">
      <BookingHeader step={1} title="Seleccioná tu servicio" />
      <div className="flex flex-1 flex-col items-center w-full px-4 md:px-8 py-8 md:py-12">
        <div className="layout-content-container flex flex-col max-w-[900px] w-full flex-1 gap-8">
          
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ¿Qué vamos a reparar hoy?
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Elegí el tipo de servicio para comenzar tu reserva. Si traes el vehículo completo o solo una pieza suelta.
            </p>
          </div>

          {isAdmin && (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">person_search</span>
                    Gestión de Cliente (Admin)
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Asigná el turno a un cliente registrado o nuevo.</p>
                </div>
                <div className="flex items-center gap-2">
                   {/* Status Badges */}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Buscar por DNI, email o nombre..."
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
                    />
                  </div>
                  <button
                    onClick={searchCustomers}
                    type="button"
                    className="h-11 px-5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm whitespace-nowrap"
                    disabled={searchingCustomers || !token}
                  >
                    {searchingCustomers ? '...' : 'Buscar'}
                  </button>
                  <button
                    type="button"
                    onClick={openCustomerModal}
                    className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    + Nuevo
                  </button>
                </div>

                {/* Resultados de búsqueda flotantes o en lista */}
                {!!customerResults.length && (
                  <div className="grid sm:grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className={`text-left rounded-lg p-3 transition-all flex items-center justify-between group ${
                          selectedCustomer?.id === c.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-1 ring-emerald-500'
                            : 'hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        <div>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">{c.fullName ?? 'Sin nombre'}</p>
                           <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                        {selectedCustomer?.id === c.id && <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cliente Seleccionado Card */}
                {(selectedCustomer || pendingNewCustomer) && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800 p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold">
                           {selectedCustomer ? selectedCustomer.fullName?.[0] || 'C' : 'N'}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {selectedCustomer ? selectedCustomer.fullName : pendingNewCustomer?.fullName}
                           </p>
                           <p className="text-xs text-slate-500">
                              {selectedCustomer ? selectedCustomer.email : 'Nuevo cliente (Borrador)'}
                           </p>
                        </div>
                     </div>
                     <button
                        type="button"
                        onClick={resetNewCustomer}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                     >
                        Desvincular
                     </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción Vehículo */}
            <div 
              onClick={() => setAssetType('VEHICLE')}
              className={`relative cursor-pointer group rounded-3xl p-6 transition-all duration-300 border-2 ${
                  assetType === 'VEHICLE' 
                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-100 ring-4 ring-emerald-500/10' 
                  : 'bg-white dark:bg-slate-800 border-transparent hover:border-emerald-200 hover:shadow-lg scale-95 opacity-80 hover:opacity-100 hover:scale-100'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${assetType === 'VEHICLE' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                   <span className="material-symbols-outlined text-3xl">directions_car</span>
                </div>
                {assetType === 'VEHICLE' && <div className="bg-emerald-500 text-white p-1 rounded-full"><span className="material-symbols-outlined text-lg">check</span></div>}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vehículo Completo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                 Ideal para service, diagnóstico general, o reparaciones donde necesitamos el auto en el taller.
              </p>
              
              {/* Formulario embebido al seleccionar */}
              {assetType === 'VEHICLE' && (
                 <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-fadeIn">
                    {/* Lógica de selección de vehículo (Admin o Cliente) */}
                    {(isAdmin && selectedCustomer) || (!isAdmin && user) ? (
                       <div className="flex flex-col gap-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                             {isAdmin ? 'Vehículo del cliente' : 'Mis Vehículos'}
                          </label>
                          {!customerVehicles.length && !loadingVehicles ? (
                             <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                                {isAdmin ? 'El cliente no tiene vehículos. Cargá uno abajo.' : 'No tenés vehículos guardados. Agregá uno nuevo.'}
                             </div>
                          ) : null}
                          
                          <div className="flex gap-2 mb-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                             <button 
                                type="button"
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${useExistingVehicle ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
                                onClick={() => setUseExistingVehicle(true)}
                                disabled={!customerVehicles.length}
                             >Existente</button>
                             <button
                                type="button"
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!useExistingVehicle ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
                                onClick={() => { setUseExistingVehicle(false); setExistingVehicleId(undefined); }}
                             >Nuevo</button>
                          </div>

                          {useExistingVehicle && (
                             <select className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm py-2.5" 
                                value={selectedVehicleId ?? ''}
                                onChange={(e) => {
                                   const vid = Number(e.target.value);
                                   setSelectedVehicleId(vid);
                                   setExistingVehicleId(vid);
                                }}
                             >
                                <option disabled value="">Seleccionar...</option>
                                {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.brand?.name || v.brandOther} {v.model} ({v.year})</option>)}
                             </select>
                          )}
                       </div>
                    ) : null}

                    {/* Formulario de carga manual (si es nuevo o user normal) */}
                    {!useExistingVehicle && (
                       <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo</label>
                                <select 
                                   className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm py-2"
                                   value={vehicleForm.typeId ?? ''}
                                   onChange={(e) => setVehicleForm(f => ({...f, typeId: Number(e.target.value)}))}
                                >
                                   {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Marca</label>
                                <select 
                                   className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm py-2"
                                   value={vehicleForm.brandId ?? (vehicleForm.brandOther ? 'OTHER' : '')}
                                   onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'OTHER') setVehicleForm(f => ({...f, brandId: undefined, brandOther: ''}));
                                      else setVehicleForm(f => ({...f, brandId: Number(val), brandOther: ''}));
                                   }}
                                >
                                   {vehicleBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                   <option value="OTHER">Otra</option>
                                </select>
                             </div>
                          </div>
                          {vehicleForm.brandId === undefined && (
                             <input 
                                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm px-3 py-2"
                                placeholder="Escribe la marca..."
                                value={vehicleForm.brandOther}
                                onChange={(e) => setVehicleForm(f => ({...f, brandOther: e.target.value}))}
                             />
                          )}
                          <input 
                             className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                             placeholder="Modelo (Ej: Gol Trend, Hilux...)"
                             value={vehicleForm.model}
                             onChange={(e) => setVehicleForm(f => ({...f, model: e.target.value}))}
                          />
                       </div>
                    )}
                 </div>
              )}
            </div>

            {/* Opción Pieza */}
            <div 
              onClick={() => setAssetType('PART')}
              className={`relative cursor-pointer group rounded-3xl p-6 transition-all duration-300 border-2 ${
                  assetType === 'PART' 
                  ? 'bg-white dark:bg-slate-800 border-amber-500 shadow-xl shadow-amber-500/10 scale-100 ring-4 ring-amber-500/10' 
                  : 'bg-white dark:bg-slate-800 border-transparent hover:border-amber-200 hover:shadow-lg scale-95 opacity-80 hover:opacity-100 hover:scale-100'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${assetType === 'PART' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                   <span className="material-symbols-outlined text-3xl">build</span>
                </div>
                {assetType === 'PART' && <div className="bg-amber-500 text-white p-1 rounded-full"><span className="material-symbols-outlined text-lg">check</span></div>}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pieza / Repuesto</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                 Trae solo el componente (burro, alternador, batería) para reparar en banco de pruebas.
              </p>

              {assetType === 'PART' && (
                 <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-fadeIn">
                    <div className="space-y-3">
                       <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Categoría</label>
                          <select 
                             className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm py-2"
                             value={partForm.partCategoryId ?? ''}
                             onChange={(e) => {
                                const id = Number(e.target.value);
                                const cat = partCategories.find(c => c.id === id);
                                const isOther = cat?.code === 'OTHER'; 
                                setPartForm(f => ({ 
                                  ...f, 
                                  partCategoryId: id, 
                                  description: isOther ? f.description : (cat?.name || '') 
                                }));
                             }}
                          >
                             {partCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       
                       {isSelectedCategoryOther() && (
                          <div>
                             <label className="text-xs font-bold text-slate-500 mb-1 block">¿Qué pieza es?</label>
                             <input 
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                placeholder="Ej: Motor de limpiaparabrisas"
                                value={partForm.description}
                                onChange={(e) => setPartForm(f => ({...f, description: e.target.value}))}
                             />
                          </div>
                       )}
                    </div>
                 </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mt-6">
            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4 animate-shake">{error}</div>}
            <button 
              onClick={handleContinue}
              className={`w-full max-w-sm h-14 rounded-2xl text-lg font-bold text-white shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 ${
                 assetType === 'VEHICLE' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

        {/* Modal Cliente Nuevo simplificado para este nuevo diseño */}
        {showCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white dark:bg-[#1a2632] rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white">Nuevo Cliente</h3>
                 <button onClick={() => setShowCustomerModal(false)} className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                    <button className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg ${isFastClient ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`} onClick={() => setIsFastClient(true)}>Rápido</button>
                    <button className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg ${!isFastClient ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`} onClick={() => setIsFastClient(false)}>Cuenta Completa</button>
                 </div>
                 
                 <div className="grid gap-3">
                    <input className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3" placeholder="Nombre completo" value={newCustomerForm.fullName} onChange={e => setNewCustomerForm(p=>({...p, fullName: e.target.value}))} />
                    <input className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3" placeholder="Teléfono" value={newCustomerForm.phone} onChange={e => setNewCustomerForm(p=>({...p, phone: e.target.value}))} />
                    {!isFastClient && (
                       <>
                       <input className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3" placeholder="Email" type="email" value={newCustomerForm.email} onChange={e => setNewCustomerForm(p=>({...p, email: e.target.value}))} />
                       <input className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3" placeholder="Contraseña" type="password" value={newCustomerForm.password} onChange={e => setNewCustomerForm(p=>({...p, password: e.target.value}))} />
                       </>
                    )}
                 </div>
                 
                 {modalError && <p className="text-red-500 text-sm text-center">{modalError}</p>}

                 <button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl mt-2 shadow-lg shadow-emerald-500/20" onClick={confirmNewCustomer}>Confirmar Cliente</button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default BookingStep1;