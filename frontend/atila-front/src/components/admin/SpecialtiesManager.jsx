import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, Tag, AlertCircle, Users, Activity, Power, PowerOff } from 'lucide-react';
import { getEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad, toggleEspecialidadActive } from '../../api/Especialidades';
import { getServicios } from '../../api/Servicios';
import { getAllUsers } from '../../api/userService';
import { ui } from '../../utilities/ui';

const SpecialtiesManager = () => {
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEspecialidad, setCurrentEspecialidad] = useState(null);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        profesionales: [],
        servicios: []
    });

    const [serviceSearchTerm, setServiceSearchTerm] = useState('');
    const [serviceFilterMode, setServiceFilterMode] = useState('ALL'); // 'ALL', 'SELECTED', 'UNSELECTED'

    const [professionalSearchTerm, setProfessionalSearchTerm] = useState('');
    const [professionalFilterMode, setProfessionalFilterMode] = useState('ALL'); // 'ALL', 'SELECTED', 'UNSELECTED'

    const loadData = async () => {
        try {
            setLoading(true);
            const [especialidadesRes, servicesRes, usersRes] = await Promise.all([
                getEspecialidades(),
                getServicios(),
                getAllUsers()
            ]);
            setEspecialidades(especialidadesRes.data);
            setServices(servicesRes);
            const staffAndAdmins = usersRes.filter(u => u.role === 'STAFF' || u.role === 'ADMIN');
            setProfessionals(staffAndAdmins);
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

    const openModal = (especialidad = null) => {
        if (especialidad) {
            setCurrentEspecialidad(especialidad);
            setFormData({
                nombre: especialidad.nombre,
                descripcion: especialidad.descripcion || '',
                profesionales: especialidad.profesionales || [],
                servicios: especialidad.servicios || []
            });
        } else {
            setCurrentEspecialidad(null);
            setFormData({
                nombre: '',
                descripcion: '',
                profesionales: [],
                servicios: []
            });
        }
        setServiceSearchTerm('');
        setServiceFilterMode('ALL');
        setProfessionalSearchTerm('');
        setProfessionalFilterMode('ALL');
        setIsModalOpen(true);
    };

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

    const handleDelete = async (id) => {
        const confirmed = await ui.confirm({
            title: '¿Eliminar especialidad?',
            message: 'Solo se puede eliminar si no tiene servicios ni profesionales asociados. De lo contrario, desactívela.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteEspecialidad(id);
            ui.success('Especialidad eliminada correctamente');
            loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.[0] || 'Error al eliminar especialidad';
            ui.error(msg);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await toggleEspecialidadActive(id);
            ui.success(res.data?.message || 'Estado actualizado');
            loadData();
        } catch (error) {
            ui.error('Error al cambiar estado de la especialidad');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = formData.nombre.trim();
        if (trimmedName.length < 3) {
            ui.error('El nombre de la especialidad debe tener al menos 3 caracteres.');
            return;
        }

        const dataToSend = {
            ...formData,
            nombre: trimmedName,
            servicios: formData.servicios
        };

        try {
            if (currentEspecialidad) {
                await updateEspecialidad(currentEspecialidad.id, dataToSend);
                ui.success('Especialidad actualizada correctamente');
            } else {
                await createEspecialidad(dataToSend);
                ui.success('Especialidad creada correctamente');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            ui.error(ui.getApiErrorMessage(error, 'Error al guardar especialidad'));
        }
    };

    const filteredEspecialidades = especialidades.filter(esp =>
        esp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Especialidades</h1>
                    <p className="text-slate-500 mt-1">Administra las especialidades de tus servicios</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/30"
                >
                    <Plus size={20} />
                    <span>Nueva Especialidad</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar especialidades..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Especialidades Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Nombre</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Descripción</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Profesionales</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Servicios</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">Cargando especialidades...</td>
                                </tr>
                            ) : filteredEspecialidades.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">No se encontraron especialidades</td>
                                </tr>
                            ) : (
                                filteredEspecialidades.map((especialidad) => (
                                    <tr key={especialidad.id} className={`hover:bg-slate-50/50 transition-colors group ${especialidad.activo === false ? 'opacity-60' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${especialidad.activo === false ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    <Tag size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700">{especialidad.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                                            {especialidad.descripcion || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Users size={16} className="text-slate-400" />
                                                <span>{especialidad.profesionales?.length || 0} prof.</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 font-medium text-sm">
                                                <Activity size={14} className="text-primary" />
                                                {especialidad.servicios?.length || 0}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${especialidad.activo !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${especialidad.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {especialidad.activo !== false ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleActive(especialidad.id)}
                                                    className={`p-2 rounded-lg transition-colors ${especialidad.activo !== false ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                    title={especialidad.activo !== false ? 'Desactivar' : 'Activar'}
                                                >
                                                    {especialidad.activo !== false ? <PowerOff size={18} /> : <Power size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => openModal(especialidad)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(especialidad.id)}
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">
                                {currentEspecialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="especialidadForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            placeholder="Ej: Dental, Kinesiología"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none h-24"
                                            placeholder="Breve descripción de la especialidad..."
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-slate-700">Profesionales</label>
                                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setProfessionalFilterMode('ALL')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${professionalFilterMode === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setProfessionalFilterMode('SELECTED')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${professionalFilterMode === 'SELECTED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Selec.
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setProfessionalFilterMode('UNSELECTED')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${professionalFilterMode === 'UNSELECTED' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    No Selec.
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar profesional..."
                                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                                value={professionalSearchTerm}
                                                onChange={(e) => setProfessionalSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 h-[240px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50 custom-scrollbar">
                                            {professionals
                                                .filter(prof => {
                                                    const matchesSearch = prof.full_name.toLowerCase().includes(professionalSearchTerm.toLowerCase()) ||
                                                        (prof.position && prof.position.toLowerCase().includes(professionalSearchTerm.toLowerCase()));
                                                    const isSelected = formData.profesionales.includes(prof.user_id);

                                                    if (professionalFilterMode === 'SELECTED') return isSelected && matchesSearch;
                                                    if (professionalFilterMode === 'UNSELECTED') return !isSelected && matchesSearch;
                                                    return matchesSearch;
                                                })
                                                .sort((a, b) => {
                                                    const aSelected = formData.profesionales.includes(a.user_id);
                                                    const bSelected = formData.profesionales.includes(b.user_id);
                                                    if (aSelected === bSelected) return 0;
                                                    return aSelected ? -1 : 1;
                                                })
                                                .map(prof => (
                                                    <label key={prof.user_id} className={`flex items-center gap-3 p-3 bg-white border cursor-pointer transition-all rounded-lg ${formData.profesionales.includes(prof.user_id) ? 'border-primary/30 bg-primary/5' : 'border-slate-100 hover:border-primary/30'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary shrink-0"
                                                            checked={formData.profesionales.includes(prof.user_id)}
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    profesionales: isChecked
                                                                        ? [...prev.profesionales, prof.user_id]
                                                                        : prev.profesionales.filter(id => id !== prof.user_id)
                                                                }));
                                                            }}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className={`font-medium truncate transition-colors ${formData.profesionales.includes(prof.user_id) ? 'text-primary' : 'text-slate-700'}`} title={prof.full_name}>{prof.full_name}</p>
                                                            <p className="text-xs text-slate-500 truncate" title={prof.position || prof.role}>{prof.position || prof.role}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            {professionals.length === 0 && <p className="text-center text-slate-400 text-sm p-4">No hay profesionales.</p>}
                                        </div>
                                    </div>

                                    {/* SERVICIOS ASOCIADOS SECTION */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-slate-700">Servicios</label>
                                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setServiceFilterMode('ALL')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${serviceFilterMode === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setServiceFilterMode('SELECTED')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${serviceFilterMode === 'SELECTED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Selec.
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setServiceFilterMode('UNSELECTED')}
                                                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${serviceFilterMode === 'UNSELECTED' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    No Selec.
                                                </button>
                                            </div>
                                        </div>
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
                                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 h-[240px] overflow-y-auto space-y-2 custom-scrollbar">
                                            {services
                                                .filter(service => {
                                                    const matchesSearch = service.nombre.toLowerCase().includes(serviceSearchTerm.toLowerCase());
                                                    const isSelected = formData.servicios.includes(service.id);

                                                    if (serviceFilterMode === 'SELECTED') return isSelected && matchesSearch;
                                                    if (serviceFilterMode === 'UNSELECTED') return !isSelected && matchesSearch;
                                                    return matchesSearch;
                                                })
                                                .sort((a, b) => {
                                                    const aSelected = formData.servicios.includes(a.id);
                                                    const bSelected = formData.servicios.includes(b.id);
                                                    if (aSelected === bSelected) return 0;
                                                    return aSelected ? -1 : 1;
                                                })
                                                .map(service => (
                                                    <label key={service.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.servicios.includes(service.id) ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-100 hover:border-primary/30'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary shrink-0"
                                                            checked={formData.servicios.includes(service.id)}
                                                            onChange={() => toggleService(service.id)}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className={`font-bold truncate transition-colors ${formData.servicios.includes(service.id) ? 'text-primary' : 'text-slate-700'}`} title={service.nombre}>{service.nombre}</p>
                                                            <p className="text-xs text-slate-400">${parseFloat(service.precio).toLocaleString()}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            {services.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No hay servicios.</p>}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="especialidadForm"
                                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                <span>Guardar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialtiesManager;
