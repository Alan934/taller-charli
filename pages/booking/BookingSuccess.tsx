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
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1720] font-sans antialiased flex flex-col items-center">
         <BookingHeader title="Reserva confirmada" onBack={() => navigate('/')} />
         <main className="w-full max-w-3xl px-6 py-12 flex-1 flex flex-col items-center justify-center">
            
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 md:p-12 text-center w-full animate-scaleIn">
               <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
               </div>
               
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">¡Turno Confirmado!</h1>
               <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
                  Agendamos tu cita correctamente. Te enviamos un correo con todos los detalles para que no lo olvides.
               </p>

               {summary ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-8 mb-10 text-left border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha</p>
                           <p className="font-bold text-slate-900 dark:text-white text-lg">{summary.date}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hora</p>
                           <p className="font-bold text-slate-900 dark:text-white text-lg">{summary.time} hs</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duración</p>
                           <p className="font-bold text-slate-900 dark:text-white text-lg">{summary.duration}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Código</p>
                           <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg tracking-wide select-all">{summary.code}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                            <p className="font-bold text-slate-900 dark:text-white">{summary.asset}</p>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl mb-8 border border-amber-100 dark:border-amber-800">
                     No encontramos la información de la reserva recientemente creada.
                  </div>
               )}

               <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                     className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full sm:w-auto"
                     onClick={() => {
                        clearBooking();
                        navigate('/dashboard/history');
                     }}
                  >
                     Ver mis reservas
                  </button>
                  <button
                     className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                     onClick={startNewBooking}
                  >
                     Nuevo turno
                  </button>
                  <button
                     className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                     onClick={goDashboard}
                  >
                     Ir al inicio
                  </button>
               </div>
            </div>
         </main>
      </div>
   );
};

export default BookingSuccess;