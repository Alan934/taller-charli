import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingHeader } from '../../components/BookingHeader';
import { useBooking } from '../../context/BookingContext';
import { formatDurationLabel } from '../../lib/formatDuration';

const BookingSuccess: React.FC = () => {
   const navigate = useNavigate();
   const { lastBooking, clearBooking } = useBooking();

   const summary = useMemo(() => {
      if (!lastBooking) return null;
      const dt = lastBooking.scheduledAt ? new Date(lastBooking.scheduledAt) : null;
      return {
         code: lastBooking.code,
         date: dt ? dt.toLocaleDateString() : 'Sin fecha',
         time: dt ? dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
         asset: lastBooking.assetType === 'VEHICLE' ? 'Vehículo' : 'Repuesto',
         duration: formatDurationLabel(lastBooking.durationMinutes),
      };
   }, [lastBooking]);

   const goDashboard = () => {
      clearBooking();
      navigate('/dashboard');
   };

   const startNewBooking = () => {
      clearBooking();
      navigate('/book/step1');
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
         <BookingHeader title="Reserva confirmada" onBack={() => navigate('/')} />
         <main className="max-w-3xl mx-auto px-6 py-12">
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-gray-100">
               <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">¡Reserva confirmada!</h1>
               <p className="text-gray-600 mb-8 text-lg">Agendamos tu cita y enviamos un correo con los detalles.</p>

               {summary ? (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                     <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                           <p className="text-gray-500">Fecha</p>
                           <p className="font-semibold text-gray-900">{summary.date}</p>
                        </div>
                        <div>
                           <p className="text-gray-500">Hora</p>
                           <p className="font-semibold text-gray-900">{summary.time}</p>
                        </div>
                        <div>
                           <p className="text-gray-500">Tipo</p>
                           <p className="font-semibold text-gray-900">{summary.asset}</p>
                        </div>
                        <div>
                           <p className="text-gray-500">Código de reserva</p>
                           <p className="font-semibold text-gray-900">{summary.code}</p>
                        </div>
                        <div>
                           <p className="text-gray-500">Duración estimada</p>
                           <p className="font-semibold text-gray-900">{summary.duration}</p>
                        </div>
                     </div>
                  </div>
               ) : (
                  <p className="text-gray-500 mb-8">No encontramos la reserva. Vuelve a intentarlo.</p>
               )}

               <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                     className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
                     onClick={() => {
                        clearBooking();
                        navigate('/dashboard/history');
                     }}
                  >
                     Ver mis reservas
                  </button>
                  <button
                     className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                     onClick={startNewBooking}
                  >
                     Crear otro turno
                  </button>
                  <button
                     className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                     onClick={goDashboard}
                  >
                     Ir al dashboard
                  </button>
               </div>
            </div>
         </main>
      </div>
   );
};

export default BookingSuccess;