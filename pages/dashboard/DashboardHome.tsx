import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BookingItem, BookingSummary, BookingStatus } from '../../types/booking';
import type { AssetType } from '../../types/enums';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const vehiclesInShop = summary?.byStatus[BookingStatus.IN_PROGRESS] ?? 0;
  const pendingBudgets = summary?.byStatus[BookingStatus.PENDING] ?? 0;
  const greeting = user?.fullName ? user.fullName.split(' ')[0] : 'cliente';

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
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="material-symbols-outlined text-primary">car_repair</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <p className="text-[#617989] dark:text-gray-400 text-sm font-medium">Vehículos en Taller</p>
            <p className="text-[#111518] dark:text-white text-3xl font-bold mt-1">{vehiclesInShop}</p>
          </div>

          <div className="flex-1 bg-white dark:bg-surface-dark p-6 rounded-xl border border-[#dbe1e6] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500">pending_actions</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>
            </div>
            <p className="text-[#617989] dark:text-gray-400 text-sm font-medium">Presupuestos Pendientes</p>
            <p className="text-[#111518] dark:text-white text-3xl font-bold mt-1">{pendingBudgets}</p>
          </div>
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
                    ? `${new Date(summary.upcoming.scheduledAt).toLocaleString()} - ${summary.upcoming.assetType === AssetType.VEHICLE ? 'Vehículo' : 'Repuesto'}`
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[#111518] dark:text-white text-xl font-bold">Reparación en Curso</h2>
          {activeBooking ? (
            <a className="text-primary text-sm font-medium hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/repair/${activeBooking.id}`)}>Ver todo</a>
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
                  <span className="material-symbols-outlined text-3xl">{activeBooking.assetType === AssetType.VEHICLE ? 'directions_car' : 'build'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111518] dark:text-white">Turno #{activeBooking.code.slice(0, 8)}</h3>
                  <p className="text-[#617989] dark:text-gray-400 text-sm">{new Date(activeBooking.scheduledAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wide">{activeBooking.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-[#617989] dark:text-gray-400">
            {error ? error : 'No tienes reparaciones activas.'}
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#111518] dark:text-white text-xl font-bold">Mis Vehículos</h2>
            <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"><span className="material-symbols-outlined">add</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Vehicles */}
               {[
                 {name: 'Ford Cargo 1722', plate: 'AA-123-BC', icon: 'local_shipping', status: null},
                 {name: 'John Deere 6155M', plate: null, icon: 'agriculture', status: 'En Taller'},
                 {name: 'Toyota Hilux', plate: 'AC-987-ZZ', icon: 'directions_car', status: null}
               ].map((v, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-[#dbe1e6] dark:border-gray-800 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#111518] dark:text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">{v.icon}</span>
                     </div>
                <div className="flex-1">
                  <p className="text-[#111518] dark:text-white font-bold text-sm">{v.name}</p>
                  {v.plate ? <p className="text-[#617989] dark:text-gray-400 text-xs">Patente: {v.plate}</p> : null}
                  {v.status ? <p className="text-[#617989] dark:text-gray-400 text-xs text-orange-500 font-medium">● {v.status}</p> : null}
                     </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">chevron_right</span>
                  </div>
               ))}
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-dashed border-[#dbe1e6] dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500 hover:text-primary h-full min-h-[80px]">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-medium text-sm">Registrar Vehículo</span>
                </div>
            </div>
         </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[#111518] dark:text-white text-xl font-bold">Actividad Reciente</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-[#dbe1e6] dark:divide-gray-800">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/repair/${b.id}`)}>
                 <div className="bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg p-2 h-fit"><span className="material-symbols-outlined text-lg">event</span></div>
                 <div>
                  <p className="text-sm font-bold text-[#111518] dark:text-white">Turno {b.code.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(b.scheduledAt).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Estado: {b.status}</p>
                 </div>
                </div>
              ))}
               </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-[#dbe1e6] dark:border-gray-800 text-center">
              <a className="text-xs font-medium text-primary hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard/history')}>Ver historial completo</a>
               </div>
            </div>
         </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

export default DashboardHome;