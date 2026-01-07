import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus } from '../../types/booking';
import type { AssetType } from '../../types/enums';

const History: React.FC = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
    const [assetFilter, setAssetFilter] = useState<'ALL' | AssetType>('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        (user?.role === 'ADMIN' ? bookingApi.listAll(token) : bookingApi.listMine(token))
            .then(setBookings)
            .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar historial'))
            .finally(() => setLoading(false));
    }, [token, user?.role]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return bookings.filter((b) => {
            const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
            const matchesAsset = assetFilter === 'ALL' ? true : b.assetType === assetFilter;
            const scheduledDate = new Date(b.scheduledAt);
            const matchesFrom = dateFrom ? scheduledDate >= new Date(dateFrom) : true;
            const matchesTo = dateTo ? scheduledDate <= new Date(dateTo) : true;
            const matchesQuery = !q
                ? true
                : [b.code, b.customer?.email, b.customer?.fullName, b.assetType, b.vehicle?.brand?.name, b.vehicle?.model, b.part?.description]
                    .filter(Boolean)
                    .some((field) => field!.toString().toLowerCase().includes(q));
            return matchesStatus && matchesAsset && matchesFrom && matchesTo && matchesQuery;
        });
    }, [assetFilter, bookings, dateFrom, dateTo, query, statusFilter]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, b) => {
                acc[b.status] = (acc[b.status] ?? 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [filtered]);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-wrap justify-between gap-3 pt-4">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#111518] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Historial de Servicio</h1>
                    <p className="text-[#617989] dark:text-gray-400 text-base font-normal leading-normal">Turnos y reparaciones registrados.</p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/book/step1')}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Nuevo Turno
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total filtrado', value: filtered.length },
                    { label: 'Pendientes', value: totals[BookingStatus.PENDING] ?? 0 },
                    { label: 'Completados', value: totals[BookingStatus.DONE] ?? 0 },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2632] border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm">
                        <p className="text-[#617989] dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-[#111518] dark:text-white text-3xl font-bold leading-tight tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1A2632] rounded-xl border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm p-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Buscar</span>
                        <input
                            className="rounded-lg border border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                            placeholder="Cliente, código, vehículo o pieza"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Estado</span>
                        <select
                            className="rounded-lg border border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                        <span className="text-xs font-semibold text-[#617989] dark:text-gray-400 uppercase">Tipo</span>
                        <select
                            className="rounded-lg border border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                            <span className="text-[11px] font-semibold text-[#617989] dark:text-gray-400 uppercase">Desde</span>
                            <input
                                type="date"
                                className="rounded-lg border border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-[#617989] dark:text-gray-400 uppercase">Hasta</span>
                            <input
                                type="date"
                                className="rounded-lg border border-[#dbe1e6] dark:border-[#2A3B4C] bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A2632] rounded-xl border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#dbe1e6] dark:border-[#2A3B4C] flex items-center justify-between">
                    <p className="text-sm text-[#617989] dark:text-gray-400">{loading ? 'Cargando...' : `${filtered.length} resultados`}</p>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#202E3C] border-b border-[#dbe1e6] dark:border-[#2A3B4C]">
                                {['Fecha', 'Tipo', 'Código', 'Estado', 'Acciones'].map((h, i) => (
                                    <th key={i} className="p-4 text-xs font-bold text-[#617989] dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe1e6] dark:divide-[#2A3B4C]">
                            {filtered.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#202E3C] transition-colors">
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200 font-medium whitespace-nowrap">
                                      {row.timeType && row.timeType !== 'SPECIFIC'
                                        ? `${new Date(row.scheduledAt).toLocaleDateString()} (${row.timeType === 'MORNING' ? 'Mañana' : 'Tarde'})`
                                        : new Date(row.scheduledAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">{row.assetType}</td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">{row.code.slice(0, 8)}</td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1 text-xs font-semibold">
                                            {BOOKING_STATUS_LABELS[row.status]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">
                                        <button
                                            className="text-primary hover:underline text-sm"
                                            onClick={() => navigate(`/dashboard/repair/${row.id}`)}
                                        >
                                            Ver detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;