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
        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-2">
                     <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Historial de Servicio</h1>
                     <p className="text-gray-500 dark:text-gray-400 font-medium">Gestión integral de turnos y reparaciones</p>
                </div>
                <button
                    onClick={() => navigate('/book/step1')}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all text-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Nuevo Turno
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-gray-100 dark:border-gray-800 group">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                         <span className="material-symbols-outlined text-[80px]">list_alt</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Registros</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{filtered.length}</p>
                </div>
                
                 <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-gray-100 dark:border-gray-800 group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 text-blue-500">
                         <span className="material-symbols-outlined text-[80px]">pending_actions</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">En Proceso / Pendientes</p>
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                        {(totals[BookingStatus.PENDING] ?? 0) + (totals[BookingStatus.IN_PROGRESS] ?? 0) + (totals[BookingStatus.CONFIRMED] ?? 0)}
                    </p>
                </div>

                 <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-gray-100 dark:border-gray-800 group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 text-green-500">
                         <span className="material-symbols-outlined text-[80px]">check_circle</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Completados</p>
                    <p className="text-4xl font-black text-green-600 dark:text-green-400">{totals[BookingStatus.DONE] ?? 0}</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-6">
                 <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Filtros de búsqueda</span>
                 </div>
                 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Buscar cliente, código..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | BookingStatus)}
                        >
                            <option value="ALL">Todos los estados</option>
                            {Object.values(BookingStatus).map((s) => (
                                <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                        </span>
                    </div>

                    <div className="relative">
                        <select
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            value={assetFilter}
                            onChange={(e) => setAssetFilter(e.target.value as 'ALL' | AssetType)}
                        >
                            <option value="ALL">Todos los tipos</option>
                            <option value="VEHICLE">Vehículo</option>
                            <option value="PART">Repuesto</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                             <span className="material-symbols-outlined text-[20px]">expand_more</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            title="Desde"
                        />
                        <input
                            type="date"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            title="Hasta"
                        />
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {loading 
                            ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></span> Cargando registros...</span> 
                            : `${filtered.length} Registros encontrados`
                        }
                    </p>
                    {error && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {error}
                        </span>
                    )}
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha / Hora</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo / Código</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Detalle</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="p-4 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filtered.length > 0 ? (
                                filtered.map((row) => (
                                    <tr key={row.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/repair/${row.id}`)}>
                                        <td className="p-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {new Date(row.scheduledAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {row.timeType && row.timeType !== 'SPECIFIC'
                                                        ? (row.timeType === 'MORNING' ? 'Mañana (8-12hs)' : 'Tarde (14-18hs)')
                                                        : new Date(row.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-[16px] ${row.assetType === 'VEHICULO' ? 'text-blue-500' : 'text-orange-500'}`}>
                                                        {row.assetType === 'VEHICULO' ? 'directions_car' : 'settings'}
                                                    </span>
                                                    <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                                        {row.assetType === 'VEHICULO' ? 'Vehículo' : 'Repuesto'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-mono mt-1">#{row.code.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                             <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                                    {row.assetType === 'VEHICULO' 
                                                        ? `${row.vehicle?.brand?.name ?? row.vehicle?.brandOther ?? ''} ${row.vehicle?.model ?? ''}`.trim() || 'Vehículo sin datos'
                                                        : row.part?.name ?? 'Repuesto general'}
                                                </span>
                                                {user?.role === 'ADMIN' && row.customer && (
                                                     <span className="text-xs text-primary flex items-center gap-1 mt-0.5">
                                                        <span className="material-symbols-outlined text-[12px]">person</span>
                                                        {row.customer.fullName}
                                                     </span>
                                                )}
                                             </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize border ${
                                                row.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' :
                                                row.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50' :
                                                row.status === 'CANCELED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50' :
                                                'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                     row.status === 'DONE' ? 'bg-green-500' :
                                                     row.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                                                     row.status === 'CANCELED' ? 'bg-red-500' :
                                                     'bg-gray-500'
                                                }`}></span>
                                                {BOOKING_STATUS_LABELS[row.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/repair/${row.id}`);
                                                }}
                                                title="Ver detalle completo"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                            <span className="material-symbols-outlined text-[48px] opacity-20">search_off</span>
                                            <p className="text-sm">No se encontraron turnos que coincidan con la búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;