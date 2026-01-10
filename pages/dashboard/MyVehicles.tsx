import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vehiclesApi, UpsertVehiclePayload } from '../../services/vehicles';
import { bookingApi } from '../../services/booking';
import { CustomerVehicle, VehicleBrandOption, VehicleTypeOption, BookingItem, BOOKING_STATUS_LABELS } from '../../types/booking';
import Loading from '../../components/Loading';
import formatDuration from '../../lib/formatDuration'; // Assuming this exists or I will just display date

export default function MyVehicles() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState<(CustomerVehicle & { owner?: any })[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
    const [vehicleBookings, setVehicleBookings] = useState<BookingItem[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    
    const [vehicleToDelete, setVehicleToDelete] = useState<CustomerVehicle | null>(null);
    const [brands, setBrands] = useState<VehicleBrandOption[]>([]);
    const [types, setTypes] = useState<VehicleTypeOption[]>([]);
    
    // Form Data
    const [formData, setFormData] = useState<UpsertVehiclePayload>({
        typeId: 0,
        brandId: undefined,
        brandOther: '',
        model: '',
        year: new Date().getFullYear(),
        vinOrPlate: '',
        notes: ''
    });

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        if (!token) return;
        fetchData();
        fetchOptions();
    }, [token, query]);

    // Close modals on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isModalOpen) setIsModalOpen(false);
                if (vehicleToDelete) setVehicleToDelete(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, vehicleToDelete]);

    // Fetch bookings when editing vehicle
    useEffect(() => {
        if (editingVehicle && token) {
            setLoadingBookings(true);
            bookingApi.getBookingsByVehicle(editingVehicle.id, token)
                .then(data => setVehicleBookings(data))
                .catch(err => console.error("Error fetching bookings", err))
                .finally(() => setLoadingBookings(false));
        } else {
            setVehicleBookings([]);
        }
    }, [editingVehicle, token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let data;
            if (isAdmin) {
                // Admin sees all, with search
                data = await vehiclesApi.getAllVehicles(token!, query);
            } else {
                // Client sees theirs
                data = await vehiclesApi.getMyVehicles(token!);
            }
            setVehicles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [b, t] = await Promise.all([
                bookingApi.listVehicleBrands(token!),
                bookingApi.listVehicleTypes(token!)
            ]);
            setBrands(b);
            setTypes(t);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                if (isAdmin && editingVehicle.owner) {
                    // Admin update
                    await vehiclesApi.updateVehicleAsAdmin(editingVehicle.owner.id, editingVehicle.id, formData, token!);
                } else {
                    // Own update
                    await vehiclesApi.updateMyVehicle(editingVehicle.id, formData, token!);
                }
            } else {
                await vehiclesApi.createMyVehicle(formData, token!);
            }
            setIsModalOpen(false);
            setEditingVehicle(null);
            resetForm();
            fetchData();
        } catch (err) {
            alert('Error al guardar vehículo');
        }
    };

    const executeDelete = async () => {
        if (!vehicleToDelete) return;
        try {
            if (isAdmin && vehicleToDelete.owner?.id) {
                await vehiclesApi.deleteVehicleAsAdmin(vehicleToDelete.owner.id, vehicleToDelete.id, token!);
            } else {
                await vehiclesApi.deleteMyVehicle(vehicleToDelete.id, token!);
            }
            setVehicleToDelete(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    const openCreate = () => {
        setEditingVehicle(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (v: CustomerVehicle) => {
        setEditingVehicle(v);
        setFormData({
            typeId: v.type.id,
            brandId: v.brand?.id,
            brandOther: v.brandOther || '',
            model: v.model,
            year: v.year || new Date().getFullYear(),
            vinOrPlate: v.vinOrPlate || '',
            notes: v.notes || ''
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            typeId: types[0]?.id || 0,
            brandId: undefined,
            brandOther: '',
            model: '',
            year: new Date().getFullYear(),
            vinOrPlate: '',
            notes: ''
        });
    };

    const getVehicleIcon = (typeCode?: string) => {
        switch (typeCode) {
            case 'MOTO': return 'two_wheeler';
            case 'SUV': return 'airport_shuttle';
            case 'PICKUP': return 'local_shipping';
            default: return 'directions_car';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {isAdmin ? 'Flota de Clientes' : 'Mi Garage Virtual'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        {isAdmin 
                            ? 'Gestiona y visualiza todos los vehículos registrados en la plataforma.' 
                            : 'Aquí están tus vehículos listos para el próximo servicio.'}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="group relative flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold h-12 px-8 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                    <span className="text-base">Registrar Vehículo</span>
                </button>
            </div>

            {/* Filters Section (Admin only) */}
            {isAdmin && (
                <div className="mb-10 bg-white dark:bg-[#1a2632] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center">
                    <div className="pl-4 pr-3 text-gray-400">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </div>
                    <input
                        className="w-full h-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 border-none focus:ring-0 text-base"
                        placeholder="Buscar por patente, marca, modelo o propietario..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading />
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2632] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[48px]">garage_home</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {query ? 'No se encontraron vehículos' : 'Tu garage está vacío'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                            {query 
                                ? 'Intenta ajustar los términos de búsqueda para encontrar lo que necesitas.' 
                                : 'Registra tu primer vehículo para comenzar a gestionar tus servicios y mantenimientos.'}
                        </p>
                        {!query && (
                            <button onClick={openCreate} className="text-primary font-bold hover:underline flex items-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Agregar mi primer vehículo
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {vehicles.map((car) => (
                            <div 
                                key={car.id} 
                                className="group relative bg-white dark:bg-[#1a2632] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300
                                        ${car.type?.code === 'MOTO' 
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}
                                    `}>
                                        <span className="material-symbols-outlined text-[32px]">
                                            {getVehicleIcon(car.type?.code)}
                                        </span>
                                    </div>
                                    
                                    {/* Patente Style Badge */}
                                    <div className="relative group/plate cursor-default">
                                        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg pr-3 pl-2 py-1 flex items-center gap-2">
                                             <div className="w-4 h-full bg-blue-600 rounded-sm" />   {/* Simulación banda azul patente */}
                                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-lg tracking-widest">
                                                {car.vinOrPlate || '---'}
                                            </span>
                                        </div>
                                        <div className="absolute opacity-0 group-hover/plate:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                                            Patente / VIN
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Info */}
                                <div className="mb-6">
                                    <h3 
                                        className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1 truncate" 
                                        title={`${car.brand?.name || car.brandOther} ${car.model}`}
                                    >
                                        {car.brand?.name || car.brandOther} {car.model}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                                        <span>{car.year || 'Año Desc.'}</span>
                                        <span>•</span>
                                        <span>{car.type?.name}</span>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                <div className="space-y-3 mb-6">
                                    {isAdmin && car.owner && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                                <span className="material-symbols-outlined text-[16px]">person</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Propietario</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{car.owner.fullName}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {car.notes && (
                                        <div className="flex items-start gap-2 text-sm text-gray-500 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                            <span className="material-symbols-outlined text-[18px] text-yellow-600 dark:text-yellow-500 mt-0.5">sticky_note_2</span>
                                            <p className="line-clamp-2 text-yellow-800 dark:text-yellow-200">{car.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button 
                                        onClick={() => openEdit(car)}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => setVehicleToDelete(car)}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal - Modern Design */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                >
                    <div className="bg-white dark:bg-[#1a2632] w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a2632] z-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Ingresa los detalles del vehículo a continuación
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-500"
                            >
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <form id="vehicle-form" onSubmit={handleSave} className="space-y-6">
                                {/* Type & Brand Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tipo de Vehículo</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
                                                value={formData.typeId}
                                                onChange={e => setFormData({...formData, typeId: Number(e.target.value)})}
                                                required
                                            >
                                                <option value={0} disabled>Seleccionar tipo...</option>
                                                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Marca</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
                                                value={formData.brandId ?? ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        const otherBrand = brands.find(b => b.name.trim().toLowerCase().includes('otro') || b.name.trim().toLowerCase().includes('otra'));
                                                        setFormData({
                                                            ...formData, 
                                                            brandId: otherBrand ? otherBrand.id : undefined, 
                                                            brandOther: ''
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData, 
                                                            brandId: Number(val), 
                                                            brandOther: ''
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Otra / Personalizada</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Brand Input */}
                                {(formData.brandId === undefined || formData.brandId === brands.find(b => b.name.trim().toLowerCase().includes('otro'))?.id) && (
                                    <div className="animate-fade-in space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Especifique la Marca</label>
                                        <input 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.brandOther}
                                            onChange={e => setFormData({...formData, brandOther: e.target.value})}
                                            placeholder="Ej. Tesla, Rivian..."
                                            required={!formData.brandId || formData.brandId === brands.find(b => b.name.trim().toLowerCase().includes('otro'))?.id}
                                        />
                                    </div>
                                )}

                                {/* Model */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Modelo</label>
                                    <input 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.model}
                                        onChange={e => setFormData({...formData, model: e.target.value})}
                                        placeholder="Ej. Model 3, Corolla, Hilux..."
                                        required
                                    />
                                </div>

                                {/* Year & Plate Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Año de Fabricación</label>
                                        <input 
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.year}
                                            onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Patente o VIN</label>
                                        <input 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase font-mono tracking-wider transition-all"
                                            value={formData.vinOrPlate}
                                            onChange={e => setFormData({...formData, vinOrPlate: e.target.value.toUpperCase()})}
                                            placeholder="AA000BB"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Notas Adicionales <span className="font-normal text-gray-400 ml-1">(Opcional)</span>
                                    </label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-24 transition-all"
                                        value={formData.notes}
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Detalles adicionales, color, estado, características especiales..."
                                    />
                                </div>
                            </form>

                            {/* Booking History Section */}
                            {editingVehicle && (
                                <div className="mt-8 animate-fade-in border-t border-gray-100 dark:border-gray-800 pt-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Historial de Turnos
                                    </h3>
                                    
                                    {loadingBookings ? (
                                        <div className="flex justify-center p-4"><Loading /></div>
                                    ) : vehicleBookings.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                                            No hay turnos registrados para este vehículo.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {vehicleBookings.map(booking => (
                                                <div 
                                                    key={booking.id} 
                                                    onClick={() => navigate(`/dashboard/repair/${booking.id}`)}
                                                    className="cursor-pointer p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center group hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
                                                    title="Ver detalles del turno"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono font-bold text-gray-900 dark:text-white">
                                                                {new Date(booking.scheduledAt).toLocaleDateString()}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}
                                                            `}>
                                                                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                            {booking.commonIssues?.map(i => i.label).join(', ') || booking.details || 'Sin detalle de problema'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-gray-400 block mb-1">Duración</span>
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            {booking.durationMinutes} min
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#15202b] flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3.5 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="vehicle-form"
                                className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">save</span>
                                Guardar Vehículo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - Modern */}
            {vehicleToDelete && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setVehicleToDelete(null);
                    }}
                >
                    <div className="bg-white dark:bg-[#1a2632] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up transform border-t-4 border-red-500">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-[40px]">warning</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">¿Eliminar Vehículo?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Estás a punto de eliminar permanentemente: <br/>
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {vehicleToDelete.brand?.name || vehicleToDelete.brandOther} {vehicleToDelete.model}
                                </span>
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setVehicleToDelete(null)}
                                    className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    No, Cancelar
                                </button>
                                <button 
                                    onClick={executeDelete}
                                    className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 hover:-translate-y-0.5 transition-all"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}