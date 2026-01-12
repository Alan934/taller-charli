import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus } from '../../types/booking';
import Loading from '../../components/Loading';

const STATUS_STYLES: Record<BookingStatus, { border: string; text: string; bg: string; dot: string; cardHover: string; labelBg: string }> = {
    PENDING: {
        border: 'border-l-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        dot: 'bg-amber-500',
        cardHover: 'hover:bg-amber-50 dark:hover:bg-amber-900/10',
        labelBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    CONFIRMED: {
        border: 'border-l-blue-500',
        text: 'text-blue-700 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        dot: 'bg-blue-500',
        cardHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
        labelBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    IN_PROGRESS: {
        border: 'border-l-indigo-500',
        text: 'text-indigo-700 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        dot: 'bg-indigo-500',
        cardHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10',
        labelBg: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    DONE: {
        border: 'border-l-green-500',
        text: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        dot: 'bg-green-500',
        cardHover: 'hover:bg-green-50 dark:hover:bg-green-900/10',
        labelBg: 'bg-green-100 dark:bg-green-900/30'
    },
    CANCELED: {
        border: 'border-l-red-500',
        text: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        dot: 'bg-red-500',
        cardHover: 'hover:bg-red-50 dark:hover:bg-red-900/10',
        labelBg: 'bg-red-100 dark:bg-red-900/30'
    },
};

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CalendarView: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Calendar State
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD local format trick

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const fetcher = isAdmin ? bookingApi.listAll : bookingApi.listMine;
        fetcher(token)
            .then(setBookings)
            .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar turnos'))
            .finally(() => setLoading(false));
    }, [isAdmin, token]);

    // Derived Data
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [month, year]);
    
    // Calculate start day of the month (0=Sunday, 1=Monday). We want Monday=0 for array index.
    const monthStartDay = useMemo(() => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert Sunday(0) to 6, Mon(1) to 0
    }, [month, year]);

    const calendarDays = useMemo(() => {
        const days: Array<{ label: number; dateStr: string } | null> = [];
        // Add padding for start of month
        for (let i = 0; i < monthStartDay; i++) days.push(null);
        
        // Add actual days
        for (let d = 1; d <= daysInMonth; d++) {
            // Safe date string construction
            const date = new Date(year, month, d);
            const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            days.push({ label: d, dateStr });
        }
        return days;
    }, [daysInMonth, month, monthStartDay, year]);

    const bookingsByDate = useMemo(() => {
        return bookings.reduce<Record<string, BookingItem[]>>((acc, b) => {
            const key = new Date(b.scheduledAt).toLocaleDateString('en-CA');
            acc[key] = acc[key] ? [...acc[key], b] : [b];
            return acc;
        }, {});

    }, [bookings]);

    const dayBookings = bookingsByDate[selectedDate] ?? [];
    
    const { morning, afternoon } = useMemo(() => {
        const sorted = [...dayBookings].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        return { 
            morning: sorted.filter(b => new Date(b.scheduledAt).getHours() < 13), 
            afternoon: sorted.filter(b => new Date(b.scheduledAt).getHours() >= 13) 
        };
    }, [dayBookings]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-400">lock</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso Restringido</h1>
                <p className="text-gray-500 mb-6">El calendario de turnos solo está disponible para administradores.</p>
                <button onClick={() => navigate('/dashboard')} className="text-primary font-bold hover:underline">Volver al inicio</button>
            </div>
        );
    }

    if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loading /></div>;

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (month === 0) { setMonth(11); setYear(y => y - 1); }
            else setMonth(m => m - 1);
        } else {
            if (month === 11) { setMonth(0); setYear(y => y + 1); }
            else setMonth(m => m + 1);
        }
    };

    const jumpToToday = () => {
        const now = new Date();
        setMonth(now.getMonth());
        setYear(now.getFullYear());
        setSelectedDate(now.toLocaleDateString('en-CA'));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans pb-24">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Calendario</h1>
                     <p className="text-gray-500 dark:text-gray-400 font-medium">Gestiona y visualiza la carga de trabajo mensual.</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => navigate('/book/step1')} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-lg hover:-translate-y-0.5 transition-transform">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nuevo Turno
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Calendar Component (Left - 7 cols) */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    
                    {/* Controls */}
                    <div className="bg-white dark:bg-[#1a2632] p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-gray-900 dark:text-white capitalize min-w-[180px] pl-4">
                                {monthNames[month]} <span className="text-gray-400 font-medium">{year}</span>
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => navigateMonth('prev')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_left</span>
                                </button>
                                <button onClick={() => navigateMonth('next')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <button onClick={jumpToToday} className="px-5 py-2 mr-2 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
                            Hoy
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="bg-white dark:bg-[#1a2632] p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 w-full overflow-hidden">
                        {/* Week Days Header */}
                        <div className="flex mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                            {dayNames.map(day => (
                                <div key={day} style={{ width: '14.28%' }} className="text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="flex flex-wrap w-full">
                            {calendarDays.map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} style={{ width: '14.28%' }} className="aspect-square" />;
                                
                                const isToday = day.dateStr === new Date().toLocaleDateString('en-CA');
                                const isSelected = day.dateStr === selectedDate;
                                const dateBookings = bookingsByDate[day.dateStr] ?? [];
                                const hasBookings = dateBookings.length > 0;
                                
                                const dots = dateBookings.slice(0, 3).map(b => STATUS_STYLES[b.status].dot);
                                const extra = dateBookings.length - 3;

                                return (
                                    <div key={day.dateStr} style={{ width: '14.28%' }} className="p-0.5 md:p-1 aspect-square">
                                        <button
                                            onClick={() => setSelectedDate(day.dateStr)}
                                            className={`
                                                w-full h-full rounded-xl md:rounded-2xl flex flex-col items-center justify-start pt-1 md:pt-2 transition-all duration-200 border
                                                ${isSelected 
                                                    ? 'bg-primary text-white shadow-md md:shadow-xl shadow-primary/30 border-primary scale-95 md:scale-105 z-10' 
                                                    : isToday
                                                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 text-primary'
                                                        : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                                                }
                                            `}
                                        >
                                            <span className="text-xs md:text-sm font-bold">
                                                {day.label}
                                            </span>
                                            
                                            {hasBookings && (
                                                <div className="mt-auto mb-1 md:mb-2 flex items-center justify-center gap-0.5 md:gap-1 flex-wrap w-full px-0.5">
                                                    {dots.map((dotClass, i) => (
                                                        <span key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isSelected ? 'bg-white/80' : dotClass}`}></span>
                                                    ))}
                                                    {extra > 0 && (
                                                        <span className={`text-[8px] md:text-[9px] font-bold leading-none ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>+</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-6 px-4">
                        {Object.entries(STATUS_STYLES).map(([status, style]) => (
                            <div key={status} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${style.dot}`}></span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{BOOKING_STATUS_LABELS[status as BookingStatus]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agenda Details (Right - 5 cols) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full gap-6">
                    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none h-fit sticky top-6">
                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                             <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize leading-tight">
                                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                                </h2>
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mt-1">
                                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long' })}
                                </p>
                             </div>
                             <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-bold text-gray-500">
                                {dayBookings.length} Turnos
                             </div>
                        </div>

                        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Morning Section */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-[#1a2632] py-2 z-10">
                                    <span className="material-symbols-outlined text-sm text-amber-500">sunny</span>
                                    Mañana
                                </h3>
                                <div className="space-y-3">
                                    {morning.length > 0 ? morning.map(b => <AgendaItem key={b.id} booking={b} />) : <EmptySlot />}
                                </div>
                            </div>

                            {/* Afternoon Section */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-[#1a2632] py-2 z-10">
                                    <span className="material-symbols-outlined text-sm text-indigo-500">nightlight</span>
                                    Tarde
                                </h3>
                                <div className="space-y-3">
                                    {afternoon.length > 0 ? afternoon.map(b => <AgendaItem key={b.id} booking={b} />) : <EmptySlot />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const AgendaItem: React.FC<{ booking: BookingItem }> = ({ booking }) => {
    const navigate = useNavigate();
    const style = STATUS_STYLES[booking.status];
    
    return (
        <div 
             onClick={() => navigate(`/dashboard/repair/${booking.id}`)}
             className={`group relative pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-0.5 ${style.cardHover}`}
        >
            {/* Status Color Bar */}
            <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-lg ${style.dot}`}></div>
            
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                    {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${style.labelBg} ${style.text}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                </span>
            </div>
            
            <h4 className={`text-sm font-bold text-gray-900 dark:text-white truncate mb-1 ${style.text === 'line-through' ? 'line-through opacity-60' : ''}`}>
                {booking.assetType === 'VEHICLE' 
                    ? `${booking.vehicle?.brand?.name || ''} ${booking.vehicle?.model}`.trim() 
                    : booking.part?.description}
            </h4>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-0.5">
                <span className="material-symbols-outlined text-[14px]">person</span>
                {booking.customer?.fullName?.split(' ')[0] || 'Cliente'}
            </div>
        </div>
    );
};

const EmptySlot = () => (
    <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center bg-gray-50/50 dark:bg-gray-800/20">
        <p className="text-xs text-gray-400 font-medium">Sin turnos</p>
    </div>
);

export default CalendarView;
