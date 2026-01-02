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
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [vehicleForms, setVehicleForms] = useState<VehicleForm[]>([]);
  const [partForms, setPartForms] = useState<PartForm[]>([]);
  const [removedVehicleIds, setRemovedVehicleIds] = useState<number[]>([]);
  const [removedPartIds, setRemovedPartIds] = useState<number[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrandOption[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [refsLoaded, setRefsLoaded] = useState(false);

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

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-2 text-[#111518] dark:text-white">Clientes</h1>
        <p className="text-sm text-[#617989] dark:text-gray-400">Solo los administradores pueden gestionar clientes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Clientes</p>
          <h1 className="text-3xl font-black text-[#111518] dark:text-white leading-tight">Gestión de clientes</h1>
          <p className="text-sm text-[#617989] dark:text-gray-400">Filtra por datos del cliente, vehículos o piezas.</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2"
          onClick={() => {
            setForm({ fullName: '', email: '', phone: '' });
            setEditTarget({ id: 0, email: '', fullName: '', phone: '', vehicles: [], parts: [] });
            setError(null);
            setVehicleForms([]);
            setPartForms([]);
            setRemovedVehicleIds([]);
            setRemovedPartIds([]);
          }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo cliente
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 p-4 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Buscar</span>
            <input
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Nombre, email o teléfono"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Vehículo</span>
            <input
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Marca, modelo, VIN"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Pieza</span>
            <input
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Categoría o descripción"
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm"
              onClick={() => {
                setQuery('');
                setVehicleFilter('');
                setPartFilter('');
              }}
            >
              Limpiar
            </button>
            <button
              className="rounded-lg bg-primary/60 text-white px-3 py-2 text-sm font-semibold cursor-not-allowed"
              onClick={() => undefined}
              disabled
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#dbe1e6] dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-[#617989] dark:text-gray-400">{loading ? 'Cargando...' : `${filtered.length} clientes`}</p>
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <Loading label="Buscando clientes" fillViewport={false} />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/70">
                  {['Cliente', 'Email', 'Teléfono', 'Vehículos', 'Piezas', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#617989] dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbe1e6] dark:divide-gray-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#111518] dark:text-white font-semibold">{c.fullName || 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">
                      {c.vehicles.length ? (
                        <div className="flex flex-col gap-1 text-xs text-[#617989] dark:text-gray-300">
                          {c.vehicles.map((v) => (
                            <span key={v.id} className="line-clamp-1">{[v.brandLabel, v.model, v.vin].filter(Boolean).join(' • ')}</span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">
                      {c.parts.length ? (
                        <div className="flex flex-col gap-1 text-xs text-[#617989] dark:text-gray-300">
                          {c.parts.map((p) => (
                            <span key={p.id} className="line-clamp-1">{[p.categoryName, p.description].filter(Boolean).join(' • ')}</span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => {
                            setEditTarget(c);
                            setForm({ fullName: c.fullName ?? '', email: c.email, phone: c.phone ?? '' });
                            setError(null);
                            setVehicleForms([]);
                            setPartForms([]);
                            setRemovedVehicleIds([]);
                            setRemovedPartIds([]);
                            if (token) {
                              loadClientAssets(c.id, token).catch((err) => setError(err?.message || 'No se pudo cargar vehículos/piezas'));
                            }
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => {
                            setConfirmingDelete(c);
                            setError(null);
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-[#617989] dark:text-gray-400 text-center">{loading ? 'Cargando...' : 'Sin resultados con esos filtros.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-[#dbe1e6] dark:border-gray-800 w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-primary">{editTarget.id ? 'Editar' : 'Nuevo'} cliente</p>
                <h3 className="text-xl font-black text-[#111518] dark:text-white">{editTarget.fullName || 'Cliente'}</h3>
              </div>
              <button className="text-[#617989] hover:text-primary" onClick={() => setEditTarget(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1 text-sm text-[#111518] dark:text-gray-200">
                Nombre completo
                <input
                  className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nombre y apellido"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#111518] dark:text-gray-200">
                Email
                <input
                  className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@correo.com"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#111518] dark:text-gray-200">
                Teléfono
                <input
                  className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: +54 9 11 5555-5555"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#111518] dark:text-gray-200">Vehículos</h4>
                <button
                  className="inline-flex items-center gap-1 text-sm text-primary font-semibold"
                  onClick={addVehicleRow}
                  disabled={!refsLoaded}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Agregar vehículo
                </button>
              </div>
              {!refsLoaded && <p className="text-xs text-[#617989]">Cargando catálogos...</p>}
              {assetsLoading ? (
                <div className="py-4"><Loading label="Cargando vehículos" fillViewport={false} /></div>
              ) : (
                <div className="space-y-2">
                  {vehicleForms.length === 0 && <p className="text-sm text-[#617989]">Sin vehículos.</p>}
                  {vehicleForms.map((v, index) => (
                    <div key={v.id ?? `new-${index}`} className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Tipo</span>
                        <select
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.typeId ?? ''}
                          onChange={(e) => updateVehicleRow(index, { typeId: e.target.value ? Number(e.target.value) : null })}
                        >
                          <option value="">Seleccionar tipo</option>
                          {vehicleTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Marca</span>
                        <select
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.brandId ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateVehicleRow(index, { brandId: val ? Number(val) : null, brandOther: '' });
                          }}
                        >
                          <option value="">Sin marca</option>
                          {vehicleBrands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <input
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          placeholder="Otra marca"
                          value={v.brandOther ?? ''}
                          onChange={(e) => updateVehicleRow(index, { brandOther: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Modelo</span>
                        <input
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.model}
                          onChange={(e) => updateVehicleRow(index, { model: e.target.value })}
                          placeholder="Modelo"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Año</span>
                        <input
                          type="number"
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.year ?? ''}
                          onChange={(e) => updateVehicleRow(index, { year: e.target.value ? Number(e.target.value) : null })}
                          placeholder="2020"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">VIN / Patente</span>
                        <input
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.vinOrPlate ?? ''}
                          onChange={(e) => updateVehicleRow(index, { vinOrPlate: e.target.value })}
                          placeholder="VIN o patente"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Notas</span>
                        <input
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={v.notes ?? ''}
                          onChange={(e) => updateVehicleRow(index, { notes: e.target.value })}
                          placeholder="Detalles adicionales"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          className="text-sm text-red-600 hover:underline"
                          onClick={() => removeVehicleRow(index)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#111518] dark:text-gray-200">Piezas</h4>
                <button
                  className="inline-flex items-center gap-1 text-sm text-primary font-semibold"
                  onClick={addPartRow}
                  disabled={!refsLoaded}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Agregar pieza
                </button>
              </div>
              {assetsLoading ? (
                <div className="py-4"><Loading label="Cargando piezas" fillViewport={false} /></div>
              ) : (
                <div className="space-y-2">
                  {partForms.length === 0 && <p className="text-sm text-[#617989]">Sin piezas.</p>}
                  {partForms.map((p, index) => (
                    <div key={p.id ?? `part-${index}`} className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 p-3 grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Categoría</span>
                        <select
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={p.categoryId ?? ''}
                          onChange={(e) => updatePartRow(index, { categoryId: Number(e.target.value) || null })}
                        >
                          <option value="">Seleccionar categoría</option>
                          {partCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989]">Descripción</span>
                        <input
                          className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={p.description}
                          onChange={(e) => updatePartRow(index, { description: e.target.value })}
                          placeholder="Detalle de la pieza"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button className="text-sm text-red-600 hover:underline" onClick={() => removePartRow(index)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-[#dbe1e6] dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setEditTarget(null)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
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
                    setError(err?.message || 'No se pudo guardar el cliente');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-[#dbe1e6] dark:border-gray-800 w-full max-w-md p-6 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-[#111518] dark:text-white">Eliminar cliente</h3>
              <button className="text-[#617989] hover:text-primary" onClick={() => setConfirmingDelete(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#617989] dark:text-gray-300">
              Esta acción desactiva al cliente y mantiene el historial. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-[#dbe1e6] dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setConfirmingDelete(null)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-60"
                onClick={async () => {
                  if (!token || !confirmingDelete) return;
                  setSaving(true);
                  setError(null);
                  try {
                    await usersApi.deleteClient(confirmingDelete.id, token);
                    setClients((prev) => prev.filter((c) => c.id !== confirmingDelete.id));
                    setConfirmingDelete(null);
                  } catch (err: any) {
                    setError(err?.message || 'No se pudo eliminar el cliente');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
