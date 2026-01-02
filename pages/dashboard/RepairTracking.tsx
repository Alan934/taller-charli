import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus } from '../../types/booking';
import { useAuth } from '../../context/AuthContext';

const steps = ['Programado', 'Confirmado', 'En progreso', 'Finalizado'];

const statusIndex: Record<BookingStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  DONE: 3,
  CANCELED: 3,
};

const RepairTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    bookingApi
      .getOne(Number(id), token)
      .then(setBooking)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el turno'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const currentStep = useMemo(() => {
    if (!booking) return 0;
    return statusIndex[booking.status] ?? 0;
  }, [booking]);

  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking || !token) return;
    setUpdating(true);
    try {
      const updated = await bookingApi.updateStatus(booking.id, status, token);
      setBooking((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (!id) {
    return <p className="text-sm text-red-600">Falta el id del turno.</p>;
  }

  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#111518] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Seguimiento de reparación</h1>
          <p className="text-[#617989] dark:text-gray-400 text-base font-normal leading-normal">Detalle y estado del turno {booking?.code?.slice(0, 8) ?? id}</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center justify-center rounded-lg bg-[#eef8ff] dark:bg-gray-800 text-primary h-10 px-4 text-sm font-bold gap-2 hover:bg-[#dbeeff] transition-colors"
            onClick={() => navigate('/dashboard/history')}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-[#617989]">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {booking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
                {user?.role === 'ADMIN' && (
                  <select
                    className="rounded-md border border-[#dbe1e6] dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-xs font-semibold"
                    value={booking.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
                  >
                    {Object.values(BookingStatus).map((s) => (
                      <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}
                {updating && <span className="text-xs text-primary">Guardando…</span>}
                <p className="text-sm text-[#617989] dark:text-gray-400">Programado para {new Date(booking.scheduledAt).toLocaleString()}</p>
              </div>
              <h3 className="text-[#111518] dark:text-white text-2xl font-bold leading-tight mb-2">{booking.assetType}</h3>
              {booking.vehicle && (
                <p className="text-sm text-[#617989] dark:text-gray-300">
                  {[booking.vehicle.type?.name, booking.vehicle.brand?.name ?? booking.vehicle.brandOther, booking.vehicle.model]
                    .filter(Boolean)
                    .join(' ')}{' '}
                  {booking.vehicle.vinOrPlate ? `(${booking.vehicle.vinOrPlate})` : ''}
                </p>
              )}
              {booking.part && (
                <p className="text-sm text-[#617989] dark:text-gray-300">
                  Parte: {booking.part.description}
                  {booking.part.category?.name ? ` (${booking.part.category.name})` : ''}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#111518] dark:text-white mb-6">Progreso</h3>
              <div className="flex flex-col gap-4">
                <div className="hidden md:flex items-center gap-3">
                  {steps.map((step, index) => {
                    const reached = index <= currentStep;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${reached ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {index + 1}
                        </div>
                        <span className={`text-sm ${reached ? 'text-[#111518] dark:text-white font-semibold' : 'text-[#617989] dark:text-gray-400'}`}>{step}</span>
                        {index < steps.length - 1 && <div className="w-10 h-[2px] bg-[#dbe1e6] dark:bg-gray-700"></div>}
                      </div>
                    );
                  })}
                </div>
                <div className="md:hidden flex flex-col gap-3">
                  {steps.map((step, index) => {
                    const reached = index <= currentStep;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${reached ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                        <span className={`text-sm ${reached ? 'text-[#111518] dark:text-white font-semibold' : 'text-[#617989] dark:text-gray-400'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <h3 className="text-[#111518] dark:text-white text-lg font-bold leading-tight mb-4">Detalles</h3>
              <div className="flex flex-col gap-3">
                <DetailRow label="Código" value={booking.code} />
                <DetailRow label="Fecha" value={new Date(booking.scheduledAt).toLocaleString()} />
                {booking.vehicle?.vinOrPlate && <DetailRow label="Patente / VIN" value={booking.vehicle.vinOrPlate} />}
                {booking.customer?.email && <DetailRow label="Cliente" value={booking.customer.email} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-sm text-[#617989] dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-[#111518] dark:text-white text-right">{value}</span>
  </div>
);

export default RepairTracking;