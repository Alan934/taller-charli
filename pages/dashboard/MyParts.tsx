import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { partsApi, UpsertPartPayload } from '../../services/parts';
import { bookingApi } from '../../services/booking';
import { Part, PartCategory, BookingItem, BOOKING_STATUS_LABELS } from '../../types/booking';
import Loading from '../../components/Loading';

interface MyPartsProps {
    adminClientId?: number;
}

export default function MyParts({ adminClientId }: MyPartsProps) {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [parts, setParts] = useState<Part[]>([]);
    const [categories, setCategories] = useState<PartCategory[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [partBookings, setPartBookings] = useState<BookingItem[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [partToDelete, setPartToDelete] = useState<Part | null>(null);
    
    // Form Data
    const [formData, setFormData] = useState<UpsertPartPayload>({
        categoryId: 0,
        description: ''
    });

    const isAdmin = user?.role === 'ADMIN';

    // If admin is viewing this component directly (not inside another Admin component), 
    // we might need to know WHICH client. 
    // But for the generic "Parts" page for Admin, maybe it shows ALL parts?
    // Or maybe this page is only used for "My Parts" (Client) and "Client Parts" (Admin viewing a client).
    // The previous prompt implementation implies "MyVehicles" handles both "My" and "Admin View All".
    // "MyVehicles" logic: if (isAdmin) getAllVehicles else getMyVehicles.
    // Let's do the same.

    useEffect(() => {
        if (!token) return;
        fetchData();
        fetchCategories();
    }, [token, adminClientId, query]);

    // Close modals on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isModalOpen) setIsModalOpen(false);
                if (partToDelete) setPartToDelete(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, partToDelete]);

    // Fetch bookings history when editing part
    useEffect(() => {
        if (editingPart && token) {
            setLoadingBookings(true);
            bookingApi.getBookingsByPart(editingPart.id, token)
                .then(data => setPartBookings(data))
                .catch(err => console.error("Error fetching part history", err))
                .finally(() => setLoadingBookings(false));
        } else {
            setPartBookings([]);
        }
    }, [editingPart, token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let data;
            if (isAdmin) {
                if (adminClientId) {
                    // Viewing specific client's parts
                    data = await partsApi.listParts(adminClientId, token!);
                } else {
                    // Admin viewing ALL parts (Global Inventory)
                    data = await partsApi.getAllParts(token!, query);
                }
            } else {
                data = await partsApi.listMyParts(token!);
            }
            setParts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const cats = await partsApi.listCategories(token!);
            setCategories(cats);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPart) {
                if (isAdmin && editingPart.owner) { // Assuming Part has owner
                     await partsApi.updatePartAsAdmin(editingPart.owner.id, editingPart.id, formData, token!);
                } else {
                    await partsApi.updateMyPart(editingPart.id, formData, token!);
                }
            } else {
                if (isAdmin && adminClientId) {
                    await partsApi.createPartAsAdmin(adminClientId, formData, token!);
                } else {
                    await partsApi.createMyPart(formData, token!);
                }
            }
            setIsModalOpen(false);
            setEditingPart(null);
            resetForm();
            fetchData();
        } catch (err) {
            alert('Error al guardar pieza');
        }
    };

    const executeDelete = async () => {
        if (!partToDelete) return;
        try {
            if (isAdmin && partToDelete.owner) {
                await partsApi.deletePartAsAdmin(partToDelete.owner.id, partToDelete.id, token!);
            } else {
                await partsApi.deleteMyPart(partToDelete.id, token!);
            }
            setPartToDelete(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    const openCreate = () => {
        setEditingPart(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (p: Part) => {
        setEditingPart(p);
        setFormData({
            categoryId: p.category.id, // Assuming Part has category object with id
            description: p.description
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            categoryId: categories[0]?.id || 0,
            description: ''
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {adminClientId ? 'Gestión de Piezas' : isAdmin ? 'Inventario Global' : 'Mis Piezas'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        {adminClientId 
                            ? 'Gestiona el inventario de piezas de este cliente.' 
                            : isAdmin 
                                ? 'Visualiza y gestiona todas las piezas y repuestos de los clientes.'
                                : 'Gestiona tus piezas y repuestos propios.'}
                    </p>
                </div>
                {!isAdmin && (
                <button
                    onClick={openCreate}
                    className="group relative flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold h-12 px-8 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                    <span className="text-base">Registrar Pieza</span>
                </button>
                )}
            </div>

            {/* Filters Section (Admin only) */}
            {isAdmin && !adminClientId && (
                <div className="mb-10 bg-white dark:bg-[#1a2632] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center">
                    <div className="pl-4 pr-3 text-gray-400">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </div>
                    <input
                        className="w-full h-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 border-none focus:ring-0 text-base"
                        placeholder="Buscar por descripción, categoría o propietario..."
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
                ) : parts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2632] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[48px]">extension</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {query ? 'No se encontraron piezas' : 'No hay piezas registradas'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                            {query 
                                ? 'Intenta ajustar los términos de búsqueda para encontrar lo que necesitas.'
                                : isAdmin 
                                    ? 'Aún no hay piezas registradas en el sistema.' 
                                    : 'Registra piezas propias para tener un control de tu inventario personal.'}
                        </p>
                        {!isAdmin && (
                        <button onClick={openCreate} className="text-primary font-bold hover:underline flex items-center gap-2">
                            <span className="material-symbols-outlined">add</span>
                            Agregar mi primera pieza
                        </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {parts.map((part) => (
                            <div 
                                key={part.id} 
                                onClick={() => openEdit(part)}
                                className="group relative cursor-pointer bg-white dark:bg-[#1a2632] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors duration-300">
                                        <span className="material-symbols-outlined text-[32px]">
                                            extension
                                        </span>
                                    </div>
                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {part.category?.name || 'General'}
                                    </span>
                                </div>

                                {/* Part Info */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                                        {part.description}
                                    </h3>
                                    {isAdmin && part.owner && (
                                        <p className="text-sm text-gray-500">
                                            Propietario: {part.owner.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEdit(part); }}
                                        className="flex-1 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Editar
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setPartToDelete(part); }}
                                        className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                                        title="Eliminar pieza"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#1a2632] rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="flex-none px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {editingPart ? 'Editar Pieza' : 'Nueva Pieza'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    Completá los datos de la pieza.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all transform hover:rotate-90"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="part-form" onSubmit={handleSave} className="space-y-6">
                                {/* Category Select */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">
                                        Categoría
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-medium transition-all"
                                            value={formData.categoryId}
                                            onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                                        >
                                            <option value="" disabled>Seleccione una categoría</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-32 transition-all"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Ej: Carburador Weber 40/40, Juego de Pistones Forjados..."
                                    />
                                </div>
                            </form>

                            {/* Booking History Section */}
                            {editingPart && (
                                <div className="mt-8 animate-fade-in border-t border-gray-100 dark:border-gray-800 pt-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Historial de Uso
                                    </h3>
                                    
                                    {loadingBookings ? (
                                        <div className="flex justify-center p-4"><Loading /></div>
                                    ) : partBookings.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-center">
                                            No hay registros de uso para esta pieza.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {partBookings.map(booking => (
                                                <div 
                                                    key={booking.id} 
                                                    onClick={() => navigate(`/dashboard/repair/${booking.id}`)}
                                                    className="cursor-pointer p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center group hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
                                                    title="Ver detalles de la reparación"
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
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate max-w-[200px]">
                                                            {booking.vehicle 
                                                                ? `${booking.vehicle.brand?.name || booking.vehicle.brandOther} ${booking.vehicle.model}`
                                                                : 'Vehículo N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-gray-400 block mb-1">Costo Mano de Obra</span>
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            ${booking.laborCost || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-none px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="part-form"
                                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                            >
                                {editingPart ? 'Guardar Cambios' : 'Registrar Pieza'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {partToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setPartToDelete(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#1a2632] rounded-3xl p-6 shadow-2xl animate-scale-in text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-[32px]">warning</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            ¿Eliminar pieza?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Esta acción no se puede deshacer. Se eliminará permanentemente la pieza.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPartToDelete(null)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeDelete}
                                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
