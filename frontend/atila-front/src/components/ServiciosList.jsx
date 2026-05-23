import { getServicios } from "../api/Servicios";
import { getEspecialidades } from "../api/Especialidades";
import { useState, useEffect, useMemo } from "react";
import { Activity, CheckCircle2, Clock, DollarSign, ChevronDown, ChevronUp, AlertCircle, ChevronRight, Search, Filter, X } from "lucide-react";
import { BENEFIT_TYPES } from "../utilities/constants";
import { motion, AnimatePresence } from "framer-motion";

// Helper Functions
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(price);
};

const getUniqueBenefits = (service) => {
    if (!service.convenios || service.convenios.length === 0) return [];
    const uniqueTypes = [...new Set(service.convenios.map(c => c.tipo))];
    return uniqueTypes.map(type => BENEFIT_TYPES[type]).filter(Boolean);
};

// Extracted Component
const ServiceCard = ({ servicio, isExpanded, onToggle }) => {
    const benefits = getUniqueBenefits(servicio);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative group ${isExpanded ? 'md:col-span-2 md:row-span-2' : ''}`}
            style={{ zIndex: isHovered ? 50 : (isExpanded ? 20 : 0) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* STACKED CONVENIO CARDS (Background Layers) */}
            {benefits.map((benefit, idx) => (
                <div
                    key={idx}
                    className={`absolute top-0 left-0 w-full h-full rounded-2xl border transition-all duration-500 ease-out ${benefit.color} shadow-lg`}
                    style={{
                        zIndex: -1 - idx,
                        // If hovered, fan out to right. If not, stack neatly behind (small offset).
                        transform: isHovered
                            ? `translateX(${(idx + 1) * 40}px) translateY(${(idx + 1) * 0}px) rotate(${(idx + 1) * 2}deg)`
                            : `translateX(4px) translateY(4px)`,
                        opacity: isHovered ? 1 : 0 // Hide when not hovered to keep clean look, or 0.9 to peek? User said "desplegable", implying hidden then shown. Let's try 0.
                    }}
                >
                    {/* Content on the convenio card (visible when expanded) */}
                    <div className="absolute right-2 top-2 flex flex-col items-center p-2 rounded-lg">
                        <benefit.icon size={24} className="mb-3 drop-shadow-md" />
                        <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap drop-shadow-sm" style={{ writingMode: 'vertical-rl' }}>{benefit.label}</span>
                    </div>
                </div>
            ))}

            {/* MAIN CARD CONTENT */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col h-full
                    ${isExpanded
                        ? 'border-sky-500/50 shadow-xl shadow-sky-500/10'
                        : 'border-slate-700 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-500/5'
                    }`}
            >
                <div className={`flex flex-col h-full ${isExpanded ? 'md:grid md:grid-cols-2 md:gap-0' : ''}`}>
                    {/* LEFT COLUMN (Always visible info) */}
                    <div className="flex flex-col h-full relative">
                        <motion.div layout="position" className="p-6 pb-4 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl shadow-sm transition-colors ${isExpanded ? 'bg-sky-500 text-white' : 'bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white'}`}>
                                    <Activity size={20} />
                                </div>

                                {/* Benefit Badges (Small indicators on top right of main card to show what's behind) */}
                                {benefits.length > 0 && (
                                    <div className="flex -space-x-2">
                                        {benefits.map((benefit, idx) => {
                                            const Icon = benefit.icon;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center ${benefit.color} shadow-sm`}
                                                    title={benefit.label}
                                                    style={{ zIndex: 10 - idx }}
                                                >
                                                    <Icon size={14} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{servicio.nombre}</h3>

                            <p className={`text-sm text-slate-400 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {servicio.descripcion || "Atención personalizada con especialistas altamente calificados para tu bienestar."}
                            </p>
                        </motion.div>

                        {/* Toggle Button */}
                        <motion.div
                            layout="position"
                            className={`p-4 border-t border-slate-700/50 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer transition-colors duration-300 mt-auto
                                ${isExpanded
                                    ? 'bg-sky-500/5 text-sky-400 hover:bg-sky-500/10'
                                    : 'border-transparent text-slate-400 hover:text-sky-400'
                                }`}
                            onClick={() => onToggle(servicio.id)}
                        >
                            {isExpanded ? (
                                <>
                                    <span>Ver menos</span>
                                    <ChevronUp size={16} />
                                </>
                            ) : (
                                <>
                                    <span>Ver detalles y requisitos</span>
                                    <ChevronDown size={16} />
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN (Expanded Details) */}
                    <AnimatePresence mode="wait">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-slate-900/20 md:border-l md:border-slate-700/50 overflow-hidden"
                            >
                                <div className="p-6 space-y-6 h-full flex flex-col justify-center">

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                <Clock size={14} /> Duración
                                            </div>
                                            <span className="text-lg font-bold text-slate-200">
                                                {servicio.duracion ? `${servicio.duracion} min` : "Consultar"}
                                            </span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                                <DollarSign size={14} /> Precio
                                            </div>
                                            <span className="text-lg font-bold text-slate-200">
                                                {servicio.precio ? formatPrice(servicio.precio) : "Consultar"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Convenios List Detail */}
                                    <div className="flex-1 overflow-y-auto pr-1 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                        {servicio.convenios && servicio.convenios.length > 0 ? (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 sticky top-0 bg-slate-900/90 backdrop-blur pb-2 z-10">
                                                    <CheckCircle2 size={16} className="text-sky-500" />
                                                    Convenios y Requisitos
                                                </h4>
                                                <div className="space-y-3">
                                                    {servicio.convenios.map(convenio => (
                                                        <div key={convenio.id} className="text-sm bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-medium text-sky-100">{convenio.nombre}</span>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${BENEFIT_TYPES[convenio.tipo]?.color || 'bg-slate-700 text-slate-300'}`}>
                                                                    {BENEFIT_TYPES[convenio.tipo]?.label || convenio.tipo}
                                                                </span>
                                                            </div>
                                                            {convenio.descripcion && (
                                                                <p className="text-slate-500 text-xs italic mb-2">{convenio.descripcion}</p>
                                                            )}
                                                            {convenio.requisitos && convenio.requisitos.length > 0 && (
                                                                <ul className="space-y-1 mt-2 pl-1 border-t border-slate-700/30 pt-2">
                                                                    {convenio.requisitos.map(req => (
                                                                        <li key={req.id} className="flex items-start gap-1.5 text-xs text-slate-400">
                                                                            <ChevronRight size={12} className="mt-0.5 text-sky-500 shrink-0" />
                                                                            <span>
                                                                                <strong className="text-slate-300">{req.nombre}:</strong> {req.descripcion}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 italic p-2 bg-slate-900/30 rounded-lg">
                                                <AlertCircle size={16} /> Sin convenios asociados
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default function ServiciosList() {
    const [servicios, setServicios] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedServices, setExpandedServices] = useState(new Set());

    // FILTERS STATE
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEspecialidad, setSelectedEspecialidad] = useState("all");
    const [selectedConvenios, setSelectedConvenios] = useState([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [servicesRes, especialidadesRes] = await Promise.all([
                getServicios(),
                getEspecialidades()
            ]);
            setServicios(servicesRes || []);
            setEspecialidades(especialidadesRes.data || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const toggleService = (serviceId) => {
        setExpandedServices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };

    const toggleConvenioFilter = (type) => {
        setSelectedConvenios(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Filter Logic using useMemo
    const filteredServices = useMemo(() => {
        return servicios.filter(service => {
            // 1. Text Search
            const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (service.descripcion && service.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

            // 2. Especialidad Filter
            const matchesEspecialidad = selectedEspecialidad === "all" || service.especialidad === selectedEspecialidad;

            // 3. Convenio Filter
            // If no convenio filter is selected, match all.
            // If filters are selected, service must have AT LEAST ONE of the selected types.
            let matchesConvenio = true;
            if (selectedConvenios.length > 0) {
                if (!service.convenios || service.convenios.length === 0) {
                    matchesConvenio = false;
                } else {
                    const serviceTypes = service.convenios.map(c => c.tipo);
                    matchesConvenio = selectedConvenios.some(type => serviceTypes.includes(type));
                }
            }

            return matchesSearch && matchesEspecialidad && matchesConvenio;
        });
    }, [servicios, searchTerm, selectedEspecialidad, selectedConvenios]);

    // Group filtered services by especialidad for rendering
    // We only show especialidades that have at least one matching service
    const visibleEspecialidadIds = new Set(filteredServices.map(s => s.especialidad));
    const filteredEspecialidades = especialidades.filter(e => visibleEspecialidadIds.has(e.id));

    // Also handle services without especialidad that match the filter
    const visibleSinEspecialidad = filteredServices.filter(s => !s.especialidad);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Helper to get services for a specific especialidad from the FILTERED list
    const getServicesByEspecialidad = (especialidadId) => {
        return filteredServices.filter(s => s.especialidad === especialidadId);
    };

    return (
        <div className="space-y-8 font-inter">
            {/* FILTERS SECTION */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 sticky top-24 z-30 shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-6">
                    {/* Top Row: Search & Especialidad */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar servicio por nombre o descripción..."
                                className="w-full bg-slate-900/80 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Especialidad Dropdown */}
                        <div className="relative min-w-[200px]">
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-900/80 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all cursor-pointer"
                                    value={selectedEspecialidad}
                                    onChange={(e) => setSelectedEspecialidad(e.target.value === "all" ? "all" : Number(e.target.value))}
                                >
                                    <option value="all">Todas las Especialidades</option>
                                    {especialidades.map(esp => (
                                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Convenios Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-slate-700/50 pt-4">
                        <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                            <Filter size={16} /> Filtrar por convenio:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(BENEFIT_TYPES).map(([key, benefit]) => {
                                const isSelected = selectedConvenios.includes(key);
                                const Icon = benefit.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleConvenioFilter(key)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all border
                                            ${isSelected
                                                ? `${benefit.color} border-transparent shadow-md transform scale-105`
                                                : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {benefit.label}
                                        {isSelected && <CheckCircle2 size={12} />}
                                    </button>
                                );
                            })}
                            {selectedConvenios.length > 0 && (
                                <button
                                    onClick={() => setSelectedConvenios([])}
                                    className="text-xs text-sky-400 hover:text-sky-300 underline ml-2"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTS SECTION */}
            <div className="space-y-16">
                {filteredEspecialidades.map((especialidad) => {
                    const especialidadServices = getServicesByEspecialidad(especialidad.id);
                    // Should be guaranteed > 0 by the visibleEspecialidadIds logic, but safety check
                    if (especialidadServices.length === 0) return null;

                    return (
                        <section key={especialidad.id} className="scroll-mt-48" id={`esp-${especialidad.id}`}>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-white border-l-4 border-sky-500 pl-4">
                                    {especialidad.nombre}
                                    <span className="text-sm font-normal text-slate-500 ml-3">({especialidadServices.length})</span>
                                </h2>
                                <div className="h-px bg-slate-700 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start grid-flow-row-dense">
                                {especialidadServices.map((servicio) => (
                                    <ServiceCard
                                        key={servicio.id}
                                        servicio={servicio}
                                        isExpanded={expandedServices.has(servicio.id)}
                                        onToggle={toggleService}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* General / Sin Especialidad Section */}
                {visibleSinEspecialidad.length > 0 && (
                    <section className="scroll-mt-48">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-white border-l-4 border-slate-600 pl-4">
                                General
                                <span className="text-sm font-normal text-slate-500 ml-3">({visibleSinEspecialidad.length})</span>
                            </h2>
                            <div className="h-px bg-slate-700 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start grid-flow-row-dense">
                            {visibleSinEspecialidad.map((servicio) => (
                                <ServiceCard
                                    key={servicio.id}
                                    servicio={servicio}
                                    isExpanded={expandedServices.has(servicio.id)}
                                    onToggle={toggleService}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* No Results State */}
                {filteredServices.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-slate-800 p-4 rounded-full">
                                <Search size={40} className="text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No se encontraron resultados</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                No hay servicios que coincidan con tu búsqueda o filtros seleccionados. Intenta con otros términos o limpia los filtros.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedEspecialidad("all");
                                    setSelectedConvenios([]);
                                }}
                                className="mt-2 px-6 py-2 bg-sky-500/10 text-sky-400 rounded-full hover:bg-sky-500/20 transition-colors font-semibold"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}