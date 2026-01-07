import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { vehiclesApi, UpsertVehiclePayload } from '../../services/vehicles';
import { bookingApi } from '../../services/booking';
import { CustomerVehicle, VehicleBrandOption, VehicleTypeOption } from '../../types/booking';
import Loading from '../../components/Loading';

export default function MyVehicles() {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState<(CustomerVehicle & { owner?: any })[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
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
                await vehiclesApi.updateMyVehicle(editingVehicle.id, formData, token!);
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
            await vehiclesApi.deleteMyVehicle(vehicleToDelete.id, token!);
            setVehicleToDelete(null);
            fetchData();
        } catch (err) {
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

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {isAdmin ? 'Gestión de Flota' : 'Mis Vehículos'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {isAdmin ? 'Administra los vehículos de todos los clientes' : 'Administra tus vehículos registrados'}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Agregar Vehículo</span>
                </button>
            </div>

            {/* Filters (Admin) */}
            {isAdmin && (
                <div className="mt-6 mb-8  bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                     <span className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Buscar por patente, modelo, marca o cliente..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Content */}
            <div className="mt-6">
                {loading ? (
                    <Loading />
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-[#1a2632] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <span className="material-symbols-outlined text-[32px]">directions_car</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay vehículos registrados</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            {isAdmin ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no has registrado ningún vehículo en tu flota personal.'}
                        </p>
                        {!isAdmin && (
                            <button onClick={openCreate} className="mt-6 text-primary font-bold hover:underline">
                                Registrar mi primer vehículo
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((car) => (
                            <div key={car.id} className="group flex flex-col justify-between bg-white dark:bg-[#1a2632] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[28px]">
                                                {car.type?.code === 'MOTO' ? 'two_wheeler' : 'directions_car'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Patente</span>
                                            <span className="block font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                                {car.vinOrPlate || 'S/P'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate" title={`${car.brand?.name || car.brandOther} ${car.model}`}>
                                        {car.brand?.name || car.brandOther} {car.model}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                        Año {car.year || 'N/A'} • {car.type?.name}
                                    </p>

                                    {isAdmin && car.owner && (
                                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                                            <span className="truncate">{car.owner.fullName}</span>
                                        </div>
                                    )}
                                    
                                    {car.notes && (
                                         <div className="pt-2 mt-2 text-xs text-gray-400 italic truncate">
                                            "{car.notes}"
                                         </div>
                                    )}
                                </div>
                                
                                <div className="flex border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                    <button 
                                        onClick={() => openEdit(car)}
                                        className="flex-1 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => setVehicleToDelete(car)}
                                        className="flex-1 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                >
                    <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tipo</label>
                                    <select 
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.typeId}
                                        onChange={e => setFormData({...formData, typeId: Number(e.target.value)})}
                                        required
                                    >
                                        <option value={0} disabled>Seleccionar</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Marca</label>
                                    <select 
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.brandId ?? ''}
                                        onChange={e => {
                                             const val = e.target.value;
                                             // If "Other" is selected (empty value), we don't set a brandId
                                             // However, if we found a brand named 'Otro' or similar in the list and expected that ID, we would use it.
                                             // Based on requirement: "debe ser la que se obtiene del back".
                                             // We will search for a brand named 'Otro' or 'Otra' in the brands list if the user selects the "Other" option.
                                             // If the user selects "Other" option (value ""), we try to find the backend ID for 'Otro'.
                                             
                                             if (val === '') {
                                                 const otherBrand = brands.find(b => b.name.trim().toLowerCase() === 'otro' || b.name.trim().toLowerCase() === 'otra');
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
                                </div>
                            </div>

                            {(formData.brandId === undefined || formData.brandId === brands.find(b => b.name.trim().toLowerCase() === 'otro' || b.name.trim().toLowerCase() === 'otra')?.id) && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Especifique Marca</label>
                                    <input 
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.brandOther}
                                        onChange={e => setFormData({...formData, brandOther: e.target.value})}
                                        placeholder="Ej. Tesla"
                                        required={!formData.brandId || formData.brandId === brands.find(b => b.name.trim().toLowerCase() === 'otro' || b.name.trim().toLowerCase() === 'otra')?.id}
                                    />
                                </div>
                            )}

                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Modelo</label>
                                <input 
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={formData.model}
                                    onChange={e => setFormData({...formData, model: e.target.value})}
                                    placeholder="Ej. Model 3, Corolla, Hilux..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Año</label>
                                    <input 
                                        type="number"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.year}
                                        onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Patente / VIN</label>
                                    <input 
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono uppercase"
                                        value={formData.vinOrPlate}
                                        onChange={e => setFormData({...formData, vinOrPlate: e.target.value.toUpperCase()})}
                                        placeholder="AA000BB"
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notas (Opcional)</label>
                                <textarea 
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-20"
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Detalles adicionales, color, estado..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {vehicleToDelete && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setVehicleToDelete(null);
                    }}
                >
                    <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-[32px]">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar Vehículo?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                Estás a punto de eliminar el <strong>{vehicleToDelete.brand?.name || vehicleToDelete.brandOther} {vehicleToDelete.model}</strong>. 
                                <br/>Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setVehicleToDelete(null)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={executeDelete}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5"
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
