import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Activity, DollarSign, FileText, Search, Tag, CheckCircle, XCircle, Clock, Power, PowerOff } from 'lucide-react';
import { getServicios, createServicio, updateServicio, deleteServicio, toggleServicioActive } from '../../api/Servicios';
import { getEspecialidades } from '../../api/Especialidades';
import { getConvenios } from '../../api/Convenios';
import { ui } from '../../utilities/ui';

import { BENEFIT_TYPES } from '../../utilities/constants';

const ServicesManager = () => {
    const TIPOS = BENEFIT_TYPES;
    const [services, setServices] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        especialidad: '',
        duracion: 30,
        activo: true,
        convenio_ids: []
    });

    // Additional state for convenios selection
    const [convenios, setConvenios] = useState([]);
    const [convenioSearchTerm, setConvenioSearchTerm] = useState('');
    const [convenioFilterMode, setConvenioFilterMode] = useState('ALL'); // 'ALL', 'SELECTED', 'UNSELECTED'

    // Filters state
    const [filters, setFilters] = useState({
        especialidad: 'ALL',
        convenio: 'ALL',
        estado: 'ALL'
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [servResponse, espResponse, convResponse] = await Promise.all([
                getServicios(),
                getEspecialidades(),
                getConvenios()
            ]);
            setServices(servResponse);
            setEspecialidades(espResponse.data);
            setConvenios(convResponse.data);
        } catch (error) {
            console.error("Error loading data:", error);
            ui.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

    const openModal = (service = null) => {
        if (service) {
            setCurrentService(service);
            setFormData({
                nombre: service.nombre,
                precio: service.precio,
                descripcion: service.descripcion,
                especialidad: service.especialidad || '',
                duracion: service.duracion || 30,
                activo: service.activo !== undefined ? service.activo : true,
                convenio_ids: service.convenios ? service.convenios.map(c => c.id) : []
            });
        } else {
            setCurrentService(null);
            setFormData({
                nombre: '',
                precio: '',
                descripcion: '',
                especialidad: '',
                duracion: 30,
                activo: true,
                convenio_ids: []
            });
        }
        setConvenioSearchTerm('');
        setConvenioFilterMode('ALL');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await ui.confirm({
            title: '¿Eliminar servicio?',
            message: 'Solo se puede eliminar si no tiene citas asociadas. De lo contrario, desactívelo.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteServicio(id);
            ui.success('Servicio eliminado correctamente');
            loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.[0] || 'Error al eliminar servicio';
            ui.error(msg);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await toggleServicioActive(id);
            ui.success(res?.message || 'Estado actualizado');
            loadData();
        } catch (error) {
            ui.error('Error al cambiar estado del servicio');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare data, ensure especialidad is null if empty string
            const dataToSend = {
                ...formData,
                especialidad: formData.especialidad || null,
                convenio_ids: formData.convenio_ids
            };

            if (currentService) {
                await updateServicio(currentService.id, dataToSend);
                ui.success('Servicio actualizado correctamente');
            } else {
                await createServicio(dataToSend);
                ui.success('Servicio creado correctamente');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            ui.error(ui.getApiErrorMessage(error, 'Error al guardar servicio'));
        }
    };




    // Filter togglers
    const toggleEspecialidadFilter = () => {
        // Create a list of available specialties plus ALL and NONE
        const availableEspecialidades = ['ALL', 'NONE', ...especialidades.map(e => e.nombre)];
        const currentIndex = availableEspecialidades.indexOf(filters.especialidad);
        const nextIndex = (currentIndex + 1) % availableEspecialidades.length;
        setFilters(prev => ({ ...prev, especialidad: availableEspecialidades[nextIndex] }));
    };

    const toggleConvenioFilter = () => {
        const types = ['ALL', 'NONE', ...Object.keys(TIPOS)];
        const currentIndex = types.indexOf(filters.convenio);
        const nextIndex = (currentIndex + 1) % types.length;
        setFilters(prev => ({ ...prev, convenio: types[nextIndex] }));
    };

    const toggleEstadoFilter = () => {
        const states = ['ALL', 'ACTIVE', 'INACTIVE'];
        const currentIndex = states.indexOf(filters.estado);
        const nextIndex = (currentIndex + 1) % states.length;
        setFilters(prev => ({ ...prev, estado: states[nextIndex] }));
    };

    // Toggle convenio selection for form
    const toggleConvenio = (convenioId) => {
        setFormData(prev => {
            const exists = prev.convenio_ids.includes(convenioId);
            if (exists) {
                return { ...prev, convenio_ids: prev.convenio_ids.filter(id => id !== convenioId) };
            } else {
                return { ...prev, convenio_ids: [...prev.convenio_ids, convenioId] };
            }
        });
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEspecialidad = filters.especialidad === 'ALL' ||
            (filters.especialidad === 'NONE' && (!service.especialidad || service.especialidad === null)) ||
            service.especialidad_nombre === filters.especialidad;

        const matchesConvenio = filters.convenio === 'ALL' ||
            (filters.convenio === 'NONE' && (!service.convenios || service.convenios.length === 0)) ||
            (service.convenios && service.convenios.some(c => c.tipo === filters.convenio));

        const matchesEstado = filters.estado === 'ALL' ||
            (filters.estado === 'ACTIVE' && service.activo) ||
            (filters.estado === 'INACTIVE' && !service.activo);

        return matchesSearch && matchesEspecialidad && matchesConvenio && matchesEstado;
    });

    return (
        <div className="space-y-8 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Servicios</h1>
                    <p className="text-slate-500 mt-1">Administra el catálogo de servicios ofrecidos</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/30"
                >
                    <Plus size={20} />
                    <span>Nuevo Servicio</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar servicios..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 shadow-sm">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Servicio</th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleEspecialidadFilter}
                                >
                                    <div className="flex items-center gap-2">
                                        Especialidad
                                        {filters.especialidad !== 'ALL' && (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                                                {filters.especialidad === 'NONE' ? 'Sin Especialidad' : filters.especialidad}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleConvenioFilter}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Convenios
                                        {filters.convenio !== 'ALL' && (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                                                {filters.convenio === 'NONE' ? 'Sin Convenios' : (TIPOS[filters.convenio]?.label || filters.convenio)}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleEstadoFilter}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Estado
                                        {filters.estado !== 'ALL' && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${filters.estado === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {filters.estado === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Precio</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Duración</th>

                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right sticky right-0 bg-slate-50 z-20 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.05)]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">Cargando servicios...</td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">No se encontraron servicios</td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-700">{service.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">
                                                {service.especialidad_nombre || 'Sin Especialidad'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center -space-x-2 overflow-hidden">
                                                {service.convenios && service.convenios.length > 0 ? (
                                                    service.convenios.slice(0, 3).map((convenio, index) => {
                                                        // Handle potential plural/singular mismatch or unknown types by defaulting to CONVENIO_ATILA
                                                        // similar to how ConveniosManager falls back to TIPOS[1]
                                                        let typeKey = convenio.tipo;
                                                        if (typeKey === 'CONVENIOS_ATILA') typeKey = 'CONVENIO_ATILA';

                                                        const typeInfo = TIPOS[typeKey] || TIPOS['CONVENIO_ATILA'];
                                                        const TipoIcon = typeInfo.icon || FileText;
                                                        const tipoColor = typeInfo.color || 'bg-slate-100 text-slate-600';

                                                        return (
                                                            <div
                                                                key={convenio.id}
                                                                className={`h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center ${tipoColor}`}
                                                                title={`${convenio.nombre} (${typeInfo.label || convenio.tipo})`}
                                                            >
                                                                <TipoIcon size={14} />
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                                {service.convenios && service.convenios.length > 3 && (
                                                    <div className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                                                        +{service.convenios.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div
                                                className={`inline-block w-3 h-3 rounded-full transition-all ring-4 ring-transparent ${service.activo ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'
                                                    }`}
                                                title={service.activo ? 'Activo' : 'Inactivo'}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                                ${parseFloat(service.precio).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-slate-600 text-sm flex items-center justify-center gap-1">
                                                <Clock size={14} className="text-slate-400" />
                                                {service.duracion || 30} min
                                            </span>
                                        </td>

                                        <td className="p-4 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleActive(service.id)}
                                                    className={`p-2 rounded-lg transition-colors ${service.activo ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                    title={service.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {service.activo ? <PowerOff size={18} /> : <Power size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => openModal(service)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {currentService ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Servicio</label>
                                    <div className="relative">
                                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Ej: Consulta General"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Especialidad</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none bg-white"
                                            value={formData.especialidad}
                                            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                                        >
                                            <option value="">Seleccionar Especialidad...</option>
                                            {especialidades.map(esp => (
                                                <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Precio</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                value={formData.precio}
                                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Duración (min)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    value={formData.duracion}
                                                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })}
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 h-[50px]">
                                            <input
                                                type="checkbox"
                                                id="activo"
                                                className="w-5 h-5 rounded text-primary focus:ring-primary"
                                                checked={formData.activo}
                                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            />
                                            <label htmlFor="activo" className="text-slate-600 font-medium cursor-pointer">Activo</label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <textarea
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none h-32"
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                            placeholder="Detalles sobre el servicio..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-slate-700">Convenios Asociados</label>
                                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setConvenioFilterMode('ALL')}
                                                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${convenioFilterMode === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Todos
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConvenioFilterMode('SELECTED')}
                                                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${convenioFilterMode === 'SELECTED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Seleccionados
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConvenioFilterMode('UNSELECTED')}
                                                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${convenioFilterMode === 'UNSELECTED' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                No Selec.
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar convenio..."
                                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={convenioSearchTerm}
                                            onChange={(e) => setConvenioSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                                        {convenios
                                            .filter(convenio => {
                                                const matchesSearch = convenio.nombre.toLowerCase().includes(convenioSearchTerm.toLowerCase());
                                                const isSelected = formData.convenio_ids.includes(convenio.id);
                                                if (convenioFilterMode === 'SELECTED') return matchesSearch && isSelected;
                                                if (convenioFilterMode === 'UNSELECTED') return matchesSearch && !isSelected;
                                                return matchesSearch;
                                            })
                                            .map(convenio => {
                                                const isSelected = formData.convenio_ids.includes(convenio.id);
                                                const TipoIcon = TIPOS[convenio.tipo]?.icon || FileText;
                                                const tipoColor = TIPOS[convenio.tipo]?.color || 'bg-slate-100 text-slate-600';

                                                return (
                                                    <div
                                                        key={convenio.id}
                                                        onClick={() => toggleConvenio(convenio.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                            ? 'bg-white border-primary ring-1 ring-primary shadow-sm'
                                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }} // Handled by parent div click
                                                            className="w-5 h-5 rounded text-primary focus:ring-primary pointer-events-none"
                                                        />
                                                        <div className={`p-1.5 rounded-lg ${tipoColor}`}>
                                                            <TipoIcon size={16} />
                                                        </div>
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                                                            {convenio.nombre}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        {convenios.length === 0 && (
                                            <div className="text-center py-4 text-slate-400 text-sm">
                                                No hay convenios disponibles
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        <span>Guardar</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
        </div >
    );
};

export default ServicesManager;
