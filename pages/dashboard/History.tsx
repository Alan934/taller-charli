import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus } from '../../types/booking';
import type { AssetType } from '../../types/enums';
import Loading from '../../components/Loading';

// Helper for date classification
const getRelativeLabel = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1 && diffDays < 7) return 'Esta semana';
    if (diffDays > -7 && diffDays < -1) return 'Semana pasada';
    
    return target.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

const History: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuth();
    
    // Data state
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
    const [assetFilter, setAssetFilter] = useState<'ALL' | AssetType>('ALL');

    // Display limit state (Map to store expanded state for each group)
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Load Data
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const apiCall = user?.role === 'ADMIN' ? bookingApi.listAll(token) : bookingApi.listMine(token);
        
        apiCall
            .then((data) => {
                // Sort by date (newest first)
                const sorted = data.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
                setBookings(sorted);

                // Handle navigation from notifications
                const state = location.state as { highlightId?: number } | null;
                if (state?.highlightId) {
                    const found = sorted.find(b => b.id === state.highlightId);
                    if (found) setQuery(found.code);
                }
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar el historial'))
            .finally(() => setLoading(false));
    }, [token, user?.role, location.state]);

    // Derived state
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return bookings.filter((b) => {
            const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
            const matchesAsset = assetFilter === 'ALL' ? true : b.assetType === assetFilter;
            
            // Format date for search (e.g., "10 de enero de 2026")
            const dateStr = new Date(b.scheduledAt).toLocaleDateString('es-AR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });

            const matchesQuery = !q
                ? true
                : [
                    b.code, 
                    b.customer?.fullName, 
                    b.vehicle?.brand?.name, 
                    b.vehicle?.model,
                    dateStr
                  ]
                    .filter(Boolean)
                    .some((f) => f!.toString().toLowerCase().includes(q));
            return matchesStatus && matchesAsset && matchesQuery;
        });
    }, [bookings, query, statusFilter, assetFilter]);

    // Grouping for the modern list view
    const groupedBookings = useMemo(() => {
        const groups: Record<string, BookingItem[]> = {};
        filtered.forEach(item => {
            const date = new Date(item.scheduledAt);
            const label = getRelativeLabel(date);
            if (!groups[label]) groups[label] = [];
            groups[label].push(item);
        });
        // We want to maintain the order of keys based on the first item in the group
        return Object.entries(groups).sort((a, b) => {
             // Find sort comparison based on the first element of each group
             const dateA = new Date(a[1][0].scheduledAt).getTime();
             const dateB = new Date(b[1][0].scheduledAt).getTime();
             return dateB - dateA; 
        });
    }, [filtered]);

    const toggleGroup = (groupLabel: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-sans pb-24">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Historial</h1>
                     <p className="text-gray-500 dark:text-gray-400 font-medium">Gestiona turnos, reparaciones y servicios.</p>
                </div>
                <button
                    onClick={() => navigate('/book/step1')}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Turno
                </button>
            </div>

            {/* Modern Search & Filter Bar */}
            <div className="bg-white dark:bg-[#1a2632] p-2 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 select-none pointer-events-none text-[22px]">search</span>
                    <input
                        className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 focus:bg-white dark:focus:bg-[#1a2632] focus:ring-2 focus:ring-primary/10 text-sm font-medium outline-none placeholder:text-gray-400 text-gray-900 dark:text-white transition-all"
                        placeholder="Buscar por código, cliente, vehículo o mes (ej: enero)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 px-2 md:px-0 custom-scrollbar">
                    {/* Status Tabs */}
                    <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                        {(['ALL', 'PENDING', 'IN_PROGRESS', 'DONE', 'CANCELED'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {status === 'ALL' ? 'Todos' : BOOKING_STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Asset Type Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {(['ALL', 'VEHICLE', 'PART'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setAssetFilter(type as any)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${
                            assetFilter === type
                                ? 'bg-primary/10 border-primary/20 text-primary'
                                : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                         {type === 'ALL' && <span className="material-symbols-outlined text-[16px]">apps</span>}
                         {type === 'VEHICLE' && <span className="material-symbols-outlined text-[16px]">directions_car</span>}
                         {type === 'PART' && <span className="material-symbols-outlined text-[16px]">settings</span>}
                         {type === 'ALL' ? 'Todo' : type === 'VEHICLE' ? 'Vehículos' : 'Repuestos'}
                    </button>
                ))}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 flex justify-center"><Loading /></div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-6 rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedBookings.length > 0 ? (
                        groupedBookings.map(([groupLabel, allItems]) => {
                            // Logic to limit items
                            const isExpanded = expandedGroups[groupLabel];
                            const limit = 5;
                            const items = isExpanded ? allItems : allItems.slice(0, limit);
                            const hasMore = allItems.length > limit;

                            return (
                                <div key={groupLabel}>
                                    <div className="flex items-center justify-between mb-4 pl-2 sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm py-2 z-10 rounded-r-lg px-4">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            {groupLabel} <span className="text-gray-300 dark:text-gray-600 ml-1">({allItems.length})</span>
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => navigate(`/dashboard/repair/${item.id}`)}
                                                className="group relative bg-white dark:bg-[#1a2632] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                    
                                                    {/* Status Indicator Stripe */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                                        item.status === 'DONE' ? 'bg-green-500' :
                                                        item.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                        item.status === 'CANCELED' ? 'bg-red-500' :
                                                        'bg-gray-400'
                                                    }`}/>

                                                    {/* Date & Time Box */}
                                                    <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0 px-2 min-w-[80px] shrink-0">
                                                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                            {new Date(item.scheduledAt).getDate()}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                                            {new Date(item.scheduledAt).toLocaleDateString('es-AR', { month: 'short' })}
                                                        </span>
                                                        <span className="md:mt-2 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                            {item.timeType === 'SPECIFIC' 
                                                                ? new Date(item.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                                                                : (item.timeType === 'MORNING' ? 'AM' : 'PM')
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Main Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                                item.assetType === 'VEHICULO' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                                            }`}>
                                                                {item.assetType === 'VEHICULO' ? 'Vehículo' : 'Pieza'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">#{item.code}</span>
                                                        </div>
                                                        
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                            {item.assetType === 'VEHICULO' 
                                                                ? `${item.vehicle?.brand?.name ?? ''} ${item.vehicle?.model}`.trim() || 'Vehículo s/d'
                                                                : item.part?.description ?? 'Repuesto s/d'
                                                            }
                                                        </h4>
                                                        
                                                        {user?.role === 'ADMIN' && item.customer && (
                                                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                                                <span className="material-symbols-outlined text-[14px]">person</span>
                                                                {item.customer.fullName || 'Cliente sin nombre'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status Badge & Action */}
                                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-800">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                             item.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                             item.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                             item.status === 'CANCELED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                                             'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                            {BOOKING_STATUS_LABELS[item.status]}
                                                        </span>
                                                        
                                                        <span className="flex items-center gap-1 text-primary text-sm font-bold group-hover:underline">
                                                            Ver detalle
                                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* "Ver más" Button */}
                                        {hasMore && (
                                            <button
                                                onClick={() => toggleGroup(groupLabel)}
                                                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <span className="material-symbols-outlined">expand_less</span>
                                                        Ver menos
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined">expand_more</span>
                                                        Ver {allItems.length - limit} más
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl text-gray-400">event_busy</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sin historial</h3>
                            <p className="max-w-xs mx-auto mt-2 text-sm text-gray-500">
                                No hay registros que coincidan con los filtros seleccionados.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default History;
