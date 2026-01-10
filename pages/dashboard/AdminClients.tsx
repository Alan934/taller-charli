import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { bookingApi } from '../../services/booking';
import { usersApi } from '../../services/users';
import type { BookingItem } from '../../types/booking';
import type { UserProfile } from '../../types/auth';
import type { VehicleTypeOption, VehicleBrandOption, PartCategory } from '../../types/booking';

type Client = {
  id: number;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  vehicles: Array<{ id: number; typeName?: string; brandLabel?: string; model?: string; vin?: string }>;
  parts: Array<{ id: number; categoryName?: string; description?: string }>;
};

type VehicleForm = {
  id?: number;
  typeId: number | null;
  brandId: number | null;
  brandOther?: string;
  model: string;
  year?: number | null;
  vinOrPlate?: string | null;
  notes?: string | null;
};

type PartForm = {
  id?: number;
  categoryId: number | null;
  description: string;
};

const AdminClients: React.FC = () => {
  const { token, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [partFilter, setPartFilter] = useState('');
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Forms
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [vehicleForms, setVehicleForms] = useState<VehicleForm[]>([]);
  const [partForms, setPartForms] = useState<PartForm[]>([]);
  const [removedVehicleIds, setRemovedVehicleIds] = useState<number[]>([]);
  const [removedPartIds, setRemovedPartIds] = useState<number[]>([]);
  
  // Catalogs
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrandOption[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [refsLoaded, setRefsLoaded] = useState(false);

  // Tab state for modal
  const [activeTab, setActiveTab] = useState<'info' | 'vehicles' | 'parts'>('info');

  const isAdmin = user?.role === 'ADMIN';

  const mapAssetsForClient = useCallback((vehicles: any[], parts: any[]): Pick<Client, 'vehicles' | 'parts'> => ({
    vehicles: vehicles.map((v) => ({
      id: v.id,
      typeName: v.type?.name,
      brandLabel: v.brand?.name ?? v.brandOther ?? undefined,
      model: v.model,
      vin: v.vinOrPlate ?? undefined,
    })),
    parts: parts.map((p) => ({ id: p.id, categoryName: p.category?.name, description: p.description })),
  }), []);

  const loadClientAssets = useCallback(
    async (clientId: number, tokenValue: string) => {
      setAssetsLoading(true);
      try {
        const [vehicles, parts] = await Promise.all([
          usersApi.listClientVehicles(clientId, tokenValue),
          usersApi.listClientParts(clientId, tokenValue),
        ]);

        setVehicleForms(
          vehicles.map((v) => ({
            id: v.id,
            typeId: v.type?.id ?? null,
            brandId: v.brand?.id ?? null,
            brandOther: v.brandOther ?? undefined,
            model: v.model,
            year: v.year ?? null,
            vinOrPlate: v.vinOrPlate ?? null,
            notes: v.notes ?? null,
          })),
        );
        setPartForms(parts.map((p) => ({ id: p.id, categoryId: p.category?.id ?? null, description: p.description })));
        setRemovedVehicleIds([]);
        setRemovedPartIds([]);

        return mapAssetsForClient(vehicles, parts);
      } finally {
        setAssetsLoading(false);
      }
    },
    [mapAssetsForClient],
  );

  const hydrateClients = useCallback((users: UserProfile[], bookings: BookingItem[]): Client[] => {
    const extras = new Map<number, { vehicles: Client['vehicles']; parts: Client['parts'] }>();
    bookings.forEach((b) => {
      if (!b.customer) return;
      const existing = extras.get(b.customer.id) || { vehicles: [], parts: [] };
      if (b.vehicle) {
        existing.vehicles.push({
          id: b.vehicle.id ?? b.id,
          typeName: b.vehicle.type?.name,
          brandLabel: b.vehicle.brand?.name ?? b.vehicle.brandOther ?? undefined,
          model: b.vehicle.model,
          vin: b.vehicle.vinOrPlate ?? undefined,
        });
      }
      if (b.part) {
        existing.parts.push({
          id: b.part.id ?? b.id,
          categoryName: b.part.category?.name,
          description: b.part.description,
        });
      }
      extras.set(b.customer.id, existing);
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      vehicles: extras.get(u.id)?.vehicles ?? [],
      parts: extras.get(u.id)?.parts ?? [],
    }));
  }, []);

  useEffect(() => {
    if (!token || !isAdmin) return;
    setLoading(true);
    Promise.all([usersApi.listClients(token), bookingApi.listAll(token)])
      .then(([users, bookings]) => {
        setClients(hydrateClients(users, bookings));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar clientes'))
      .finally(() => setLoading(false));
  }, [hydrateClients, isAdmin, token]);

  useEffect(() => {
    if (!token || !isAdmin || refsLoaded) return;
    Promise.all([bookingApi.listVehicleTypes(token), bookingApi.listVehicleBrands(token), bookingApi.listPartCategories(token)])
      .then(([types, brands, categories]) => {
        setVehicleTypes(types);
        setVehicleBrands(brands);
        setPartCategories(categories);
        setRefsLoaded(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar catálogos'));
  }, [isAdmin, refsLoaded, token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      const matchesQuery = !q
        ? true
        : [c.fullName, c.email, c.phone]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q));

      const matchesVehicle = !vehicleFilter
        ? true
        : c.vehicles.some((v) =>
            [v.brandLabel, v.model, v.vin, v.typeName]
              .filter(Boolean)
              .some((f) => f!.toLowerCase().includes(vehicleFilter.toLowerCase())),
          );

      const matchesPart = !partFilter
        ? true
        : c.parts
            .some((p) => [p.categoryName, p.description].filter(Boolean).some((f) => f!.toLowerCase().includes(partFilter.toLowerCase())));

      return matchesQuery && matchesVehicle && matchesPart;
    });
  }, [clients, partFilter, query, vehicleFilter]);

  const addVehicleRow = () =>
    setVehicleForms((prev) => [
      ...prev,
      { id: undefined, typeId: vehicleTypes[0]?.id ?? null, brandId: null, brandOther: '', model: '', year: null, vinOrPlate: '', notes: '' },
    ]);

  const addPartRow = () =>
    setPartForms((prev) => [
      ...prev,
      { id: undefined, categoryId: partCategories[0]?.id ?? null, description: '' },
    ]);

  const updateVehicleRow = (index: number, patch: Partial<VehicleForm>) => {
    setVehicleForms((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const updatePartRow = (index: number, patch: Partial<PartForm>) => {
    setPartForms((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const removeVehicleRow = (index: number) => {
    setVehicleForms((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedVehicleIds((ids) => [...ids, target.id!]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const removePartRow = (index: number) => {
    setPartForms((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedPartIds((ids) => [...ids, target.id!]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const syncClientAssets = useCallback(
    async (clientId: number, tokenValue: string) => {
      for (const v of vehicleForms) {
        if (!v.typeId || !v.model.trim()) throw new Error('Cada vehículo requiere tipo y modelo');
      }
      for (const p of partForms) {
        if (!p.categoryId || !p.description.trim()) throw new Error('Cada pieza requiere categoría y descripción');
      }

      await Promise.all(removedVehicleIds.map((id) => usersApi.deleteVehicle(clientId, id, tokenValue)));
      await Promise.all(removedPartIds.map((id) => usersApi.deletePart(clientId, id, tokenValue)));

      for (const v of vehicleForms) {
        const payload = {
          typeId: v.typeId,
          brandId: v.brandId || null,
          brandOther: v.brandOther || null,
          model: v.model,
          year: v.year ?? null,
          vinOrPlate: v.vinOrPlate || null,
          notes: v.notes || null,
        };
        if (v.id) {
          await usersApi.updateVehicle(clientId, v.id, payload, tokenValue);
        } else {
          await usersApi.createVehicle(clientId, payload, tokenValue);
        }
      }

      for (const p of partForms) {
        const payload = { categoryId: p.categoryId, description: p.description };
        if (p.id) {
          await usersApi.updatePart(clientId, p.id, payload, tokenValue);
        } else {
          await usersApi.createPart(clientId, payload, tokenValue);
        }
      }

      const refreshed = await loadClientAssets(clientId, tokenValue);
      return refreshed;
    },
    [loadClientAssets, partForms, removedPartIds, removedVehicleIds, vehicleForms],
  );

  const startEditing = (c: Client | null) => {
    setEditTarget(c);
    setForm({ fullName: c?.fullName ?? '', email: c?.email ?? '', phone: c?.phone ?? '' });
    setError(null);
    setVehicleForms([]);
    setPartForms([]);
    setRemovedVehicleIds([]);
    setRemovedPartIds([]);
    setActiveTab('info');
    if (c && token) {
        loadClientAssets(c.id, token).catch((err) => setError(err?.message || 'No se pudo cargar activos'));
    }
  };

  if (!isAdmin) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">gpp_bad</span>
                Acceso denegado: Solo administradores.
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Cartera de Clientes
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Administra tus clientes, sus vehículos y piezas.
            </p>
        </div>
        <button
          onClick={() => startEditing({ id: 0, email: '', fullName: '', phone: '', vehicles: [], parts: [] })}
          className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Cliente
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-8 bg-white dark:bg-[#1a2632] rounded-[2rem] p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar cliente..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
            </div>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-purple-500 transition-colors">directions_car</span>
                <input 
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    placeholder="Filtrar por vehículo..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm"
                />
            </div>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-green-500 transition-colors">settings_suggest</span>
                <input 
                    value={partFilter}
                    onChange={(e) => setPartFilter(e.target.value)}
                    placeholder="Filtrar por pieza..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm"
                />
            </div>
        </div>
        {(query || vehicleFilter || partFilter) && (
            <button 
                onClick={() => { setQuery(''); setVehicleFilter(''); setPartFilter(''); }}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                Limpiar
            </button>
        )}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loading /></div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filtered.map(client => (
                    <div key={client.id} className="group flex flex-col bg-white dark:bg-[#1a2632] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden relative">
                        {/* Actions Overlay (visible on hover) */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 z-10">
                            <button 
                                onClick={() => startEditing(client)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-500 shadow-lg hover:scale-110 transition-all"
                                title="Editar"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                                onClick={() => setConfirmingDelete(client)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 shadow-lg hover:scale-110 transition-all"
                                title="Eliminar"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>

                        {/* Card Header */}
                        <div className="p-6 pb-4">
                           <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/30">
                                    {client.fullName ? client.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1" title={client.fullName || ''}>
                                        {client.fullName || 'Sin nombre'}
                                    </h3>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                        <span className="material-symbols-outlined text-[14px]">mail</span>
                                        <span className="truncate max-w-[150px]">{client.email}</span>
                                    </div>
                                </div>
                           </div>

                           {/* Contact Stats */}
                           <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-800">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{client.vehicles.length}</span>
                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Vehículos</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-800">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{client.parts.length}</span>
                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Piezas</span>
                                </div>
                           </div>
                           
                           {client.phone && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold w-full justify-center">
                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                    {client.phone}
                                </div>
                           )}
                        </div>

                        {/* Card Footer (Previews) */}
                        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-transparent">
                            {client.vehicles.length > 0 ? (
                                <div className="space-y-1">
                                    {client.vehicles.slice(0, 2).map((v, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-[14px] text-gray-400">directions_car</span>
                                            <span className="truncate font-medium">{v.brandLabel} {v.model}</span>
                                        </div>
                                    ))}
                                    {client.vehicles.length > 2 && <span className="text-[10px] text-gray-400 pl-6">+{client.vehicles.length - 2} más...</span>}
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400 italic pl-6">Sin vehículos registrados</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No se encontraron clientes</h3>
                    <p className="text-gray-500 max-w-sm mt-2">Intenta ajustar los filtros de búsqueda.</p>
                </div>
            )}
        </>
      )}

      {/* --- Edit Modal --- */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a2632] rounded-[2rem] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="shrink-0 p-6 md:p-8 flex items-start justify-between border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {editTarget.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Complete la información del cliente y sus asignaciones.</p>
                </div>
                <button 
                    onClick={() => setEditTarget(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Modal Tabs */}
            <div className="shrink-0 flex gap-1 px-8 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                {[
                    { id: 'info', label: 'Información', icon: 'person' },
                    { id: 'vehicles', label: `Vehículos (${vehicleForms.length})`, icon: 'directions_car' },
                    { id: 'parts', label: `Piezas (${partForms.length})`, icon: 'settings' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/50 dark:bg-black/20">
                {activeTab === 'info' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="grid gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nombre Completo</label>
                                <input
                                    value={form.fullName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Email</label>
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Teléfono</label>
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder="+54 9 11 ..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vehicles' && (
                   <div className="space-y-4">
                        {!refsLoaded && <div className="text-center py-4"><Loading /></div>}
                        
                        {vehicleForms.map((v, index) => (
                             <div key={v.id ?? `new-${index}`} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary/50 transition-colors relative">
                                <button 
                                    onClick={() => removeVehicleRow(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipo</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.typeId ?? ''}
                                            onChange={(e) => updateVehicleRow(index, { typeId: e.target.value ? Number(e.target.value) : null })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {vehicleTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Marca</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.brandId ?? ''}
                                            onChange={(e) => updateVehicleRow(index, { brandId: e.target.value ? Number(e.target.value) : null, brandOther: '' })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {vehicleBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Modelo</label>
                                        <input
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.model}
                                            onChange={(e) => updateVehicleRow(index, { model: e.target.value })}
                                            placeholder="Modelo"
                                        />
                                    </div>

                                    {/* Optional Fields Row */}
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Año</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.year ?? ''}
                                            onChange={(e) => updateVehicleRow(index, { year: e.target.value ? Number(e.target.value) : null })}
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Patente / VIN</label>
                                        <input
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.vinOrPlate ?? ''}
                                            onChange={(e) => updateVehicleRow(index, { vinOrPlate: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Notas</label>
                                        <input
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={v.notes ?? ''}
                                            onChange={(e) => updateVehicleRow(index, { notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                             </div>
                        ))}

                        <button
                            onClick={addVehicleRow}
                            disabled={!refsLoaded}
                            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Agregar Vehículo
                        </button>
                   </div>
                )}

                {activeTab === 'parts' && (
                    <div className="space-y-4">
                        {!refsLoaded && <div className="text-center py-4"><Loading /></div>}

                        {partForms.map((p, index) => (
                             <div key={p.id ?? `part-${index}`} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary/50 transition-colors relative flex items-start gap-4">
                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Categoría</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={p.categoryId ?? ''}
                                            onChange={(e) => updatePartRow(index, { categoryId: Number(e.target.value) || null })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {partCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descripción</label>
                                        <input
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                            value={p.description}
                                            onChange={(e) => updatePartRow(index, { description: e.target.value })}
                                            placeholder="Detalle"
                                        />
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => removePartRow(index)}
                                    className="mt-6 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                             </div>
                        ))}

                        <button
                            onClick={addPartRow}
                            disabled={!refsLoaded}
                            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Agregar Pieza
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a2632]">
                {error ? (
                    <span className="text-red-500 text-sm font-medium animate-pulse">{error}</span>
                ) : (
                    <span className="text-gray-400 text-sm">(*) Campos requeridos</span>
                )}
                
                <div className="flex gap-3">
                    <button
                        onClick={() => setEditTarget(null)}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
                        onClick={async () => {
                            if (!token || !editTarget) return;
                            setSaving(true);
                            setError(null);
                            try {
                                const payload = {
                                    fullName: form.fullName || undefined,
                                    email: form.email || undefined,
                                    phone: form.phone || undefined,
                                };
                                const updated = editTarget.id
                                    ? await usersApi.updateClient(editTarget.id, payload, token)
                                    : await usersApi.createClient(payload, token);

                                let assets = { vehicles: editTarget.vehicles, parts: editTarget.parts };
                                if (vehicleForms.length || partForms.length || removedVehicleIds.length || removedPartIds.length) {
                                    assets = await syncClientAssets(updated.id, token);
                                }

                                setClients((prev) => {
                                    const others = prev.filter((c) => c.id !== updated.id);
                                    return [
                                        ...others,
                                        {
                                            ...updated,
                                            vehicles: assets.vehicles,
                                            parts: assets.parts,
                                        },
                                    ].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
                                });
                                setEditTarget(null);
                            } catch (err: any) {
                                setError(err?.message || 'No se pudo guardar');
                            } finally {
                                setSaving(false);
                            }
                        }}
                    >
                        {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                        Guardar Cliente
                    </button>
                </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Delete Confirmation --- */}
      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-scale-in text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mx-auto flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl">warning</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">¿Eliminar cliente?</h3>
                <p className="text-gray-500 mb-8">Esta acción deshabilitará el acceso de <strong>{confirmingDelete.fullName}</strong> pero mantendrá su historial de reparaciones.</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setConfirmingDelete(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={async () => {
                            if (!token || !confirmingDelete) return;
                            setSaving(true);
                            try {
                                await usersApi.deleteClient(confirmingDelete.id, token);
                                setClients((prev) => prev.filter((c) => c.id !== confirmingDelete.id));
                                setConfirmingDelete(null);
                            } catch (err: any) {
                                alert(err.message);
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
                    >
                        {saving ? '...' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
