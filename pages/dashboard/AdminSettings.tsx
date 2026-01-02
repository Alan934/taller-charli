import React, { useEffect, useMemo, useState } from 'react';
import { bookingApi } from '../../services/booking';
import { useAuth } from '../../context/AuthContext';
import {
  Issue,
  PartCategory,
  VehicleBrandOption,
  Workday,
  WorkdayOverride,
} from '../../types/booking';

const weekdayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const defaultDay = (weekday: number, startTime = '08:00', endTime = '13:00', isActive = weekday !== 0): Workday => ({
  weekday,
  startTime,
  endTime,
  isActive,
  maxBookings: 6,
});

const defaultSchedule = (): Workday[] => {
  // Turno mañana y tarde, lunes a sábado, 6 cupos cada uno
  const days: Workday[] = [];
  for (let weekday = 1; weekday <= 6; weekday += 1) {
    days.push(defaultDay(weekday, '08:00', '13:00', true));
    days.push(defaultDay(weekday, '16:00', '20:00', true));
  }
  // Domingo sin actividad
  return days;
};

const sortWorkdays = (items: Workday[]) =>
  [...items].sort((a, b) => (a.weekday === b.weekday ? a.startTime.localeCompare(b.startTime) : a.weekday - b.weekday));

const AdminSettings: React.FC = () => {
  const { token, user } = useAuth();
  const [workdays, setWorkdays] = useState<Workday[]>(defaultSchedule());
  const [overrides, setOverrides] = useState<WorkdayOverride[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [brands, setBrands] = useState<VehicleBrandOption[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newOverride, setNewOverride] = useState<WorkdayOverride>({ date: '', maxBookings: 4 });
  const [newCategory, setNewCategory] = useState({ code: '', name: '' });
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [newIssue, setNewIssue] = useState({ label: '', durationMinutes: 30, partCategoryId: '' });

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    Promise.all([
      bookingApi.getWorkdays(token),
      bookingApi.listPartCategories(token),
      bookingApi.listVehicleBrands(token),
      bookingApi.listCommonIssues(token),
    ])
      .then(([schedule, categories, vehicleBrands, commonIssues]) => {
        const normalized = schedule.workdays.length ? sortWorkdays(schedule.workdays) : defaultSchedule();
        setWorkdays(normalized);
        setOverrides(schedule.overrides ?? []);
        setPartCategories(categories);
        setBrands(vehicleBrands);
        setIssues(commonIssues);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración'))
      .finally(() => setLoading(false));
  }, [token, user?.role]);

  const activeDays = useMemo(() => {
    const set = new Set<number>();
    workdays.forEach((d) => d.isActive && set.add(d.weekday));
    return set.size;
  }, [workdays]);

  const updateSegment = (weekday: number, segmentIndex: number, field: keyof Workday, value: string | number | boolean) => {
    setWorkdays((prev) => {
      let counter = -1;
      return sortWorkdays(
        prev.map((w) => {
          if (w.weekday !== weekday) return w;
          counter += 1;
          if (counter === segmentIndex) {
            return { ...w, [field]: value } as Workday;
          }
          return w;
        }),
      );
    });
  };

  const addSegment = (weekday: number) => {
    setWorkdays((prev) => {
      const segments = prev.filter((w) => w.weekday === weekday);
      const next: Workday = segments.length === 0
        ? defaultDay(weekday, '08:00', '13:00', weekday !== 0)
        : segments.length === 1
          ? defaultDay(weekday, '16:00', '20:00', segments[0].isActive)
          : { ...segments[segments.length - 1] };
      return sortWorkdays([...prev, next]);
    });
  };

  const removeSegment = (weekday: number, segmentIndex: number) => {
    setWorkdays((prev) => {
      let counter = -1;
      return prev.filter((w) => {
        if (w.weekday !== weekday) return true;
        counter += 1;
        return counter !== segmentIndex;
      });
    });
  };

  const handleSaveSchedule = async () => {
    if (!token) return;
    setSavingSchedule(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        workdays: workdays.map((d) => ({
          weekday: d.weekday,
          startTime: d.startTime,
          endTime: d.endTime,
          isActive: d.isActive,
          maxBookings: Number(d.maxBookings) || 1,
        })),
        overrides: overrides.map((o) => ({ date: o.date, maxBookings: Number(o.maxBookings) || 1 })),
      };
      const saved = await bookingApi.saveWorkdays(payload, token);
      setWorkdays(saved.workdays);
      setOverrides(saved.overrides);
      setMessage('Horarios actualizados');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSavingSchedule(false);
    }
  };

  const addOverride = () => {
    if (!newOverride.date || !newOverride.maxBookings) return;
    setOverrides((prev) => {
      const existing = prev.find((o) => o.date === newOverride.date);
      if (existing) {
        return prev.map((o) => (o.date === newOverride.date ? { ...o, maxBookings: newOverride.maxBookings } : o));
      }
      return [...prev, newOverride];
    });
    setNewOverride({ date: '', maxBookings: 4 });
  };

  const removeOverride = (date: string) => {
    setOverrides((prev) => prev.filter((o) => o.date !== date));
  };

  const handleCreateCategory = async () => {
    if (!token || !newCategory.code || !newCategory.name) return;
    try {
      const created = await bookingApi.createPartCategory({ ...newCategory }, token);
      setPartCategories((prev) => [...prev, created]);
      setNewCategory({ code: '', name: '' });
      setMessage('Categoría creada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la categoría');
    }
  };

  const handleUpdateCategory = async (id: number, data: Partial<PartCategory>) => {
    if (!token) return;
    try {
      const updated = await bookingApi.updatePartCategory(id, data, token);
      setPartCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setMessage('Categoría actualizada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la categoría');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!token) return;
    try {
      await bookingApi.deletePartCategory(id, token);
      setPartCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la categoría');
    }
  };

  const handleCreateBrand = async () => {
    if (!token || !newBrand.name.trim()) return;
    try {
      const created = await bookingApi.createVehicleBrand({ name: newBrand.name.trim() }, token);
      setBrands((prev) => [...prev, created]);
      setNewBrand({ name: '' });
      setMessage('Marca creada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la marca');
    }
  };

  const handleUpdateBrand = async (id: number, name: string) => {
    if (!token) return;
    try {
      const updated = await bookingApi.updateVehicleBrand(id, { name }, token);
      setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setMessage('Marca actualizada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la marca');
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!token) return;
    try {
      await bookingApi.deleteVehicleBrand(id, token);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la marca');
    }
  };

  const handleCreateIssue = async () => {
    if (!token || !newIssue.label.trim() || !newIssue.durationMinutes) return;
    try {
      const created = await bookingApi.createIssue(
        {
          label: newIssue.label.trim(),
          durationMinutes: Number(newIssue.durationMinutes),
          partCategoryId: newIssue.partCategoryId ? Number(newIssue.partCategoryId) : undefined,
          kind: 'COMMON',
        },
        token,
      );
      setIssues((prev) => [...prev, created]);
      setNewIssue({ label: '', durationMinutes: 30, partCategoryId: '' });
      setMessage('Falla creada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la falla');
    }
  };

  const handleUpdateIssue = async (issue: Issue, data: Partial<Issue> & { partCategoryId?: number }) => {
    if (!token) return;
    try {
      const updated = await bookingApi.updateIssue(issue.id, data, token);
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? updated : i)));
      setMessage('Falla actualizada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la falla');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-red-600">Solo los administradores pueden acceder a esta sección.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Administración</p>
        <h1 className="text-2xl md:text-3xl font-bold">Horarios y catálogos</h1>
        <p className="text-sm text-[#617989]">Gestioná disponibilidad, marcas y fallas comunes.</p>
      </header>

      {(error || message) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {error ?? message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#617989]">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white dark:bg-surface-dark border border-[#dbe1e6] dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Horarios y días de trabajo</h2>
                <p className="text-sm text-[#617989]">Turnos por franja. Días activos: {activeDays}/7</p>
              </div>
              <button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow disabled:opacity-50"
              >
                {savingSchedule ? 'Guardando...' : 'Guardar horarios'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekdayLabels.map((label, weekday) => {
                const segments = workdays.filter((w) => w.weekday === weekday);
                return (
                  <div key={label} className="rounded-xl border border-[#eef2f6] dark:border-gray-800 p-4 bg-gradient-to-br from-white to-[#f8fbff] dark:from-surface-dark dark:to-[#0f172a]">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111518]">{label}</span>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{segments.length} turno{segments.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#617989]">
                        <input
                          type="checkbox"
                          checked={segments.some((s) => s.isActive)}
                          onChange={(e) => segments.forEach((_, idx) => updateSegment(weekday, idx, 'isActive', e.target.checked))}
                          className="size-4 accent-primary"
                          aria-label={`Activar ${label}`}
                        />
                        <span>{segments.some((s) => s.isActive) ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {segments.length === 0 && (
                        <p className="text-sm text-[#617989]">Sin franjas. Agregá un turno.</p>
                      )}

                      {segments.map((seg, idx) => (
                        <div key={`${label}-${idx}`} className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-surface-dark px-3 py-3 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-[#617989]">Turno {idx + 1}</span>
                            {segments.length > 1 && (
                              <button
                                onClick={() => removeSegment(weekday, idx)}
                                className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <label className="flex flex-col gap-1 text-[#617989]">
                              <span className="text-[11px] uppercase tracking-wide">Inicio</span>
                              <input
                                type="time"
                                value={seg.startTime}
                                onChange={(e) => updateSegment(weekday, idx, 'startTime', e.target.value)}
                                className="rounded-lg border border-[#dbe1e6] px-2 py-2"
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-[#617989]">
                              <span className="text-[11px] uppercase tracking-wide">Fin</span>
                              <input
                                type="time"
                                value={seg.endTime}
                                onChange={(e) => updateSegment(weekday, idx, 'endTime', e.target.value)}
                                className="rounded-lg border border-[#dbe1e6] px-2 py-2"
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-[#617989]">
                              <span className="text-[11px] uppercase tracking-wide">Cupos</span>
                              <input
                                type="number"
                                min={1}
                                value={seg.maxBookings}
                                onChange={(e) => updateSegment(weekday, idx, 'maxBookings', Number(e.target.value))}
                                className="rounded-lg border border-[#dbe1e6] px-2 py-2"
                              />
                            </label>
                            <label className="flex items-center gap-2 text-[#111518] font-semibold">
                              <input
                                type="checkbox"
                                checked={seg.isActive}
                                onChange={(e) => updateSegment(weekday, idx, 'isActive', e.target.checked)}
                                className="size-4 accent-primary"
                              />
                              Activo
                            </label>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addSegment(weekday)}
                        className="w-full mt-1 rounded-lg border border-dashed border-primary/50 text-primary text-sm font-semibold py-2 hover:bg-primary/5"
                      >
                        Agregar turno
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Excepciones / cupos especiales</h3>
                <p className="text-xs text-[#617989]">Aplican a una fecha puntual</p>
              </div>
              <div className="flex flex-col gap-3">
                {overrides.length === 0 && <p className="text-sm text-[#617989]">No hay excepciones.</p>}
                {overrides.map((o) => (
                  <div key={o.date} className="flex flex-wrap items-center gap-3 border border-[#dbe1e6] rounded-lg p-3">
                    <span className="text-sm font-medium">{o.date}</span>
                    <input
                      type="number"
                      min={1}
                      value={o.maxBookings}
                      onChange={(e) =>
                        setOverrides((prev) =>
                          prev.map((item) =>
                            item.date === o.date ? { ...item, maxBookings: Number(e.target.value) } : item,
                          ),
                        )
                      }
                      className="w-24 rounded-lg border border-[#dbe1e6] px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeOverride(o.date)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="date"
                    value={newOverride.date}
                    onChange={(e) => setNewOverride((prev) => ({ ...prev, date: e.target.value }))}
                    className="rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={newOverride.maxBookings}
                    onChange={(e) => setNewOverride((prev) => ({ ...prev, maxBookings: Number(e.target.value) }))}
                    className="w-24 rounded-lg border border-[#dbe1e6] px-2 py-2 text-sm"
                  />
                  <button
                    onClick={addOverride}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow"
                  >
                    Agregar fecha
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-surface-dark border border-[#dbe1e6] dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold">Marcas de vehículos</h2>
              <p className="text-sm text-[#617989]">Alta, edición y eliminación.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="group inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#dbe1e6] bg-white dark:bg-surface-dark shadow-sm hover:-translate-y-0.5 hover:shadow transition-all duration-150"
                  >
                    <input
                      className="w-28 sm:w-32 bg-transparent text-sm font-semibold text-[#111518] dark:text-white outline-none"
                      defaultValue={brand.name}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== brand.name) handleUpdateBrand(brand.id, next);
                      }}
                    />
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="text-xs text-red-500 opacity-70 group-hover:opacity-100 hover:text-red-600"
                      aria-label={`Eliminar ${brand.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ name: e.target.value })}
                  placeholder="Nueva marca"
                  className="flex-1 rounded-full border border-[#dbe1e6] px-3 py-2 text-sm shadow-sm"
                />
                <button onClick={handleCreateBrand} className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow self-start sm:self-auto">
                  Agregar
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Categorías de repuestos</h2>
              <p className="text-sm text-[#617989]">Organizá piezas y repuestos.</p>
              <div className="flex flex-col gap-3 mt-3">
                {partCategories.map((cat) => (
                  <div key={cat.id} className="flex flex-wrap items-center gap-3 border border-[#dbe1e6] rounded-lg p-3">
                    <input
                      className="w-28 rounded-lg border border-[#dbe1e6] px-2 py-1 text-sm"
                      defaultValue={cat.code}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val && val !== cat.code) handleUpdateCategory(cat.id, { code: val });
                      }}
                    />
                    <input
                      className="flex-1 min-w-[180px] rounded-lg border border-[#dbe1e6] px-2 py-1 text-sm"
                      defaultValue={cat.name}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val && val !== cat.name) handleUpdateCategory(cat.id, { name: val });
                      }}
                    />
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <input
                  type="text"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Código"
                  className="w-32 rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre"
                  className="flex-1 min-w-[180px] rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                />
                <button onClick={handleCreateCategory} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
                  Agregar
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Fallas comunes</h2>
              <p className="text-sm text-[#617989]">Ajustá descripciones y demoras.</p>
              <div className="flex flex-col gap-3 mt-3">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex flex-col gap-3 border border-[#dbe1e6] rounded-lg p-3">
                    <div className="flex flex-wrap gap-3 items-center">
                      <input
                        className="flex-1 min-w-[200px] rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                        defaultValue={issue.label}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next && next !== issue.label) handleUpdateIssue(issue, { label: next });
                        }}
                      />
                      <input
                        type="number"
                        min={5}
                        className="w-24 rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                        defaultValue={issue.durationMinutes ?? 30}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val && val !== issue.durationMinutes) handleUpdateIssue(issue, { durationMinutes: val });
                        }}
                      />
                      <select
                        className="min-w-[180px] rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                        defaultValue={issue.partCategory?.id ?? ''}
                        onChange={(e) =>
                          handleUpdateIssue(issue, {
                            partCategoryId: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      >
                        <option value="">Todas</option>
                        {partCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {issue.partCategory ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#eef2f6] text-[#111518] border border-[#dbe1e6]">
                          {issue.partCategory.name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#617989]">Aplica a vehículos</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 mt-3 border border-dashed border-[#dbe1e6] rounded-lg p-3">
                <p className="text-sm font-semibold">Nueva falla</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    value={newIssue.label}
                    onChange={(e) => setNewIssue((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="Descripción"
                    className="flex-1 min-w-[200px] rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={5}
                    value={newIssue.durationMinutes}
                    onChange={(e) => setNewIssue((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-24 rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                  />
                  <select
                    value={newIssue.partCategoryId}
                    onChange={(e) => setNewIssue((prev) => ({ ...prev, partCategoryId: e.target.value }))}
                    className="min-w-[180px] rounded-lg border border-[#dbe1e6] px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    {partCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleCreateIssue} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
                    Crear
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
