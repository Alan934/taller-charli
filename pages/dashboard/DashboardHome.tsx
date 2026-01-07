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
    const isAdmin = user?.role === 'ADMIN';
    const listPromise = isAdmin ? bookingApi.listAll(token) : bookingApi.listMine(token);
    
    Promise.all([bookingApi.summary(token), listPromise])
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
    <div className="max-w-[1280px] mx-auto px-4 py-8 animate-fade-in font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Hola, <span className="text-primary">{greeting}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            {isAdmin ? 'Panel de control administrativo' : 'Bienvenido a tu taller de confianza'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/book/step1')}
          className="group flex items-center gap-3 bg-primary hover:bg-primary-dark text-white text-base py-3 px-6 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
          <span>Nuevo Turno</span>
        </button>
      </div>

      {loading && !bookings.length ? (
         <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Column (Left/Center) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { label: 'En Taller', value: vehiclesInShop, icon: 'car_repair', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                 { label: 'Pendientes', value: pendingBudgets, icon: 'pending_actions', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                 { label: 'Completados', value: byStatus[BookingStatus.DONE] ?? 0, icon: 'check_circle', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white dark:bg-[#1a2632] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[28px]">{stat.icon}</span>
                      </div>
                      {i === 1 && pendingBudgets > 0 && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>}
                    </div>
                    <div>
                       <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                       <p className="text-4xl font-black text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Active Repair Card - Hero */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1a2632] dark:to-[#151f28] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               {/* Background Pattern */}
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">build_circle</span>
                       {activeBooking ? 'Reparación en Curso' : 'Sin Reparaciones Activas'}
                    </h2>
                    {activeBooking && (
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
                        {BOOKING_STATUS_LABELS[activeBooking.status]}
                      </span>
                    )}
                  </div>

                  {activeBooking ? (
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                       <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-inner flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[48px]">
                            {activeBooking.assetType === 'VEHICLE' ? 'directions_car' : 'settings'}
                          </span>
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {isAdmin 
                              ? (activeBooking.customer?.fullName || activeBooking.customer?.email || 'Cliente Desconocido')
                              : (activeBooking.assetType === 'VEHICLE' 
                                  ? `${activeBooking.vehicle?.brand?.name || activeBooking.vehicle?.brandOther || 'Vehículo'} ${activeBooking.vehicle?.model}` 
                                  : activeBooking.part?.description)
                            }
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                             <span className="material-symbols-outlined text-lg">calendar_month</span>
                             {new Date(activeBooking.scheduledAt).toLocaleString()}
                          </p>
                          <button 
                            onClick={() => navigate(`/dashboard/repair/${activeBooking.id}`)}
                            className="text-primary font-bold hover:text-primary-dark hover:underline flex items-center justify-center md:justify-start gap-1"
                          >
                            Ver detalles y seguimiento <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                       <p className="text-gray-500 mb-4">No tienes ningun vehículo o repuesto en proceso de reparación actualmente.</p>
                       <button onClick={() => navigate('/book/step1')} className="text-primary font-bold hover:underline">Iniciar un nuevo turno</button>
                    </div>
                  )}
               </div>
            </div>

            {/* Admin Dashboard Section */}
            {isAdmin && (
              <div className="bg-white dark:bg-[#1a2632] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                       <span className="material-symbols-outlined text-gray-400">admin_panel_settings</span>
                       Gestión Administrativa
                    </h3>
                    
                    {/* Admin Filters - Compact */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                       <input 
                          placeholder="Buscar..." 
                          className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 ring-primary/20 outline-none w-full md:w-48"
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                       />
                       <select 
                          className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 ring-primary/20 outline-none"
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value as any)}
                       >
                          <option value="ALL">Estados</option>
                          {Object.values(BookingStatus).map(s => <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>)}
                       </select>
                    </div>
                 </div>

                 {/* Modern Table */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                          <tr>
                             <th className="px-6 py-4">Fecha</th>
                             <th className="px-6 py-4">Cliente / Vehículo</th>
                             <th className="px-6 py-4">Estado</th>
                             <th className="px-6 py-4 text-right">Acción</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {filtered.slice(0, 10).map(b => (
                             <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="flex flex-col">
                                      <span className="font-bold text-gray-900 dark:text-white text-sm">{new Date(b.scheduledAt).toLocaleDateString()}</span>
                                      <span className="text-gray-400 text-xs">{new Date(b.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                         {b.assetType === 'VEHICLE' 
                                            ? `${b.vehicle?.brand?.name || b.vehicle?.brandOther || 'V.'} ${b.vehicle?.model}` 
                                            : b.part?.description}
                                      </span>
                                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                         {b.customer?.fullName || b.customer?.email}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <select 
                                      className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 border-none focus:ring-0 cursor-pointer hover:text-primary transition-colors"
                                      value={b.status}
                                      onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                                      onClick={(e) => e.stopPropagation()}
                                   >
                                      {Object.values(BookingStatus).map((s) => (
                                         <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                                      ))}
                                   </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button 
                                      onClick={() => navigate(`/dashboard/repair/${b.id}`)}
                                      className="text-gray-400 hover:text-primary transition-colors"
                                   >
                                      <span className="material-symbols-outlined">visibility</span>
                                   </button>
                                </td>
                             </tr>
                          ))}
                          {filtered.length === 0 && (
                             <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                   No se encontraron resultados para tu búsqueda.
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
                 {filtered.length > 10 && (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 text-center border-t border-gray-100 dark:border-gray-800">
                       <button onClick={() => navigate('/dashboard/history')} className="text-sm font-bold text-primary hover:underline">Ver historial completo</button>
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-6">
            
            {/* Action Required Widget */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border border-primary/10 relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-wider mb-2">
                     <span className="material-symbols-outlined text-lg animate-bounce">notifications_active</span>
                     Próximo Evento
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                     {summary?.upcoming ? 'Turno Agendado' : 'Todo despejado'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                     {summary?.upcoming 
                        ? `Tienes un turno para el ${new Date(summary.upcoming.scheduledAt).toLocaleDateString()}. Prepárate.` 
                        : 'No tienes turnos próximos. Es un buen momento para agendar uno nuevo.'}
                  </p>
                  
                  <button 
                     onClick={() => (summary?.upcoming ? navigate(`/dashboard/repair/${summary.upcoming.id}`) : navigate('/book/step1'))}
                     className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                  >
                     {summary?.upcoming ? 'Ver Detalle' : 'Agendar Ahora'}
                  </button>
               </div>
            </div>

            {/* Upcoming List */}
            <div className="bg-white dark:bg-[#1a2632] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                  Agenda Reciente
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{upcomingBookings.length}</span>
               </h3>
               
               <div className="space-y-3">
                  {upcomingBookings.length > 0 ? upcomingBookings.map((b) => (
                     <div 
                        key={b.id}
                        onClick={() => navigate(`/dashboard/repair/${b.id}`)} 
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                     >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                           <span className="text-primary">{new Date(b.scheduledAt).getDate()}</span>
                           <span className="uppercase text-[10px]">{new Date(b.scheduledAt).toLocaleString('es-ES', {month: 'short'})}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                              {b.assetType === 'VEHICLE' ? `${b.vehicle?.brand?.name || ''} ${b.vehicle?.model}` : b.part?.description}
                           </p>
                           <p className="text-xs text-gray-500 truncate">{b.customer?.fullName || 'Tú'}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${b.status === BookingStatus.CONFIRMED ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                     </div>
                  )) : (
                     <div className="text-center py-6 text-gray-400 text-sm italic">
                        Sin actividad reciente
                     </div>
                  )}
               </div>
               
               <button onClick={() => navigate('/dashboard/history')} className="w-full mt-4 py-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors border-t border-gray-100 dark:border-gray-800">
                  Ver todo el historial
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;