import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingApi } from '../../services/booking';
import { BOOKING_STATUS_LABELS, BookingItem, BookingStatus, BookingUsedPart } from '../../types/booking';
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
  
  // Parts state
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [addingPart, setAddingPart] = useState(false);

  // Details state
  const [details, setDetails] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingRepairNotes, setEditingRepairNotes] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingRepairNotes, setSavingRepairNotes] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    bookingApi
      .getOne(Number(id), token)
      .then((b) => {
        setBooking(b);
        setDetails(b.details || '');
        setRepairNotes(b.repairNotes || '');
      })
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

  const handleAddPart = async () => {
    if (!booking || !token || !newPartName.trim()) return;
    setAddingPart(true);
    try {
      const part = await bookingApi.addUsedPart(booking.id, { name: newPartName, quantity: newPartQty }, token);
      setBooking((prev) => prev ? { ...prev, usedParts: [...(prev.usedParts || []), part] } : prev);
      setNewPartName('');
      setNewPartQty(1);
    } catch (err) {
      alert('Error al agregar repuesto');
    } finally {
      setAddingPart(false);
    }
  };

  const handleRemovePart = async (partId: number) => {
    if (!booking || !token) return;
    if (!confirm('¿Eliminar repuesto?')) return;
    try {
      await bookingApi.removeUsedPart(booking.id, partId, token);
      setBooking((prev) => prev ? { ...prev, usedParts: prev.usedParts?.filter(p => p.id !== partId) } : prev);
    } catch (err) {
      alert('Error al eliminar repuesto');
    }
  };

  const handleSaveDetails = async () => {
    if (!booking || !token) return;
    setSavingDetails(true);
    try {
      await bookingApi.updateDetails(booking.id, details, token);
      setBooking((prev) => prev ? { ...prev, details } : prev);
      setEditingDetails(false);
    } catch (err) {
      alert('Error al guardar detalles');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveRepairNotes = async () => {
    if (!booking || !token) return;
    setSavingRepairNotes(true);
    try {
      await bookingApi.updateRepairNotes(booking.id, repairNotes, token);
      setBooking((prev) => prev ? { ...prev, repairNotes } : prev);
      setEditingRepairNotes(false);
    } catch (err) {
      alert('Error al guardar notas de reparación');
    } finally {
      setSavingRepairNotes(false);
    }
  };

  if (!id) return <div className="p-8 text-center text-red-500 font-medium">Falta identificación del turno.</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate('/dashboard/history')}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Reparación <span className="text-primary">#{booking?.code?.slice(0, 6)}</span>
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {booking ? new Date(booking.scheduledAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Cargando...'}
          </p>
        </div>
        
        <button
          className="hidden md:flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-10 px-5 text-sm font-bold gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
          onClick={() => navigate('/dashboard/history')}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver al historial
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Cargando detalles...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {booking && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Hero / Asset Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a2632] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 group">
              <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 dark:opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                <span className="material-symbols-outlined text-[120px] md:text-[160px]">
                  {booking.assetType === 'VEHICULO' ? 'directions_car' : 'settings'}
                </span>
              </div>
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase flex items-center gap-2 ${
                    booking.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      booking.status === 'DONE' ? 'bg-green-500' : 
                      booking.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 
                      'bg-gray-500' 
                    }`}></span>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </div>

                  {user?.role === 'ADMIN' && (
                     <div className="flex items-center gap-2">
                        <select
                          className="rounded-lg border-gray-200 dark:border-gray-700 bg-transparent text-sm font-semibold focus:ring-2 focus:ring-primary/20 py-1"
                          value={booking.status}
                          disabled={updating}
                          onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
                        >
                          {Object.values(BookingStatus).map((s) => (
                            <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        {updating && <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></span>}
                     </div>
                  )}
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {booking.assetType === 'VEHICULO' 
                      ? [booking.vehicle?.brand?.name ?? booking.vehicle?.brandOther, booking.vehicle?.model].filter(Boolean).join(' ') 
                      : booking.part?.name ?? 'Repuesto'}
                  </h2>
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                     {booking.assetType === 'VEHICULO' 
                        ? `${booking.vehicle?.type?.name || 'Vehículo'} • ${booking.vehicle?.year || ''} • ${booking.vehicle?.vinOrPlate || 'Sin patente'}`
                        : `${booking.part?.category?.name || 'General'} • ${booking.part?.description || 'Sin descripción'}`
                     }
                  </p>
                </div>
              </div>

              {/* Stepper Inside Card */}
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="relative">
                  {/* Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 hidden md:block rounded-full"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
                    {steps.map((step, index) => {
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      return (
                        <div key={step} className={`flex md:flex-col items-center gap-4 md:gap-3 group ${isCurrent ? 'md:-mt-2' : ''} transition-all`}>
                          <div className={`
                            relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                            ${isActive 
                              ? 'bg-primary text-white shadow-primary/30 scale-110' 
                              : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700'}
                          `}>
                            {isActive ? (
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">check</span>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:items-center">
                            <span className={`text-sm md:text-base font-bold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                              {step}
                            </span>
                            {isCurrent && (
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider md:absolute md:top-full md:mt-2">En curso</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Report Section */}
            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-[#1a2632] dark:to-[#151f28] p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 md:p-8 bg-white dark:bg-[#1a2632] rounded-xl h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <span className="material-symbols-outlined text-[24px]">engineering</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informe Técnico</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Diagnóstico y trabajos realizados</p>
                            </div>
                        </div>
                        {user?.role === 'ADMIN' && !editingRepairNotes && (
                            <button 
                                onClick={() => setEditingRepairNotes(true)}
                                className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                {booking.repairNotes ? 'Editar' : 'Redactar'}
                            </button>
                        )}
                    </div>

                    {editingRepairNotes ? (
                        <div className="space-y-4 animate-fade-in">
                             <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] mt-0.5">visibility</span>
                                <p>Este informe será visible para el cliente. Utilice un lenguaje técnico pero claro.</p>
                             </div>
                            <textarea
                                className="w-full min-h-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-base focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-y"
                                value={repairNotes}
                                onChange={(e) => setRepairNotes(e.target.value)}
                                placeholder="Describa el diagnóstico, las reparaciones efectuadas y recomendaciones..."
                            />
                             <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setEditingRepairNotes(false);
                                        setRepairNotes(booking.repairNotes || '');
                                    }}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveRepairNotes}
                                    disabled={savingRepairNotes}
                                    className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:shadow-none flex items-center gap-2"
                                >
                                    {savingRepairNotes && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                    {savingRepairNotes ? 'Guardando...' : 'Publicar Informe'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-xl border ${booking.repairNotes ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30' : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20'} p-6 transition-all`}>
                            {booking.repairNotes ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                        {booking.repairNotes}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <span className="material-symbols-outlined text-[32px]">assignment_add</span>
                                    </div>
                                    <h4 className="text-gray-900 dark:text-white font-bold mb-1">Sin informe técnico</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                        Aún no se ha cargado el detalle de los trabajos realizados.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Used Parts List */}
            <div className="rounded-2xl bg-white dark:bg-[#1a2632] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                        <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Repuestos e Insumos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Materiales utilizados en la reparación</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {booking.usedParts?.map((part) => (
                        <div key={part.id} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-100 dark:hover:border-orange-900/30 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-sm border border-orange-100 dark:border-orange-900/30">
                                    {part.quantity}
                                </span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{part.name}</span>
                            </div>
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => handleRemovePart(part.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Eliminar"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {(!booking.usedParts || booking.usedParts.length === 0) && (
                        <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30">
                            <p className="text-gray-500 text-sm">No se han registrado repuestos utilizados.</p>
                        </div>
                    )}
                </div>

                {user?.role === 'ADMIN' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Agregar Item</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Nombre del repuesto o insumo"
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={newPartName}
                                onChange={(e) => setNewPartName(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Cant."
                                    className="w-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={newPartQty}
                                    onChange={(e) => setNewPartQty(Number(e.target.value))}
                                />
                                <button
                                    onClick={handleAddPart}
                                    disabled={addingPart || !newPartName.trim()}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 transition-all flex items-center justify-center min-w-[60px]"
                                >
                                    {addingPart ? <span className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-current rounded-full animate-spin"></span> : 'Agregar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
          </div>

          {/* Sidebar / Meta Column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Customer Card */}
            <div className="rounded-2xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Cliente</h3>
               
               <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-gray-800 flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400 shadow-inner">
                     <span className="material-symbols-outlined text-[36px]">person</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {booking.customer?.fullName || 'Cliente Ocasional'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {booking.customer?.email || 'Sin email registrado'}
                  </p>
               </div>

               <div className="space-y-4">
                  <a href={`tel:${booking.customer?.phone}`} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                     <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">call</span>
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200 group-hover:text-primary transition-colors">
                            {booking.customer?.phone || 'No disponible'}
                        </p>
                     </div>
                  </a>
               </div>
            </div>

            {/* Problem Description Card (Client's View) */}
            <div className="rounded-2xl bg-white dark:bg-[#1a2632] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Solicitud del Cliente</h3>
                  {user?.role === 'ADMIN' && !editingDetails && (
                      <button onClick={() => setEditingDetails(true)} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">EDITAR</button>
                  )}
               </div>

               {editingDetails ? (
                  <div className="space-y-3">
                      <textarea
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        rows={5}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Descripción..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingDetails(false);
                            setDetails(booking.details || '');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          CANCELAR
                        </button>
                        <button
                          onClick={handleSaveDetails}
                          disabled={savingDetails}
                          className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
                        >
                          GUARDAR
                        </button>
                      </div>
                  </div>
               ) : (
                   <div className="relative">
                       <span className="absolute top-0 left-0 text-4xl text-gray-100 dark:text-gray-800 select-none font-serif">"</span>
                       <p className="relative z-10 text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed px-4 pt-2">
                          {booking.details || 'Sin descripción detallada del problema.'}
                       </p>
                       <span className="absolute bottom-0 right-0 text-4xl text-gray-100 dark:text-gray-800 select-none font-serif translate-y-2">"</span>
                   </div>
               )}
            </div>

            {/* Turn Info Meta */}
            <div className="bg-transparent p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-500">ID Turno</span>
                     <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{booking.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-500">Creado el</span>
                     <span className="text-sm font-semibold">{new Date(booking.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default RepairTracking;