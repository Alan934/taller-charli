import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingSummary, BookingStatus } from '../../types/booking';
import type { AssetType } from '../../types/enums';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [assetFilter, setAssetFilter] = useState<'ALL' | AssetType>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([bookingApi.summary(token), user?.role === 'ADMIN' ? bookingApi.listAll(token) : bookingApi.listMine(token)])
      .then(([s, list]) => {
        setSummary(s);
        setBookings(list);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, [token, user?.role]);

  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.status !== BookingStatus.DONE && b.status !== BookingStatus.CANCELED);
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
      const matchesAsset = assetFilter === 'ALL' ? true : b.assetType === assetFilter;
      const scheduledDate = new Date(b.scheduledAt);
      const matchesDateFrom = dateFrom ? scheduledDate >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? scheduledDate <= new Date(dateTo) : true;

      const matchesQuery = !q
        ? true
        : [
            b.code,
            b.customer?.email,
            b.customer?.fullName,
            b.assetType,
            b.vehicle?.brand?.name,
            b.vehicle?.brandOther,
            b.vehicle?.model,
            b.vehicle?.vinOrPlate,
            b.part?.description,
            b.part?.category?.name,
            new Date(b.scheduledAt).toLocaleDateString(),
          ]
            .filter(Boolean)
            .some((field) => field!.toString().toLowerCase().includes(q));

      return matchesStatus && matchesAsset && matchesDateFrom && matchesDateTo && matchesQuery;
    });
  }, [assetFilter, bookings, dateFrom, dateTo, query, statusFilter]);

  const byStatus = useMemo(() => {
    return Object.values(BookingStatus).reduce<Record<BookingStatus, number>>((acc, s) => {
      acc[s] = bookings.filter((b) => b.status === s).length;
      return acc;
    }, {
      [BookingStatus.PENDING]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.IN_PROGRESS]: 0,
      [BookingStatus.DONE]: 0,
      [BookingStatus.CANCELED]: 0,
    });
  }, [bookings]);

  const vehiclesInShop = summary?.byStatus[BookingStatus.IN_PROGRESS] ?? 0;
  const pendingBudgets = summary?.byStatus[BookingStatus.PENDING] ?? 0;
  const greeting = user?.fullName ? user.fullName.split(' ')[0] : 'cliente';
  const isAdmin = user?.role === 'ADMIN';

  const upcomingBookings = useMemo(() => {
    const now = Date.now();
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const limit = now + fiveDaysMs;
    return [...bookings]
      .filter((b) => b.status === BookingStatus.PENDING)
      .filter((b) => {
        const ts = new Date(b.scheduledAt).getTime();
        return ts >= now && ts <= limit;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);
  }, [bookings]);

  const handleStatusChange = async (bookingId: number, status: BookingStatus) => {
    if (!token) return;
    setUpdatingId(bookingId);
    try {
      const updated = await bookingApi.updateStatus(bookingId, status, token);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4 animate-fade-in-up">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#111518] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Hola, {greeting}</h1>
          <p className="text-[#617989] dark:text-gray-400 text-base font-normal">Bienvenido a tu panel de control.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/book/step1')}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Nuevo Turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ label: 'En taller', value: vehiclesInShop, icon: 'car_repair', tone: 'blue' },
            { label: 'Pendientes', value: pendingBudgets, icon: 'pending_actions', tone: 'amber' },
            { label: 'Completados', value: byStatus[BookingStatus.DONE] ?? 0, icon: 'check_circle', tone: 'green' }]
            .map((card) => {
              const toneStyles: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'dark:bg-blue-900/20', darkText: 'dark:text-blue-400' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-600', darkBg: 'dark:bg-amber-900/20', darkText: 'dark:text-amber-400' },
                green: { bg: 'bg-green-50', text: 'text-green-600', darkBg: 'dark:bg-green-900/20', darkText: 'dark:text-green-400' },
              };
              const tone = toneStyles[card.tone];
              return (
                <div key={card.label} className="flex-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${tone.bg} ${tone.darkBg}`}>
                      <span className={`material-symbols-outlined ${tone.text} ${tone.darkText}`}>{card.icon}</span>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                  <p className="text-[#617989] dark:text-gray-400 text-sm font-medium">{card.label}</p>
                  <p className="text-[#111518] dark:text-white text-3xl font-bold mt-1">{card.value}</p>
                </div>
              );
            })}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="h-full flex flex-col justify-center gap-4 rounded-xl border border-l-4 border-[#dbe1e6] border-l-primary bg-white dark:bg-surface-dark dark:border-gray-800 dark:border-l-primary p-6 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                  <span className="material-symbols-outlined text-lg">notification_important</span>
                  Acción Requerida
                </div>
                <p className="text-[#111518] dark:text-white text-lg font-bold leading-tight mt-1">{summary?.upcoming ? 'Próximo turno' : 'Sin turnos próximos'}</p>
                <p className="text-[#617989] dark:text-gray-400 text-sm leading-relaxed">
                  {summary?.upcoming
                    ? `${new Date(summary.upcoming.scheduledAt).toLocaleString()} - ${summary.upcoming.assetType === 'VEHICLE' ? 'Vehículo' : 'Repuesto'}`
                    : 'Agenda un turno para verlo aquí.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => (summary?.upcoming ? navigate(`/dashboard/repair/${summary.upcoming.id}`) : navigate('/book/step1'))}
              className="mt-auto w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {summary?.upcoming ? 'Ver detalle' : 'Agendar turno'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Repairs Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#111518] dark:text-white text-xl font-bold">Reparación en curso</h2>
            {activeBooking ? (
              <button className="text-primary text-sm font-medium hover:underline" onClick={() => navigate(`/dashboard/repair/${activeBooking.id}`)}>Ver todo</button>
            ) : null}
          </div>

          {activeBooking ? (
            <div 
              onClick={() => navigate(`/dashboard/repair/${activeBooking.id}`)}
              className="bg-white dark:bg-surface-dark border border-[#dbe1e6] dark:border-gray-800 rounded-xl p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <span className="material-symbols-outlined text-3xl">{activeBooking.assetType === 'VEHICLE' ? 'directions_car' : 'build'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111518] dark:text-white">{activeBooking.customer?.fullName || activeBooking.customer?.email || 'Cliente'}</h3>
                    <p className="text-[#617989] dark:text-gray-400 text-sm">{new Date(activeBooking.scheduledAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wide">{BOOKING_STATUS_LABELS[activeBooking.status]}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-[#617989] dark:text-gray-400">
              {error ? error : 'No tienes reparaciones activas.'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[#111518] dark:text-white text-xl font-bold">Actividad Reciente</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-[#dbe1e6] dark:divide-gray-800">
              {bookings.slice(0, 4).map((b) => (
                <div key={b.id} className="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/repair/${b.id}`)}>
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg p-2 h-fit"><span className="material-symbols-outlined text-lg">event</span></div>
                  <div>
                    <p className="text-sm font-bold text-[#111518] dark:text-white">{b.customer?.fullName || b.customer?.email || 'Cliente'}</p>
                    <p className="text-xs text-gray-500">{new Date(b.scheduledAt).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Estado: {BOOKING_STATUS_LABELS[b.status]}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-[#dbe1e6] dark:border-gray-800 text-center">
              <button className="text-xs font-medium text-primary hover:text-blue-600" onClick={() => navigate('/dashboard/history')}>Ver historial completo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin agenda & bookings table */}
      {isAdmin && (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-wrap gap-3 items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-lg">event_available</span>
                Agenda de turnos
              </div>
              <h2 className="text-[#111518] dark:text-white text-xl font-bold">Gestión rápida para administradores</h2>
              <p className="text-sm text-[#617989] dark:text-gray-400">Busca por vehículo, pieza, cliente, fecha o código. Filtra por estado y tipo.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/book/step1')}
                className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-md shadow-blue-500/20"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Crear turno
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-[#617989] dark:text-gray-400 tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                Buscar
              </span>
              <input
                className="w-full rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                placeholder="Cliente, vehículo, pieza, código o fecha"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-[#617989] dark:text-gray-400 tracking-wide">Estado</span>
              <select
                className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | BookingStatus)}
              >
                <option value="ALL">Todos</option>
                {Object.values(BookingStatus).map((s) => (
                  <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-[#617989] dark:text-gray-400 tracking-wide">Tipo</span>
              <select
                className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value as 'ALL' | AssetType)}
              >
                <option value="ALL">Todos</option>
                <option value="VEHICLE">Vehículo</option>
                <option value="PART">Repuesto</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#617989] dark:text-gray-400">Desde</span>
                <input
                  type="date"
                  className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#617989] dark:text-gray-400">Hasta</span>
                <input
                  type="date"
                  className="rounded-lg border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[{ label: 'Pendientes', value: byStatus[BookingStatus.PENDING], tone: 'amber' },
              { label: 'En curso', value: byStatus[BookingStatus.IN_PROGRESS], tone: 'blue' },
              { label: 'Completados', value: byStatus[BookingStatus.DONE], tone: 'green' }].map((card) => {
              const toneStyles: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-200' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-200' },
                green: { bg: 'bg-green-50', text: 'text-green-700', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-200' },
              };
              const tone = toneStyles[card.tone];
              return (
                <div key={card.label} className={`p-4 rounded-lg border border-[#dbe1e6] dark:border-gray-800 flex items-center justify-between ${tone.bg} ${tone.darkBg}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${tone.text} ${tone.darkText}`}>{card.label}</p>
                    <p className="text-2xl font-black text-[#111518] dark:text-white">{card.value ?? 0}</p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-primary">monitoring</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <div className="overflow-x-auto rounded-lg border border-[#dbe1e6] dark:border-gray-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/70">
                      {['Fecha', 'Código', 'Cliente', 'Detalle', 'Estado', 'Duración', 'Acciones'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#617989] dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbe1e6] dark:divide-gray-800">
                    {filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-[#111518] dark:text-white whitespace-nowrap">
                          {b.timeType && b.timeType !== 'SPECIFIC'
                            ? `${new Date(b.scheduledAt).toLocaleDateString()} (${b.timeType === 'MORNING' ? 'Mañana' : 'Tarde'})`
                            : new Date(b.scheduledAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-[#111518] dark:text-white">{b.code.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">{b.customer?.fullName || b.customer?.email || 'Cliente'}</td>
                        <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">
                          {b.assetType === 'VEHICLE'
                            ? `${b.vehicle?.brand?.name || b.vehicle?.brandOther || 'Marca'} ${b.vehicle?.model || ''}`
                            : b.part?.description || 'Repuesto'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">
                          <div className="flex items-center gap-2">
                            <select
                              className="rounded-md border border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
                              value={b.status}
                              disabled={updatingId === b.id}
                              onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                            >
                              {Object.values(BookingStatus).map((s) => (
                                <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                            {updatingId === b.id && <span className="text-[11px] text-primary">Guardando…</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#111518] dark:text-white">{Math.round(b.durationMinutes)} min</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button className="text-primary hover:underline" onClick={() => navigate(`/dashboard/repair/${b.id}`)}>Ver</button>
                            <button className="text-[#617989] hover:underline" onClick={() => navigate(`/dashboard/repair/${b.id}#timeline`)}>Seguimiento</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-sm text-[#617989] dark:text-gray-400 text-center">{loading ? 'Cargando...' : 'Sin resultados con ese filtro.'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[#111518] dark:text-white font-bold">Próximos turnos</h3>
                <span className="text-xs text-[#617989] dark:text-gray-400">{upcomingBookings.length} en agenda</span>
              </div>
              <div className="flex flex-col gap-2">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/dashboard/repair/${b.id}`)}
                    className="border border-[#dbe1e6] dark:border-gray-800 rounded-lg p-3 hover:border-primary/40 cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/40"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#111518] dark:text-white">{new Date(b.scheduledAt).toLocaleString()}</span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary font-bold">{BOOKING_STATUS_LABELS[b.status]}</span>
                    </div>
                    <p className="text-xs text-[#617989] dark:text-gray-400 mt-1">{b.customer?.fullName || b.customer?.email || 'Cliente'} · {b.assetType === 'VEHICLE' ? 'Vehículo' : 'Repuesto'}</p>
                    <p className="text-xs text-[#111518] dark:text-white line-clamp-1">{b.assetType === 'VEHICLE' ? `${b.vehicle?.brand?.name || b.vehicle?.brandOther || ''} ${b.vehicle?.model || ''}` : b.part?.description}</p>
                  </div>
                ))}
                {!upcomingBookings.length && (
                  <div className="border border-dashed border-[#dbe1e6] dark:border-gray-800 rounded-lg p-4 text-sm text-[#617989] dark:text-gray-400">No hay turnos próximos.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-10"></div>
    </div>
  );
};

export default DashboardHome;