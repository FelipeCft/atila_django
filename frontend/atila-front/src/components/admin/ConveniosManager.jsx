import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Check, Search, FileText, Power, PowerOff } from 'lucide-react';
import { getConvenios, createConvenio, updateConvenio, deleteConvenio, toggleConvenioActive } from '../../api/Convenios';
import { getRequisitos, createRequisito, deleteRequisito, updateRequisito, toggleRequisitoActive } from '../../api/Requisitos';
import { getServicios } from '../../api/Servicios';
import { ui } from '../../utilities/ui';
import { BENEFIT_TYPES } from '../../utilities/constants';

const ConveniosManager = () => {
    const [convenios, setConvenios] = useState([]);
    const [services, setServices] = useState([]);
    const [allRequisitos, setAllRequisitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [currentConvenio, setCurrentConvenio] = useState(null);
    const [filters, setFilters] = useState({
        tipo: 'ALL',
        estado: 'ALL' // ALL, ACTIVE, INACTIVE
    });

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'CONVENIO_ATILA',
        descripcion: '',
        servicios: [], // Array of IDs
        requisitos: [], // Array of IDs (M2M)
        activo: true
    });

    // Inline requisito creation state
    const [newRequisito, setNewRequisito] = useState({ nombre: '', descripcion: '' });
    const [isCreatingRequisito, setIsCreatingRequisito] = useState(false);

    const [serviceSearchTerm, setServiceSearchTerm] = useState('');
    const [serviceFilterMode, setServiceFilterMode] = useState('ALL');
    const [requisitoSearchTerm, setRequisitoSearchTerm] = useState('');
    const [requisitoFilterMode, setRequisitoFilterMode] = useState('ALL');

    // Requisitos manager state
    const [reqManagerSearch, setReqManagerSearch] = useState('');
    const [editingRequisito, setEditingRequisito] = useState(null);
    const [editReqData, setEditReqData] = useState({ nombre: '', descripcion: '' });
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);
    const [isNewReqMode, setIsNewReqMode] = useState(false);

    // --- ESTADO Y CONSTANTES ---
    const TIPOS = Object.keys(BENEFIT_TYPES).map(key => ({
        value: key,
        ...BENEFIT_TYPES[key]
    }));

    // --- CARGA DE DATOS ---
    const loadData = async () => {
        try {
            setLoading(true);
            const [conveniosRes, servicesRes, requisitosRes] = await Promise.all([
                getConvenios(),
                getServicios(),
                getRequisitos()
            ]);
            setConvenios(conveniosRes.data);
            setServices(servicesRes);
            setAllRequisitos(requisitosRes.data);
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

    // --- GESTIÓN DEL MODAL Y FORMULARIO ---
    const openModal = (convenio = null, viewMode = false) => {
        setIsViewMode(viewMode);
        if (convenio) {
            setCurrentConvenio(convenio);
            setFormData({
                nombre: convenio.nombre,
                tipo: convenio.tipo,
                descripcion: convenio.descripcion || '',
                servicios: convenio.servicios || [],
                requisitos: convenio.requisitos || [], // Now array of IDs
                activo: convenio.activo
            });
        } else {
            setCurrentConvenio(null);
            setFormData({
                nombre: '',
                tipo: 'CONVENIO_ATILA',
                descripcion: '',
                servicios: [],
                requisitos: [],
                activo: true
            });
        }
        setNewRequisito({ nombre: '', descripcion: '' });
        setIsCreatingRequisito(false);
        setServiceSearchTerm('');
        setServiceFilterMode('ALL');
        setRequisitoSearchTerm('');
        setRequisitoFilterMode('ALL');
        setIsModalOpen(true);
    };

    // --- ACCIONES CRUD (ELIMINAR / GUARDAR) ---
    const handleDelete = async (id) => {
        const confirmed = await ui.confirm({
            title: '¿Eliminar convenio?',
            message: 'Solo se puede eliminar si no tiene servicios asociados. De lo contrario, desactívelo.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteConvenio(id);
            ui.success('Convenio eliminado correctamente');
            loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.[0] || 'Error al eliminar convenio';
            ui.error(msg);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await toggleConvenioActive(id);
            ui.success(res.data?.message || 'Estado actualizado');
            loadData();
        } catch (error) {
            ui.error('Error al cambiar estado del convenio');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentConvenio) {
                await updateConvenio(currentConvenio.id, formData);
                ui.success('Convenio actualizado correctamente');
            } else {
                await createConvenio(formData);
                ui.success('Convenio creado correctamente');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            ui.error(ui.getApiErrorMessage(error, 'Error al guardar convenio'));
        }
    };

    // --- MANEJO DE SELECCIÓN DE SERVICIOS ---
    const toggleService = (serviceId) => {
        setFormData(prev => {
            const exists = prev.servicios.includes(serviceId);
            if (exists) {
                return { ...prev, servicios: prev.servicios.filter(id => id !== serviceId) };
            } else {
                return { ...prev, servicios: [...prev.servicios, serviceId] };
            }
        });
    };

    // --- MANEJO DE SELECCIÓN DE REQUISITOS (M2M) ---
    const toggleRequisito = (requisitoId) => {
        setFormData(prev => {
            const exists = prev.requisitos.includes(requisitoId);
            if (exists) {
                return { ...prev, requisitos: prev.requisitos.filter(id => id !== requisitoId) };
            } else {
                return { ...prev, requisitos: [...prev.requisitos, requisitoId] };
            }
        });
    };

    const handleCreateRequisito = async () => {
        if (!newRequisito.nombre.trim()) return;
        try {
            const response = await createRequisito(newRequisito);
            const created = response.data;
            // Add to global list and auto-select it
            setAllRequisitos(prev => [...prev, created]);
            setFormData(prev => ({
                ...prev,
                requisitos: [...prev.requisitos, created.id]
            }));
            setNewRequisito({ nombre: '', descripcion: '' });
            setIsCreatingRequisito(false);
            ui.success('Requisito creado y asociado');
        } catch (error) {
            console.error(error);
            ui.error(ui.getApiErrorMessage(error, 'Error al crear requisito'));
        }
    };

    // --- REQUISITOS MANAGER CRUD ---
    const openReqModal = (requisito = null) => {
        if (requisito) {
            setEditingRequisito(requisito);
            setEditReqData({ nombre: requisito.nombre, descripcion: requisito.descripcion || '' });
            setIsNewReqMode(false);
        } else {
            setEditingRequisito(null);
            setEditReqData({ nombre: '', descripcion: '' });
            setIsNewReqMode(true);
        }
        setIsReqModalOpen(true);
    };

    const handleSaveRequisito = async (e) => {
        e.preventDefault();
        if (!editReqData.nombre.trim()) return;
        try {
            if (isNewReqMode) {
                await createRequisito(editReqData);
                ui.success('Requisito creado correctamente');
            } else {
                await updateRequisito(editingRequisito.id, editReqData);
                ui.success('Requisito actualizado correctamente');
            }
            setIsReqModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            ui.error(ui.getApiErrorMessage(error, 'Error al guardar requisito'));
        }
    };

    const handleDeleteRequisito = async (id) => {
        const confirmed = await ui.confirm({
            title: '¿Eliminar requisito?',
            message: 'Solo se puede eliminar si no está asociado a ningún convenio. De lo contrario, desactívelo.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteRequisito(id);
            ui.success('Requisito eliminado correctamente');
            loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.[0] || 'Error al eliminar requisito';
            ui.error(msg);
        }
    };

    const handleToggleRequisitoActive = async (id) => {
        try {
            const res = await toggleRequisitoActive(id);
            ui.success(res.data?.message || 'Estado actualizado');
            loadData();
        } catch (error) {
            ui.error('Error al cambiar estado del requisito');
        }
    };

    // Filtered requisitos for the manager section
    const filteredManagerRequisitos = allRequisitos.filter(req =>
        req.nombre.toLowerCase().includes(reqManagerSearch.toLowerCase()) ||
        (req.descripcion && req.descripcion.toLowerCase().includes(reqManagerSearch.toLowerCase()))
    );

    // Count how many convenios use each requisito
    const getRequisitoUsageCount = (reqId) => {
        return convenios.filter(c => c.requisitos && c.requisitos.includes(reqId)).length;
    };

    // --- LÓGICA DE FILTRADO ---
    const toggleTipoFilter = () => {
        const types = ['ALL', 'FONASA', 'CONVENIO_ATILA', 'PROMOCION'];
        const currentIndex = types.indexOf(filters.tipo);
        const nextIndex = (currentIndex + 1) % types.length;
        setFilters(prev => ({ ...prev, tipo: types[nextIndex] }));
    };

    const toggleEstadoFilter = () => {
        const states = ['ALL', 'ACTIVE', 'INACTIVE'];
        const currentIndex = states.indexOf(filters.estado);
        const nextIndex = (currentIndex + 1) % states.length;
        setFilters(prev => ({ ...prev, estado: states[nextIndex] }));
    };

    const filteredConvenios = convenios.filter(c => {
        const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filters.tipo === 'ALL' || c.tipo === filters.tipo;
        const matchesEstado = filters.estado === 'ALL' ||
            (filters.estado === 'ACTIVE' && c.activo) ||
            (filters.estado === 'INACTIVE' && !c.activo);

        return matchesSearch && matchesTipo && matchesEstado;
    });

    // --- RENDERIZADO PRINCIPAL ---
    return (
        <div className="space-y-6">
            {/* ENCABEZADO Y BÚSQUEDA */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Convenios</h2>
                    <p className="text-slate-400 text-sm">Administra convenios y beneficios (Fonasa, Isapre, etc.)</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative grow md:grow-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar convenio..."
                            className="w-full md:w-64 pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn btn-primary flex items-center gap-2 px-6 rounded-xl shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        <span className="hidden md:inline">Nuevo Convenio</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Convenio</th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleTipoFilter}
                                >
                                    <div className="flex items-center gap-2">
                                        Tipo
                                        {filters.tipo !== 'ALL' && (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                                                {TIPOS.find(t => t.value === filters.tipo)?.label}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Servicios</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Requisitos</th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                                    onClick={toggleEstadoFilter}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Estado
                                        {filters.estado !== 'ALL' && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${filters.estado === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {filters.estado === 'ACTIVE' ? 'Activos' : 'Inactivos'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">Cargando convenios...</td>
                                </tr>
                            ) : filteredConvenios.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">No se encontraron convenios</td>
                                </tr>
                            ) : (
                                filteredConvenios.map((convenio) => {
                                    const tipoInfo = TIPOS.find(t => t.value === convenio.tipo) || TIPOS[1];
                                    return (
                                        <tr
                                            key={convenio.id}
                                            onClick={() => openModal(convenio, true)}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tipoInfo.color} overflow-hidden shadow-none`}>
                                                        <tipoInfo.icon size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{convenio.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${tipoInfo.color}`}>
                                                    {tipoInfo.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 font-medium text-sm">
                                                    <Check size={14} className="text-emerald-500" />
                                                    {convenio.servicios.length}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 font-medium text-sm">
                                                    <FileText size={14} className="text-sky-500" />
                                                    {convenio.requisitos.length}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className={`inline-block w-3 h-3 rounded-full ${convenio.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} title={convenio.activo ? 'Activo' : 'Inactivo'} />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleActive(convenio.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${convenio.activo ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                        title={convenio.activo ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {convenio.activo ? <PowerOff size={18} /> : <Power size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal(convenio);
                                                        }}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(convenio.id);
                                                        }}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE CREACIÓN / EDICIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-slate-800">
                                {isViewMode ? 'Detalle del Convenio' : (currentConvenio ? 'Editar Convenio' : 'Nuevo Convenio')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form id="convenioForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Convenio</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isViewMode}
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isViewMode ? 'bg-slate-50 border-transparent text-slate-600' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Tipo de Convenio</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {TIPOS.map(t => {
                                                const isSelected = formData.tipo === t.value;
                                                return (
                                                    <button
                                                        key={t.value}
                                                        type="button"
                                                        disabled={isViewMode}
                                                        onClick={() => !isViewMode && setFormData({ ...formData, tipo: t.value })}
                                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isViewMode
                                                            ? (isSelected ? 'border-primary bg-primary/5' : 'opacity-50 border-transparent bg-slate-50 grayscale')
                                                            : (isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50')
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg flex items-center justify-center shadow-none ${isSelected ? t.color : 'bg-slate-100 text-slate-400'}`}>
                                                            <t.icon size={24} />
                                                        </div>
                                                        <span className={`text-xs font-bold text-center ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                                            {t.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${isViewMode ? 'bg-slate-50 border-transparent' : 'border-slate-200'}`}>
                                            <input
                                                type="checkbox"
                                                id="activo"
                                                disabled={isViewMode}
                                                className="w-5 h-5 rounded text-primary focus:ring-primary disabled:opacity-50"
                                                checked={formData.activo}
                                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            />
                                            <label htmlFor="activo" className="text-slate-600 font-medium cursor-pointer">Activo</label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                                        <textarea
                                            disabled={isViewMode}
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all min-h-[80px] ${isViewMode ? 'bg-slate-50 border-transparent text-slate-600 resize-none' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        />
                                    </div>

                                    {/* SECCIÓN DE SERVICIOS ASOCIADOS */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-slate-700">Servicios Asociados</label>
                                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                                {!isViewMode && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setServiceFilterMode('ALL')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${serviceFilterMode === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            Todos
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setServiceFilterMode('SELECTED')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${serviceFilterMode === 'SELECTED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            Seleccionados
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setServiceFilterMode('UNSELECTED')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${serviceFilterMode === 'UNSELECTED' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            No Seleccionados
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {!isViewMode && (
                                            <div className="relative mb-2">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar servicio..."
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    value={serviceSearchTerm}
                                                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className={`bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto space-y-2 custom-scrollbar ${isViewMode ? 'opacity-90' : ''}`}>
                                            {services
                                                .filter(service => {
                                                    if (isViewMode) {
                                                        return formData.servicios.includes(service.id);
                                                    }
                                                    const matchesSearch = service.nombre.toLowerCase().includes(serviceSearchTerm.toLowerCase());
                                                    const isSelected = formData.servicios.includes(service.id);

                                                    if (serviceFilterMode === 'SELECTED') return isSelected && matchesSearch;
                                                    if (serviceFilterMode === 'UNSELECTED') return !isSelected && matchesSearch;
                                                    return matchesSearch;
                                                })
                                                .sort((a, b) => {
                                                    if (isViewMode) return 0;
                                                    const aSelected = formData.servicios.includes(a.id);
                                                    const bSelected = formData.servicios.includes(b.id);
                                                    if (aSelected === bSelected) return 0;
                                                    return aSelected ? -1 : 1;
                                                })
                                                .map(service => (
                                                    <label key={service.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${!isViewMode && 'cursor-pointer group'} ${formData.servicios.includes(service.id) ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-100 hover:border-primary/30'}`}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={isViewMode}
                                                            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary disabled:opacity-50"
                                                            checked={formData.servicios.includes(service.id)}
                                                            onChange={() => !isViewMode && toggleService(service.id)}
                                                        />
                                                        <div>
                                                            <p className={`font-bold transition-colors ${formData.servicios.includes(service.id) ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>{service.nombre}</p>
                                                            <p className="text-xs text-slate-400">${parseFloat(service.precio).toLocaleString()}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            {services.length === 0 && <p className="text-center text-slate-400 text-sm">No hay servicios disponibles</p>}
                                        </div>
                                    </div>

                                    {/* SECCIÓN DE REQUISITOS (M2M con búsqueda/selección) */}
                                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-slate-700">Requisitos del Convenio</label>
                                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                                {!isViewMode && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRequisitoFilterMode('ALL')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${requisitoFilterMode === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            Todos
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRequisitoFilterMode('SELECTED')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${requisitoFilterMode === 'SELECTED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            Seleccionados
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRequisitoFilterMode('UNSELECTED')}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${requisitoFilterMode === 'UNSELECTED' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            No Seleccionados
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {!isViewMode && (
                                            <div className="relative mb-2">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar requisito existente..."
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                    value={requisitoSearchTerm}
                                                    onChange={(e) => setRequisitoSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className={`bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto space-y-2 custom-scrollbar ${isViewMode ? 'opacity-90' : ''}`}>
                                            {allRequisitos
                                                .filter(req => {
                                                    if (isViewMode) {
                                                        return formData.requisitos.includes(req.id);
                                                    }
                                                    const matchesSearch = req.nombre.toLowerCase().includes(requisitoSearchTerm.toLowerCase()) ||
                                                        (req.descripcion && req.descripcion.toLowerCase().includes(requisitoSearchTerm.toLowerCase()));
                                                    const isSelected = formData.requisitos.includes(req.id);

                                                    if (requisitoFilterMode === 'SELECTED') return isSelected && matchesSearch;
                                                    if (requisitoFilterMode === 'UNSELECTED') return !isSelected && matchesSearch;
                                                    return matchesSearch;
                                                })
                                                .sort((a, b) => {
                                                    if (isViewMode) return 0;
                                                    const aSelected = formData.requisitos.includes(a.id);
                                                    const bSelected = formData.requisitos.includes(b.id);
                                                    if (aSelected === bSelected) return 0;
                                                    return aSelected ? -1 : 1;
                                                })
                                                .map(req => (
                                                    <label key={req.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${!isViewMode && 'cursor-pointer group'} ${formData.requisitos.includes(req.id) ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-100 hover:border-primary/30'}`}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={isViewMode}
                                                            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary disabled:opacity-50"
                                                            checked={formData.requisitos.includes(req.id)}
                                                            onChange={() => !isViewMode && toggleRequisito(req.id)}
                                                        />
                                                        <div>
                                                            <p className={`font-bold transition-colors ${formData.requisitos.includes(req.id) ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>{req.nombre}</p>
                                                            {req.descripcion && <p className="text-xs text-slate-400">{req.descripcion}</p>}
                                                        </div>
                                                    </label>
                                                ))}
                                            {allRequisitos.length === 0 && !isViewMode && (
                                                <p className="text-center text-slate-400 text-sm py-2">No hay requisitos disponibles. Crea uno nuevo abajo.</p>
                                            )}
                                            {isViewMode && formData.requisitos.length === 0 && (
                                                <p className="text-center text-slate-400 text-sm py-2 italic">No hay requisitos asociados a este convenio</p>
                                            )}
                                        </div>

                                        {/* Crear nuevo requisito inline */}
                                        {!isViewMode && (
                                            <div className="mt-3">
                                                {isCreatingRequisito ? (
                                                    <div className="bg-white p-4 rounded-xl border border-primary/20 shadow-sm space-y-3">
                                                        <p className="text-sm font-bold text-slate-700">Crear nuevo requisito</p>
                                                        <input
                                                            type="text"
                                                            placeholder="Nombre del requisito (ej: Certificado de alumno regular)"
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                                            value={newRequisito.nombre}
                                                            onChange={(e) => setNewRequisito({ ...newRequisito, nombre: e.target.value })}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Descripción (opcional)"
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                                            value={newRequisito.descripcion}
                                                            onChange={(e) => setNewRequisito({ ...newRequisito, descripcion: e.target.value })}
                                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateRequisito())}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={handleCreateRequisito}
                                                                disabled={!newRequisito.nombre.trim()}
                                                                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={16} />
                                                                Crear y Asociar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => { setIsCreatingRequisito(false); setNewRequisito({ nombre: '', descripcion: '' }); }}
                                                                className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreatingRequisito(true)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                                                    >
                                                        <Plus size={16} />
                                                        Crear nuevo requisito
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 pt-4 border-t border-slate-50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                {isViewMode ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!isViewMode && (
                                <button
                                    type="submit"
                                    form="convenioForm"
                                    className="flex-1 btn btn-primary py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Guardar Convenio
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* SECCIÓN GESTIÓN DE REQUISITOS */}
            {/* ========================================= */}
            <div className="mt-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gestión de Requisitos</h2>
                        <p className="text-slate-400 text-sm">Administra requisitos reutilizables entre convenios</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative grow md:grow-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar requisito..."
                                className="w-full md:w-64 pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={reqManagerSearch}
                                onChange={(e) => setReqManagerSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => openReqModal()}
                            className="btn btn-primary flex items-center gap-2 px-6 rounded-xl shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            <span className="hidden md:inline">Nuevo Requisito</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requisito</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Usado en</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400">Cargando requisitos...</td>
                                    </tr>
                                ) : filteredManagerRequisitos.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400">
                                            {allRequisitos.length === 0 ? 'No hay requisitos creados aún' : 'No se encontraron requisitos'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredManagerRequisitos.map((req) => {
                                        const usageCount = getRequisitoUsageCount(req.id);
                                        return (
                                            <tr
                                                key={req.id}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                                                            <FileText size={18} className="text-sky-500" />
                                                        </div>
                                                        <span className="font-bold text-slate-700">{req.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-slate-500 line-clamp-1">{req.descripcion || '—'}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${usageCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                                                        }`}>
                                                        {usageCount} {usageCount === 1 ? 'convenio' : 'convenios'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleToggleRequisitoActive(req.id)}
                                                            className={`p-2 rounded-lg transition-colors ${req.activo !== false ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                            title={req.activo !== false ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {req.activo !== false ? <PowerOff size={18} /> : <Power size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => openReqModal(req)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                            title="Editar requisito"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRequisito(req.id)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                            title="Eliminar requisito"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE EDICIÓN / CREACIÓN DE REQUISITO */}
            {isReqModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-4xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-slate-800">
                                {isNewReqMode ? 'Nuevo Requisito' : 'Editar Requisito'}
                            </h3>
                            <button onClick={() => setIsReqModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRequisito} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="Ej: Certificado de alumno regular"
                                    value={editReqData.nombre}
                                    onChange={(e) => setEditReqData({ ...editReqData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[80px]"
                                    placeholder="Descripción del requisito (opcional)"
                                    value={editReqData.descripcion}
                                    onChange={(e) => setEditReqData({ ...editReqData, descripcion: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReqModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {isNewReqMode ? 'Crear Requisito' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConveniosManager;
