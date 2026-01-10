import React, { useEffect, useMemo, useState } from 'react';
import { bookingApi } from '../../services/booking';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
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

  // States for Editing
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryData, setEditingCategoryData] = useState({ code: '', name: '' });

  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);
  const [editingIssueData, setEditingIssueData] = useState({ label: '', durationMinutes: 30, partCategoryId: '' });

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
          maxBookings: Number(d.maxBookings) >= 0 ? Number(d.maxBookings) : 1, // Ensure non-negative
        })),
        overrides: overrides.map((o) => ({ date: o.date, maxBookings: Number(o.maxBookings) })), // Allow 0
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
    if (!newOverride.date || newOverride.maxBookings === undefined || newOverride.maxBookings < 0) return;
    setOverrides((prev) => {
      const existing = prev.find((o) => o.date === newOverride.date);
      if (existing) {
        return prev.map((o) => (o.date === newOverride.date ? { ...o, maxBookings: newOverride.maxBookings } : o));
      }
      return [...prev, newOverride];
    });
    setNewOverride({ date: '', maxBookings: 0 }); // Default to 0 (Holiday) for convenience
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

  const handleDeleteIssue = async (id: number) => {
    if (!token) return;
    try {
      await bookingApi.deleteIssue(id, token);
      setIssues((prev) => prev.filter((i) => i.id !== id));
      setMessage('Falla eliminada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la falla');
    }
  };

  // --- Editing Helpers ---

  const startEditingCategory = (cat: PartCategory) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryData({ code: cat.code, name: cat.name });
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryData({ code: '', name: '' });
  };

  const saveEditingCategory = async () => {
    if (!editingCategoryId) return;
    await handleUpdateCategory(editingCategoryId, editingCategoryData);
    setEditingCategoryId(null);
  };

  const startEditingIssue = (issue: Issue) => {
    setEditingIssueId(issue.id);
    setEditingIssueData({
      label: issue.label,
      durationMinutes: issue.durationMinutes,
      partCategoryId: issue.partCategory?.id ? String(issue.partCategory.id) : '',
    });
  };

  const cancelEditingIssue = () => {
    setEditingIssueId(null);
    setEditingIssueData({ label: '', durationMinutes: 30, partCategoryId: '' });
  };

  const saveEditingIssue = async (originalIssue: Issue) => {
    if (!editingIssueId) return;
    await handleUpdateIssue(originalIssue, {
      label: editingIssueData.label,
      durationMinutes: Number(editingIssueData.durationMinutes),
      partCategoryId: editingIssueData.partCategoryId ? Number(editingIssueData.partCategoryId) : undefined,
    });
    setEditingIssueId(null);
  };

  if (user?.role !== 'ADMIN') {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans pb-24">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Configuración del Taller
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Gestiona los horarios de atención, excepciones y catálogos del sistema.
            </p>
        </div>
      </div>

      {(error || message) && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 shadow-sm border ${
             error 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50' 
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
        }`}>
            <span className="material-symbols-outlined text-[24px]">{error ? 'error' : 'check_circle'}</span>
            <p className="font-medium text-sm md:text-base">{error ?? message}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-32"><Loading /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Column: Scheduler */}
          <div className="xl:col-span-2 space-y-8">
            <section className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px]">calendar_month</span>
                        Jornada Laboral
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Configura las franjas horarias por día.</p>
                    </div>
                    <button
                        onClick={handleSaveSchedule}
                        disabled={savingSchedule}
                        className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                    >
                        {savingSchedule ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-4">
                {weekdayLabels.map((label, weekday) => {
                    const segments = workdays.filter((w) => w.weekday === weekday);
                    const isActiveDay = segments.some((s) => s.isActive);
                    
                    return (
                    <div key={label} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isActiveDay 
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30' 
                            : 'border-gray-100 dark:border-gray-800 grayscale opacity-80'
                    }`}>
                        <div className="px-6 py-4 flex items-center justify-between bg-white/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                                    ${isActiveDay ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}
                                `}>
                                    {label.substring(0, 1)}
                                </div>
                                <span className={`text-lg font-bold ${isActiveDay ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{label}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={isActiveDay}
                                    onChange={(e) => segments.forEach((_, idx) => updateSegment(weekday, idx, 'isActive', e.target.checked))}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        {isActiveDay && (
                            <div className="p-4 sm:p-6 grid gap-4">
                                {segments.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 text-sm">Sin turnos asignados</div>
                                ) : (
                                    segments.map((seg, idx) => (
                                        <div key={`${label}-${idx}`} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-white dark:bg-[#15202b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="sm:col-span-1 flex items-center justify-center h-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    T{idx + 1}
                                                </span>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Inicio</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={seg.startTime}
                                                        onChange={(e) => updateSegment(weekday, idx, 'startTime', e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    />
                                                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">schedule</span>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Fin</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={seg.endTime}
                                                        onChange={(e) => updateSegment(weekday, idx, 'endTime', e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    />
                                                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">schedule</span>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Cupos</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={seg.maxBookings}
                                                        onChange={(e) => updateSegment(weekday, idx, 'maxBookings', Number(e.target.value))}
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-sans text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    />
                                                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">group</span>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2 flex justify-end">
                                                {segments.length > 1 && (
                                                    <button
                                                        onClick={() => removeSegment(weekday, idx)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                        title="Eliminar turno"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <button
                                    onClick={() => addSegment(weekday)}
                                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-500 hover:text-primary dark:text-gray-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Agregar Turno Extra
                                </button>
                            </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </section>

             <section className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-orange-500 text-[28px]">event_busy</span>
                    Excepciones y Feriados
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 dark:bg-gray-800/20 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-4">Nueva Excepción</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Fecha</label>
                                <input
                                    type="date"
                                    value={newOverride.date}
                                    onChange={(e) => setNewOverride((prev) => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Cupos Habilitados (0 = Cerrado)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={newOverride.maxBookings}
                                    onChange={(e) => setNewOverride((prev) => ({ ...prev, maxBookings: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors"
                                    placeholder="0 para cerrar el día"
                                />
                            </div>
                            <button
                                onClick={addOverride}
                                className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity"
                            >
                                Agregar Excepción
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-1">Días Configurados</h3>
                        {overrides.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No hay excepciones registradas.</p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {overrides.map((o) => (
                                    <div key={o.date} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                                o.maxBookings === 0 
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                            }`}>
                                                {o.date.split('-')[2]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{o.date}</p>
                                                <p className={`text-xs ${o.maxBookings === 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                    {o.maxBookings === 0 ? 'CERRADO (Feriado)' : `${o.maxBookings} cupos hab.`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeOverride(o.date)}
                                            className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             </section>
          </div>

          {/* Right Column: Catalogs */}
          <div className="space-y-8">
            
            {/* Brands Widget */}
            <section className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-purple-500">directions_car</span>
                    Marcas
                </h2>
                
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newBrand.name}
                        onChange={(e) => setNewBrand({ name: e.target.value })}
                        placeholder="Nueva marca..."
                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary text-sm"
                    />
                    <button onClick={handleCreateBrand} className="px-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map((brand) => (
                        <div key={brand.id} className="group flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:border-purple-300 dark:hover:border-purple-700">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{brand.name}</span>
                            <button
                                onClick={() => handleDeleteBrand(brand.id)}
                                className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

             {/* Categories Widget */}
             <section className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-green-500">category</span>
                    Categorías de Piezas
                </h2>
                
                 <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <input
                        type="text"
                        value={newCategory.code}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, code: e.target.value }))}
                        placeholder="Cód (Ej. MOTOR)"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border-none text-sm outline-none"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre Categoría"
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border-none text-sm outline-none"
                        />
                        <button onClick={handleCreateCategory} className="w-10 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {partCategories.map((cat) => (
                        <div key={cat.id} className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all group">
                            {editingCategoryId === cat.id ? (
                                <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                    <div className="flex gap-2">
                                        <input
                                            value={editingCategoryData.code}
                                            onChange={(e) => setEditingCategoryData({...editingCategoryData, code: e.target.value})}
                                            className="w-1/3 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Cód"
                                        />
                                        <input
                                            value={editingCategoryData.name}
                                            onChange={(e) => setEditingCategoryData({...editingCategoryData, name: e.target.value})}
                                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Nombre"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                         <button onClick={cancelEditingCategory} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                                         <button onClick={saveEditingCategory} className="px-2 py-1 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">{cat.code}</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => startEditingCategory(cat)}
                                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

             {/* Issues Widget */}
             <section className="bg-white dark:bg-[#1a2632] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-pink-500">build_circle</span>
                    Fallas Comunes
                </h2>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl mb-4 border border-pink-100 dark:border-pink-900/20">
                     <p className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase mb-2">Agregar Falla</p>
                     <div className="space-y-2">
                        <input
                            type="text"
                            value={newIssue.label}
                            onChange={(e) => setNewIssue((prev) => ({ ...prev, label: e.target.value }))}
                            placeholder="Descripción..."
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border-none text-sm outline-none"
                        />
                        <div className="flex gap-2">
                            <div className="w-24 relative">
                                <input
                                    type="number"
                                    min={5}
                                    value={newIssue.durationMinutes}
                                    onChange={(e) => setNewIssue((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border-none text-sm outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">MIN</span>
                            </div>
                             <select
                                value={newIssue.partCategoryId}
                                onChange={(e) => setNewIssue((prev) => ({ ...prev, partCategoryId: e.target.value }))}
                                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border-none text-sm outline-none"
                            >
                                <option value="">General</option>
                                {partCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleCreateIssue} className="w-full py-2 rounded-lg bg-pink-500 text-white font-bold text-sm shadow-md shadow-pink-500/20 hover:bg-pink-600">
                            Agregar
                        </button>
                     </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {issues.map(issue => (
                        <div key={issue.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 group hover:border-pink-200 dark:hover:border-pink-900 transition-all">
                            {editingIssueId === issue.id ? (
                                <div className="space-y-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                    <input
                                        value={editingIssueData.label}
                                        onChange={(e) => setEditingIssueData({...editingIssueData, label: e.target.value})}
                                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Descripción"
                                    />
                                    <div className="flex gap-2">
                                        <div className="w-20 relative">
                                            <input
                                                type="number"
                                                value={editingIssueData.durationMinutes}
                                                onChange={(e) => setEditingIssueData({...editingIssueData, durationMinutes: Number(e.target.value)})}
                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">m</span>
                                        </div>
                                        <select
                                            value={editingIssueData.partCategoryId}
                                            onChange={(e) => setEditingIssueData({...editingIssueData, partCategoryId: e.target.value})}
                                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">General</option>
                                            {partCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={cancelEditingIssue} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                                        <button onClick={() => saveEditingIssue(issue)} className="px-2 py-1 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{issue.label}</span>
                                        <span className="text-xs font-mono bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                                            {issue.durationMinutes}m
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            issue.partCategory 
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                            {issue.partCategory?.name || 'General'}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditingIssue(issue)}
                                                className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteIssue(issue.id)}
                                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
             </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
