import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { bookingApi } from '../../services/booking';
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id]);

  useEffect(() => {
    if (selectedCustomer) {
      setUseExistingVehicle(true);
    } else {
      setUseExistingVehicle(false);
      setExistingVehicleId(undefined);
      setSelectedVehicleId(undefined);
    }
    // we intentionally ignore setters in deps to avoid re-runs on stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id]);

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
    if (!token || !isAdmin) return;
    setLoadingVehicles(true);
    try {
      const res = await bookingApi.listCustomerVehicles(customerId, token);
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
      setError('No se pudieron cargar los vehículos del cliente.');
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
    setModalError(null);
    setNewCustomerForm(pendingNewCustomer ?? { email: '', fullName: '', phone: '', password: '' });
    setShowCustomerModal(true);
  };

  const confirmNewCustomer = () => {
    setModalError(null);
    const email = newCustomerForm.email.trim();
    const password = newCustomerForm.password.trim();
    const phone = newCustomerForm.phone.trim();
    const fullName = newCustomerForm.fullName.trim();

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
    }

    if (assetType === 'VEHICLE') {
      if (isAdmin && useExistingVehicle) {
        if (!selectedCustomer) {
          setError('Seleccioná un cliente para poder elegir un vehículo.');
          return;
        }
        const vehicleToUse = selectedVehicleId ?? (customerVehicles.length ? customerVehicles[0].id : undefined);
        if (!vehicleToUse) {
          setError(customerVehicles.length ? 'Elegí un vehículo existente.' : 'El cliente no tiene vehículos cargados.');
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
        } else {
          setVehicle(undefined);
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
      if (!partForm.description.trim()) {
        setError('Describe brevemente la pieza y el problema.');
        return;
      }
      setPart({
        partCategoryId: partForm.partCategoryId,
        description: partForm.description.trim(),
      });
    }
    navigate('/book/step2');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen flex flex-col">
      <BookingHeader />
      <div className="flex flex-1 flex-col items-center w-full px-4 md:px-40 py-8">
        <div className="layout-content-container flex flex-col max-w-[800px] w-full flex-1 gap-6">
          {/* Page Heading & Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-end gap-3">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#111518] dark:text-white tracking-tight text-[32px] font-bold leading-tight">Solicitar Turno</p>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <p className="text-[#617989] dark:text-slate-400 text-sm font-medium leading-normal">Tipo de Servicio</p>
                </div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary w-1/3 rounded-full"></div>
            </div>
          </div>

          <div className="py-4 text-center">
            <h2 className="text-[#111518] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-3">¿Qué necesitas reparar hoy?</h2>
            <p className="text-[#617989] dark:text-slate-400 text-base font-normal leading-normal max-w-lg mx-auto">
              Selecciona si traerás el vehículo completo o solo una parte eléctrica para reparar en banco.
            </p>
          </div>

          {isAdmin && (
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#111518] dark:text-white">Cliente</p>
                  <p className="text-xs text-[#617989] dark:text-slate-400">Busca un cliente existente o cargá uno nuevo.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {selectedCustomer && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {selectedCustomer.fullName ?? selectedCustomer.email}
                    </span>
                  )}
                  {pendingNewCustomer && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                      Nuevo cliente listo
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="Buscar por email o nombre"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                  />
                  <button
                    onClick={searchCustomers}
                    type="button"
                    className="h-11 px-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:bg-slate-300"
                    disabled={searchingCustomers || !token}
                  >
                    {searchingCustomers ? 'Buscando...' : 'Buscar cliente'}
                  </button>
                  <button
                    type="button"
                    onClick={openCustomerModal}
                    className="h-11 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:border-primary hover:text-primary"
                  >
                    Nuevo cliente
                  </button>
                </div>

                {!!customerResults.length && (
                  <div className="grid md:grid-cols-2 gap-2">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                          selectedCustomer?.id === c.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                      >
                        <p className="text-sm font-semibold">{c.fullName ?? 'Cliente sin nombre'}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Cliente seleccionado</span>
                      {selectedCustomer && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={resetNewCustomer}
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    {selectedCustomer ? (
                      <div className="flex flex-col gap-1">
                        <span>{selectedCustomer.fullName ?? 'Sin nombre'}</span>
                        <span className="text-xs text-slate-500">{selectedCustomer.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Sin cliente seleccionado.</span>
                    )}
                  </div>

                  <div className="rounded-lg border border-dashed border-amber-200 dark:border-amber-600 p-3 text-sm text-slate-700 dark:text-slate-200 flex flex-col gap-2 bg-amber-50/60 dark:bg-amber-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold">Nuevo cliente</span>
                        <span className="text-xs text-amber-700 dark:text-amber-200">Se creará al confirmar el turno.</span>
                      </div>
                      {pendingNewCustomer && (
                        <button type="button" className="text-xs text-primary hover:underline" onClick={openCustomerModal}>
                          Editar
                        </button>
                      )}
                    </div>
                    {pendingNewCustomer ? (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold">{pendingNewCustomer.fullName || 'Sin nombre'}</span>
                        <span className="text-slate-600 dark:text-slate-200">{pendingNewCustomer.email}</span>
                        <span className="text-xs text-slate-500">Tel: {pendingNewCustomer.phone}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
                        <span>Carga los datos desde el modal para crear un cliente nuevo.</span>
                        <button
                          type="button"
                          className="self-start text-sm font-semibold text-primary hover:underline"
                          onClick={openCustomerModal}
                        >
                          Abrir formulario
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500">El cliente se creará al confirmar el turno; evitamos duplicados si algo falla en el resto del flujo.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Vehicle Card */}
            <div 
              onClick={() => setAssetType('VEHICLE')}
              className="group relative cursor-pointer flex flex-col bg-white dark:bg-[#1a2632] rounded-xl border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50"
            >
              <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary group-active:bg-primary group-active:border-primary transition-colors flex items-center justify-center">
                 <div className={`h-3 w-3 rounded-full ${assetType === 'VEHICLE' ? 'bg-primary opacity-100' : 'bg-transparent'} transition-opacity`}></div>
              </div>
              <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-7xl text-primary/80">local_shipping</span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-[#111518] dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">Vehículo Completo</h3>
                <p className="text-[#617989] dark:text-slate-400 text-sm leading-relaxed">
                  Traerás el vehículo al taller. Incluye autos, camionetas, camiones, tractores o motos.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Auto', 'Camión', 'Tractor'].map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Part Card */}
             <div 
               onClick={() => setAssetType('PART')}
               className="group relative cursor-pointer flex flex-col bg-white dark:bg-[#1a2632] rounded-xl border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary/50"
             >
                <div className="absolute top-4 right-4 h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors flex items-center justify-center">
                  <div className={`h-3 w-3 rounded-full ${assetType === 'PART' ? 'bg-primary opacity-100' : 'bg-transparent'} transition-opacity`}></div>
                </div>
              <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-7xl text-amber-500/80">electrical_services</span>
              </div>
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-[#111518] dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">Pieza / Repuesto</h3>
                <p className="text-[#617989] dark:text-slate-400 text-sm leading-relaxed">
                  Traerás la pieza suelta para reparación en banco. Alternadores, arranques, baterías.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                   {(partCategories.length ? partCategories.slice(0, 3) : [])
                     .map((cat) => (
                       <span
                         key={cat.id}
                         className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10"
                       >
                         {cat.name}
                       </span>
                     ))}
                   {!partCategories.length && (
                     <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                       Categorías pronto
                     </span>
                   )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4">
            {assetType === 'VEHICLE' ? (
              <div className="flex flex-col gap-4">
                {isAdmin && selectedCustomer && (
                  <div className="flex flex-col gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111518] dark:text-white">Vehículos del cliente</span>
                        <span className="text-xs text-slate-500">Elegí uno existente o cargá uno nuevo.</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg border ${
                            useExistingVehicle
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-300 text-slate-600 dark:text-slate-300'
                          }`}
                          onClick={() => setUseExistingVehicle(true)}
                          disabled={!customerVehicles.length}
                        >
                          Usar existente
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg border ${
                            !useExistingVehicle
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-300 text-slate-600 dark:text-slate-300'
                          }`}
                          onClick={() => {
                            setUseExistingVehicle(false);
                            setExistingVehicleId(undefined);
                          }}
                        >
                          Nuevo vehículo
                        </button>
                      </div>
                    </div>

                    {useExistingVehicle ? (
                      <div className="flex flex-col gap-2">
                        {loadingVehicles && <p className="text-sm text-slate-500">Cargando vehículos...</p>}
                        {!loadingVehicles && !customerVehicles.length && (
                          <p className="text-sm text-slate-500">El cliente no tiene vehículos cargados.</p>
                        )}
                        {!!customerVehicles.length && (
                          <select
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                            value={selectedVehicleId ?? ''}
                            onChange={(e) => {
                              const value = Number(e.target.value) || undefined;
                              setSelectedVehicleId(value);
                              setExistingVehicleId(value);
                            }}
                          >
                            <option value="" disabled>
                              {loadingVehicles ? 'Cargando...' : 'Seleccioná un vehículo'}
                            </option>
                            {customerVehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {[v.type?.name, v.brand?.name ?? v.brandOther, v.model, v.year].filter(Boolean).join(' ')}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {!useExistingVehicle && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      Tipo
                      <select
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                        value={vehicleForm.typeId ?? ''}
                        onChange={(e) =>
                          setVehicleForm((f) => ({ ...f, typeId: Number(e.target.value) || undefined }))
                        }
                        disabled={loadingVehicleTypes}
                      >
                        <option value="" disabled>
                          {loadingVehicleTypes ? 'Cargando tipos...' : 'Seleccioná un tipo'}
                        </option>
                        {vehicleTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {!loadingVehicleTypes && !vehicleTypes.length && (
                        <span className="text-xs text-red-500">No hay tipos cargados. Consulta con un administrador.</span>
                      )}
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      Marca
                      <select
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                        value={vehicleForm.brandId ?? (vehicleForm.brandOther ? 'OTHER' : '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'OTHER') {
                            setVehicleForm((f) => ({ ...f, brandId: undefined, brandOther: '' }));
                          } else {
                            setVehicleForm((f) => ({ ...f, brandId: Number(value) || undefined, brandOther: '' }));
                          }
                        }}
                        disabled={loadingVehicleBrands}
                      >
                        <option value="" disabled>
                          {loadingVehicleBrands ? 'Cargando marcas...' : 'Seleccioná una marca'}
                        </option>
                        {vehicleBrands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                        <option value="OTHER">Otros</option>
                      </select>
                      {(!loadingVehicleBrands && !vehicleBrands.length) && (
                        <span className="text-xs text-red-500">No hay marcas cargadas. Consulta con un administrador.</span>
                      )}
                      {vehicleForm.brandId === undefined && (
                        <input
                          className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                          placeholder="Otra marca"
                          value={vehicleForm.brandOther}
                          onChange={(e) => setVehicleForm((f) => ({ ...f, brandOther: e.target.value }))}
                        />
                      )}
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      Modelo
                      <input
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm((f) => ({ ...f, model: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      Año (opcional)
                      <input
                        type="number"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm((f) => ({ ...f, year: e.target.value }))}
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Categoría
                  <select
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    value={partForm.partCategoryId ?? ''}
                    onChange={(e) => setPartForm((f) => ({ ...f, partCategoryId: Number(e.target.value) }))}
                    disabled={loadingPartCategories}
                  >
                    <option value="" disabled>
                      {loadingPartCategories ? 'Cargando...' : 'Seleccioná una categoría'}
                    </option>
                    {partCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {!loadingPartCategories && !partCategories.length && (
                    <span className="text-xs text-red-500">No hay categorías disponibles. Consulta con un administrador.</span>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Descripción
                  <input
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    value={partForm.description}
                    onChange={(e) => setPartForm((f) => ({ ...f, description: e.target.value }))}
                    required
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-8 w-full">
            {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
            <button 
              onClick={handleContinue}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-sm transition-all"
            >
              <span className="truncate">Continuar</span>
              <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

        {showCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-xl bg-white dark:bg-[#0f1720] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-400"
                onClick={() => {
                  setShowCustomerModal(false);
                  setModalError(null);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="mb-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Nuevo cliente</p>
                <h3 className="text-xl font-bold text-[#111518] dark:text-white">Datos de contacto</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Se creará al confirmar el turno. Usuario y contraseña serán los ingresados.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nombre completo
                  <input
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="Ej: Juan Pérez"
                    value={newCustomerForm.fullName}
                    onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Correo
                  <input
                    type="email"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="cliente@correo.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Teléfono
                  <input
                    type="tel"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="2612465784"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Contraseña
                  <input
                    type="password"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                    placeholder="Mínimo 8 caracteres"
                    value={newCustomerForm.password}
                    onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                </label>
              </div>

              {modalError && <p className="text-sm text-red-600 mt-3">{modalError}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 h-10 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => {
                    setShowCustomerModal(false);
                    setModalError(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-5 h-10 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90"
                  onClick={confirmNewCustomer}
                >
                  Guardar datos
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default BookingStep1;