import React, { useState, useEffect, useMemo } from "react";
import { getConvenios } from "../api/Convenios";
import { CheckCircle2, Percent, ChevronRight, Sparkles, ChevronDown, ChevronUp, Activity, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FonasaIcon from "./common/FonasaIcon";
import ClinicIcon from "./common/ClinicIcon";

// Section configuration with unique visual identities
const SECTION_CONFIG = {
    FONASA: {
        key: 'FONASA',
        title: 'FONASA',
        subtitle: 'Accede a nuestros servicios con cobertura del Fondo Nacional de Salud',
        icon: FonasaIcon,
        headerIcon: FonasaIcon,
        // Institutional blue palette
        headerBg: 'bg-gradient-to-r from-[#005596] to-[#0077cc]',
        headerBorder: 'border-[#005596]/30',
        cardBg: 'bg-slate-800/40',
        cardBgHover: 'hover:bg-slate-800/60',
        cardBorder: 'border-l-4 border-l-[#005596] border border-slate-700/50 hover:border-[#005596]/50',
        cardBorderExpanded: 'border-l-4 border-l-[#005596] border border-[#005596]/50',
        accentColor: 'text-[#009fe3]',
        badgeColor: 'bg-[#005596]/20 text-[#009fe3] border border-[#005596]/30',
        iconBg: 'bg-[#005596]/20',
        glowColor: 'hover:shadow-[#005596]/10',
        expandedGlow: 'shadow-xl shadow-[#005596]/10',
        detailBg: 'bg-[#005596]/5',
        detailBorder: 'border-[#005596]/20',
        emptyText: 'No hay convenios FONASA disponibles en este momento.',
        emptyIcon: ClinicIcon,
    },
    PROMOCION: {
        key: 'PROMOCION',
        title: 'Promociones',
        subtitle: 'Aprovecha nuestras ofertas y descuentos especiales por tiempo limitado',
        icon: Percent,
        headerIcon: Sparkles,
        // Vibrant yellow/gold palette
        headerBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        headerBorder: 'border-amber-400/30',
        cardBg: 'bg-slate-800/40',
        cardBgHover: 'hover:bg-slate-800/60',
        cardBorder: 'border-l-4 border-l-amber-400 border border-slate-700/50 hover:border-amber-400/50',
        cardBorderExpanded: 'border-l-4 border-l-amber-400 border border-amber-400/50',
        accentColor: 'text-amber-400',
        badgeColor: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
        iconBg: 'bg-amber-400/15',
        glowColor: 'hover:shadow-amber-400/10',
        expandedGlow: 'shadow-xl shadow-amber-400/10',
        detailBg: 'bg-amber-400/5',
        detailBorder: 'border-amber-400/20',
        emptyText: 'No hay promociones activas en este momento. ¡Vuelve pronto!',
        emptyIcon: ClinicIcon,
    },
    CONVENIO_ATILA: {
        key: 'CONVENIO_ATILA',
        title: 'Convenios Atila',
        subtitle: 'Convenios exclusivos de Centro Médico Atila para tu bienestar',
        icon: ClinicIcon,
        headerIcon: ClinicIcon,
        // Primary medical palette
        headerBg: 'bg-gradient-to-r from-primary to-sky-500',
        headerBorder: 'border-primary/30',
        cardBg: 'bg-slate-800/40',
        cardBgHover: 'hover:bg-slate-800/60',
        cardBorder: 'border-l-4 border-l-primary border border-slate-700/50 hover:border-primary/50',
        cardBorderExpanded: 'border-l-4 border-l-primary border border-primary/50',
        accentColor: 'text-sky-400',
        badgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
        iconBg: 'bg-sky-500/15',
        glowColor: 'hover:shadow-sky-500/10',
        expandedGlow: 'shadow-xl shadow-sky-500/10',
        detailBg: 'bg-sky-500/5',
        detailBorder: 'border-sky-500/20',
        emptyText: 'No hay convenios Atila disponibles en este momento.',
        emptyIcon: ClinicIcon,
    },
};

const SECTION_ORDER = ['FONASA', 'PROMOCION', 'CONVENIO_ATILA'];

// Individual convenio card with expand/collapse
const ConvenioCard = ({ convenio, config, isExpanded, onToggle }) => {
    const Icon = config.icon;
    const servicios = convenio.servicios_details || [];
    const requisitos = convenio.requisitos_details || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`group relative rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden flex flex-col
                ${config.cardBg} ${isExpanded ? config.cardBorderExpanded : config.cardBorder}
                ${isExpanded ? config.expandedGlow : `${config.cardBgHover} ${config.glowColor} hover:shadow-2xl hover:-translate-y-1`}
                ${isExpanded ? 'md:col-span-2' : ''}`}
        >
            {/* Top section — always visible */}
            <div className="p-6 flex-1">
                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
                    <Icon size={96} />
                </div>

                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${config.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                        <Icon size={22} className={config.accentColor} />
                    </div>
                    {servicios.length > 0 && (
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${config.badgeColor}`}>
                            {servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'}
                        </span>
                    )}
                </div>

                {/* Card body */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-100 transition-colors">
                    {convenio.nombre}
                </h3>
                <p className={`text-sm text-slate-400 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {convenio.descripcion || "Beneficio exclusivo disponible para nuestros pacientes."}
                </p>


            </div>

            {/* Expanded details panel */}
            <AnimatePresence mode="wait">
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-slate-700/50"
                    >
                        <div className={`p-6 space-y-5 ${config.detailBg}`}>
                            {/* Requisitos */}
                            {requisitos.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                        <CheckCircle2 size={16} className={config.accentColor} />
                                        Requisitos
                                    </h4>
                                    <div className="space-y-2">
                                        {requisitos.map(req => (
                                            <div key={req.id} className="flex items-start gap-2 text-sm bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                                                <ChevronRight size={14} className={`mt-0.5 ${config.accentColor} shrink-0`} />
                                                <div>
                                                    <span className="font-medium text-slate-200">{req.nombre}</span>
                                                    {req.descripcion && (
                                                        <p className="text-slate-500 text-xs mt-0.5">{req.descripcion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Servicios asociados */}
                            {servicios.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                        <Activity size={16} className={config.accentColor} />
                                        Servicios asociados
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {servicios.map(servicio => (
                                            <div key={servicio.id} className="flex items-center gap-3 text-sm bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${config.accentColor.replace('text-', 'bg-')}`}></div>
                                                <div className="min-w-0">
                                                    <span className="font-medium text-slate-200 block truncate">{servicio.nombre}</span>
                                                    {servicio.precio && (
                                                        <span className="text-xs text-slate-500">
                                                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(servicio.precio)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {requisitos.length === 0 && servicios.length === 0 && (
                                <p className="text-slate-500 text-sm italic text-center py-4">
                                    No hay detalles adicionales para este convenio.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            <button
                onClick={() => onToggle(convenio.id)}
                className={`w-full p-3 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer transition-colors duration-300 border-t border-slate-700/50
                    ${isExpanded
                        ? `${config.detailBg} ${config.accentColor} hover:bg-slate-800/60`
                        : `text-slate-400 hover:${config.accentColor.replace('text-', 'text-')}`
                    }`}
            >
                {isExpanded ? (
                    <>
                        <span>Ver menos</span>
                        <ChevronUp size={16} />
                    </>
                ) : (
                    <>
                        <span>Ver detalles</span>
                        <ChevronDown size={16} />
                    </>
                )}
            </button>
        </motion.div>
    );
};

// Section component for each type
const ConvenioSection = ({ config, convenios, expandedIds, onToggle }) => {
    const HeaderIcon = config.headerIcon;
    const TypeIcon = config.icon;

    return (
        <section className="scroll-mt-24">
            {/* Section header */}
            <div className={`relative rounded-2xl overflow-hidden mb-8 ${config.headerBg} p-6 md:p-8`}>
                {/* Background decorative icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                    <TypeIcon size={120} />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <HeaderIcon size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {config.title}
                        </h2>
                        <p className="text-white/80 text-sm md:text-base mt-1">
                            {config.subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cards grid */}
            {convenios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start grid-flow-row-dense">
                    {convenios.map((convenio) => (
                        <ConvenioCard
                            key={convenio.id}
                            convenio={convenio}
                            config={config}
                            isExpanded={expandedIds.has(convenio.id)}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/40 backdrop-blur-sm">
                    <div className="flex justify-center mb-4"><config.emptyIcon className="w-12 h-12 text-slate-400/60" /></div>
                    <p className="text-slate-400 font-inter text-sm">
                        {config.emptyText}
                    </p>
                </div>
            )}
        </section>
    );
};

export default function ConveniosList() {
    const [convenios, setConvenios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());

    // SEARCH STATE
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await getConvenios();
            // Filter only active convenios for public view
            const activeConvenios = response.data.filter(c => c.activo !== false);
            setConvenios(activeConvenios);
        } catch (error) {
            console.error("Error loading convenios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleConvenio = (convenioId) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(convenioId)) {
                newSet.delete(convenioId);
            } else {
                newSet.add(convenioId);
            }
            return newSet;
        });
    };

    // Filter Logic using useMemo
    const filteredConvenios = useMemo(() => {
        return convenios.filter(convenio => {
            // Text Search
            const matchesSearch = convenio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (convenio.descripcion && convenio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesSearch;
        });
    }, [convenios, searchTerm]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
            </div>
        );
    }

    // Group FILTERED convenios by type
    const groupedConvenios = filteredConvenios.reduce((acc, convenio) => {
        const type = convenio.tipo || 'CONVENIO_ATILA';
        if (!acc[type]) acc[type] = [];
        acc[type].push(convenio);
        return acc;
    }, {});

    return (
        <div className="space-y-8 font-inter">
            {/* SEARCH BAR */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 sticky top-24 z-30 shadow-2xl shadow-black/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar convenio por nombre o descripción..."
                        className="w-full bg-slate-900/80 border border-slate-700 text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-500"
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
            </div>

            {/* RESULTS SECTION */}
            <div className="space-y-16">
                {SECTION_ORDER.map((type) => {
                    const config = SECTION_CONFIG[type];
                    const typeConvenios = groupedConvenios[type] || [];

                    return (
                        <ConvenioSection
                            key={type}
                            config={config}
                            convenios={typeConvenios}
                            expandedIds={expandedIds}
                            onToggle={toggleConvenio}
                        />
                    );
                })}

                {/* No Results State */}
                {filteredConvenios.length === 0 && convenios.length > 0 && (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-slate-800 p-4 rounded-full">
                                <Search size={40} className="text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No se encontraron resultados</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                No hay convenios que coincidan con tu búsqueda. Intenta con otros términos.
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-2 px-6 py-2 bg-sky-500/10 text-sky-400 rounded-full hover:bg-sky-500/20 transition-colors font-semibold"
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State (no convenios at all) */}
                {convenios.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
                        <div className="flex flex-col items-center gap-4">
                            <ClinicIcon className="w-14 h-14 text-slate-400/60" />
                            <h3 className="text-xl font-bold text-white">No hay convenios disponibles</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                No hay convenios disponibles en este momento. Vuelve pronto para novedades.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
