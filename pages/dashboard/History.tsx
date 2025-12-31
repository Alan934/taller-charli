import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/booking';
import { BookingItem, BookingStatus } from '../../types/booking';

const History: React.FC = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        (user?.role === 'ADMIN' ? bookingApi.listAll(token) : bookingApi.listMine(token))
            .then(setBookings)
            .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar historial'))
            .finally(() => setLoading(false));
    }, [token, user?.role]);

    const totals = useMemo(() => {
        return bookings.reduce(
            (acc, b) => {
                acc[b.status] = (acc[b.status] ?? 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [bookings]);

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
                    { label: 'Total turnos', value: bookings.length },
                    { label: 'Pendientes', value: totals[BookingStatus.PENDING] ?? 0 },
                    { label: 'Completados', value: totals[BookingStatus.DONE] ?? 0 },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2632] border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm">
                        <p className="text-[#617989] dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-[#111518] dark:text-white text-3xl font-bold leading-tight tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1A2632] rounded-xl border border-[#dbe1e6] dark:border-[#2A3B4C] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#dbe1e6] dark:border-[#2A3B4C] flex items-center justify-between">
                    <p className="text-sm text-[#617989] dark:text-gray-400">{loading ? 'Cargando...' : `${bookings.length} resultados`}</p>
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
                            {bookings.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#202E3C] transition-colors">
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200 font-medium whitespace-nowrap">{new Date(row.scheduledAt).toLocaleString()}</td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">{row.assetType}</td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">{row.code.slice(0, 8)}</td>
                                    <td className="p-4 text-sm text-[#111518] dark:text-gray-200">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1 text-xs font-semibold">
                                            {row.status}
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