import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus } from '../../types/booking';
import type { AssetType } from '../../types/enums';

const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const statusTone: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-blue-500',
  IN_PROGRESS: 'bg-indigo-500',
  DONE: 'bg-green-500',
  CANCELED: 'bg-gray-400',
};

const CalendarView: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

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

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [month, year]);
  const monthStartDay = useMemo(() => new Date(year, month, 1).getDay(), [month, year]);

  const calendarDays = useMemo(() => {
    const days: Array<{ label: number; dateStr: string } | null> = [];
    for (let i = 0; i < (monthStartDay || 7) - 1; i++) {
      days.push(null); // leading blanks (start week Monday-like)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
      days.push({ label: d, dateStr });
    }
    return days;
  }, [daysInMonth, month, monthStartDay, year]);

  const bookingsByDate = useMemo(() => {
    return bookings.reduce<Record<string, BookingItem[]>>((acc, b) => {
      const key = new Date(b.scheduledAt).toISOString().slice(0, 10);
      acc[key] = acc[key] ? [...acc[key], b] : [b];
      return acc;
    }, {});
  }, [bookings]);

  const dayBookings = bookingsByDate[selectedDate] ?? [];
  const { morning, afternoon } = useMemo(() => {
    const sorted = [...dayBookings].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const morningList: BookingItem[] = [];
    const afternoonList: BookingItem[] = [];
    sorted.forEach((b) => {
      const hour = new Date(b.scheduledAt).getHours();
      if (hour < 14) morningList.push(b);
      else afternoonList.push(b);
    });
    return { morning: morningList, afternoon: afternoonList };
  }, [dayBookings]);

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-2 text-[#111518] dark:text-white">Calendario</h1>
        <p className="text-sm text-[#617989] dark:text-gray-400">Solo los administradores pueden ver el calendario de turnos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Agenda</p>
          <h1 className="text-3xl font-black text-[#111518] dark:text-white leading-tight">Calendario de turnos</h1>
          <p className="text-sm text-[#617989] dark:text-gray-400">Toca un día para ver mañana/tarde.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg border border-[#dbe1e6] dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            onClick={() => navigate('/dashboard')}
          >
            Volver al panel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[#617989] dark:text-gray-400 px-1">
        {Object.entries(statusTone).map(([status, colorClass]) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
            <span>{BOOKING_STATUS_LABELS[status as BookingStatus]}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-700 px-2 py-1 text-sm"
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else {
                  setMonth((m) => m - 1);
                }
              }}
            >
              ←
            </button>
            <h2 className="text-lg font-bold text-[#111518] dark:text-white">{monthNames[month]} {year}</h2>
            <button
              className="rounded-lg border border-[#dbe1e6] dark:border-gray-700 px-2 py-1 text-sm"
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else {
                  setMonth((m) => m + 1);
                }
              }}
            >
              →
            </button>
          </div>
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => {
              const now = new Date();
              setMonth(now.getMonth());
              setYear(now.getFullYear());
              setSelectedDate(now.toISOString().slice(0, 10));
            }}
          >
            Hoy
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#617989] dark:text-gray-400">
          {dayNames.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isToday = day.dateStr === todayStr;
            const isSelected = day.dateStr === selectedDate;
            const hasBookings = (bookingsByDate[day.dateStr]?.length ?? 0) > 0;
            const statuses = (bookingsByDate[day.dateStr] ?? []).reduce<Record<BookingStatus, number>>((acc, b) => {
              acc[b.status] = (acc[b.status] ?? 0) + 1;
              return acc;
            }, {} as Record<BookingStatus, number>);
            const statusKeys = Object.keys(statuses) as BookingStatus[];
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`aspect-square rounded-xl border text-sm flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-[#dbe1e6] dark:border-gray-800 bg-white dark:bg-gray-900'
                } ${isToday ? 'ring-2 ring-primary/30' : ''}`}
              >
                <span className="text-base font-bold">{day.label}</span>
                {hasBookings ? (
                  <div className="flex items-center gap-1 mt-1">
                    {statusKeys.map((s) => (
                      <span key={s} className={`w-2 h-2 rounded-full ${statusTone[s]}`} title={`${BOOKING_STATUS_LABELS[s]}: ${statuses[s]} turno(s)`}></span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#617989] dark:text-gray-400">Sin turnos</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DayColumn title="Turnos en la mañana" items={morning} onNavigate={navigate} />
        <DayColumn title="Turnos en la tarde" items={afternoon} onNavigate={navigate} />
      </div>

      {loading && <p className="text-sm text-[#617989]">Cargando turnos...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const DayColumn: React.FC<{ title: string; items: BookingItem[]; onNavigate: ReturnType<typeof useNavigate> }> = ({ title, items, onNavigate }) => (
  <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#dbe1e6] dark:border-gray-800 p-4 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-[#111518] dark:text-white">{title}</h3>
      <span className="text-xs text-[#617989] dark:text-gray-400">{items.length} turno(s)</span>
    </div>
    <div className="flex flex-col gap-2">
      {items.map((b) => (
        <button
          key={b.id}
          onClick={() => onNavigate(`/dashboard/repair/${b.id}`)}
          className="text-left rounded-lg border border-[#dbe1e6] dark:border-gray-800 p-3 hover:border-primary/40 transition-colors bg-gray-50/50 dark:bg-gray-900/40"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-[#111518] dark:text-white">{b.customer?.fullName || b.customer?.email || 'Cliente'}</span>
              <span className="text-[11px] text-[#617989] dark:text-gray-400">{new Date(b.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary font-bold">{BOOKING_STATUS_LABELS[b.status]}</span>
          </div>
          <p className="text-xs text-[#617989] dark:text-gray-400 mt-1 line-clamp-1">{b.assetType === 'VEHICLE' ? `${b.vehicle?.brand?.name || b.vehicle?.brandOther || ''} ${b.vehicle?.model || ''}` : b.part?.description ?? 'Repuesto'}</p>
        </button>
      ))}
      {!items.length && <div className="rounded-lg border border-dashed border-[#dbe1e6] dark:border-gray-800 p-4 text-sm text-[#617989] dark:text-gray-400">Sin turnos.</div>}
    </div>
  </div>
);

export default CalendarView;
