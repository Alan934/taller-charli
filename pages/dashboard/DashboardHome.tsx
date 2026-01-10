import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingSummary, BookingStatus } from '../../types/booking';
import Loading from '../../components/Loading';

const DashboardHome: React.FC = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [summary, setSummary] = useState<BookingSummary | null>(null);
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial Load
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

    // Derived Metrics
    const activeBooking = useMemo(() => {
        // Prioritize confirmed or in-progress bookings to show in the "Hero" card
        return bookings.find((b) => b.status === BookingStatus.IN_PROGRESS) 
            || bookings.find((b) => b.status === BookingStatus.CONFIRMED);
    }, [bookings]);

    const vehiclesInShop = summary?.byStatus[BookingStatus.IN_PROGRESS] ?? 0;
    // Assuming 'PENDING' corresponds to pending requests.
    const pendingRequests = summary?.byStatus[BookingStatus.PENDING] ?? 0; 
    
    // Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Helper to get first name
    const firstName = user?.fullName?.split(' ')[0] || 'Hola';

    // Recent activity list (just latest 5 items, regardless of status)
    const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    // Upcoming bookings separately (future pending/confirmed)
    const upcomingBookings = bookings
        .filter(b => (b.status === 'PENDING' || b.status === 'CONFIRMED') && new Date(b.scheduledAt).getTime() > Date.now())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 3);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loading /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 font-sans pb-24">
            
            {/* 1. Header & Welcome */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
                <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{firstName}</span>.
                    </h1>
                </div>
                
                <button 
                    onClick={() => navigate('/book/step1')}
                    className="flex shrink-0 items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-2xl font-bold shadow-xl shadow-gray-200 dark:shadow-none hover:-translate-y-1 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nuevo Turno
                </button>
            </header>

            {/* 2. Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Vehicles In Shop */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 group hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-default">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-3xl">car_repair</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">En Taller</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">{vehiclesInShop}</p>
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 group hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-default">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                        <span className="material-symbols-outlined text-3xl">pending_actions</span>
                        {pendingRequests > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632] animate-pulse"></span>}
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">{pendingRequests}</p>
                    </div>
                </div>

                {/* Total Stats / Link to History */}
                <div 
                    onClick={() => navigate('/dashboard/history')}
                    className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-center text-white relative overflow-hidden group cursor-pointer hover:shadow-primary/40 transition-all" 
                >
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="relative z-10 flex items-center justify-between h-full">
                         <div>
                            <p className="text-white/80 text-xs font-bold uppercase mb-1">Total Histórico</p>
                            <p className="text-4xl font-black tabular-nums">{summary?.totalCount || 0}</p>
                         </div>
                         <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-2xl group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* 3. Main Content: Active Status & Activity */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Hero Status Card */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm relative overflow-hidden">
                        {/* Decorative Background blob */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gray-50/50 dark:bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                                <span className={`flex w-2 h-2 rounded-full ${activeBooking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                {activeBooking ? 'Trabajo en Curso Actual' : 'Sin actividad activa'}
                            </h3>

                            {activeBooking ? (
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gray-50 dark:bg-black/20 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-inner">
                                        <span className="material-symbols-outlined text-5xl md:text-6xl text-gray-300 dark:text-gray-600">
                                            {activeBooking.assetType === 'VEHICLE' ? 'directions_car' : 'settings'}
                                        </span>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                            <h4 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                                {activeBooking.assetType === 'VEHICLE' 
                                                    ? `${activeBooking.vehicle?.brand?.name || ''} ${activeBooking.vehicle?.model}`.trim() || 'Vehículo desconocido'
                                                    : activeBooking.part?.description}
                                            </h4>
                                            <span className="self-start md:self-auto px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {BOOKING_STATUS_LABELS[activeBooking.status]}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">person</span>
                                            {activeBooking.customer?.fullName || 'Cliente'} 
                                            <span className="text-gray-300 mx-2">|</span> 
                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                            {new Date(activeBooking.createdAt).toLocaleDateString()}
                                        </p>
                                        
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => navigate(`/dashboard/repair/${activeBooking.id}`)}
                                                className="flex-1 md:flex-none px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                            >
                                                Ver Detalles Completos
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-gray-400 text-2xl">check</span>
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">Todo al día</p>
                                    <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">No hay reparaciones en curso. Es un buen momento para revisar el historial o iniciar un nuevo trabajo.</p>
                                    <button onClick={() => navigate('/book/step1')} className="text-primary font-bold hover:underline text-sm">Iniciar nuevo turno</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Actividad Reciente</h3>
                             <button onClick={() => navigate('/dashboard/history')} className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Ver todo</button>
                        </div>
                        
                        <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 shadow-sm">
                            {recentBookings.length > 0 ? recentBookings.map((booking, index) => (
                                <div 
                                    key={booking.id}
                                    onClick={() => navigate(`/dashboard/repair/${booking.id}`)}
                                    className={`p-4 rounded-3xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group ${
                                        index !== recentBookings.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                        booking.status === 'DONE' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                                        booking.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                        booking.status === 'CANCELED' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                        'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {booking.assetType === 'VEHICLE' ? 'directions_car' : 'settings'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                                {booking.vehicle ? `${booking.vehicle.brand?.name ?? ''} ${booking.vehicle.model}` : booking.part?.description}
                                            </h4>
                                            <span className="text-[10px] font-medium text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                                 booking.status === 'DONE' ? 'bg-green-500' :
                                                 booking.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                 booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'
                                             }`}></span>
                                             <p className="text-xs text-gray-500 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                                {booking.customer?.fullName || 'Cliente'} 
                                             </p>
                                        </div>
                                    </div>
                                    
                                    <span className="material-symbols-outlined text-gray-300 text-[20px] group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                                </div>
                            )) : (
                                <div className="p-10 text-center">
                                    <p className="text-gray-400 text-sm">No hay actividad reciente registrada.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* 4. Sidebar */}
                <div className="space-y-6">
                    {/* Calendar Widget / Upcoming */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none h-fit sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary">event_upcoming</span>
                                  Próximos Turnos
                             </h3>
                        </div>
                        
                        <div className="space-y-4">
                            {upcomingBookings.length > 0 ? upcomingBookings.map(b => (
                                    <div 
                                        key={b.id} 
                                        onClick={() => navigate(`/dashboard/repair/${b.id}`)}
                                        className="flex gap-4 items-center group cursor-pointer p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="w-14 items-center flex flex-col justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl py-2 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="block text-[10px] font-bold uppercase opacity-60 m-0 leading-none mb-1">
                                                {new Date(b.scheduledAt).toLocaleString('es-ES', { month: 'short' })}
                                            </span>
                                            <span className="block text-xl font-black m-0 leading-none">
                                                {new Date(b.scheduledAt).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                {b.vehicle ? b.vehicle.model : b.part?.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(b.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs
                                                <span className="mx-1">•</span> 
                                                {b.customer?.fullName?.split(' ')[0]}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-400 italic mb-2">Agenda libre</p>
                                        <p className="text-xs text-gray-500">No hay turnos próximos agendados.</p>
                                    </div>
                                )
                            }
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard/calendar')}
                            className="w-full mt-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Ver Calendario Completo
                        </button>
                    </div>

                    {/* Quick Documentation Tip */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-6 border border-primary/10">
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-primary mb-3 shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Tip Rápido</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Mantén actualizado el estado de las reparaciones para que tus clientes reciban notificaciones automáticas y evites llamadas innecesarias.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;
