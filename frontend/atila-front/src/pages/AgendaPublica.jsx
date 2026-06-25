import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User2, Briefcase, Loader2 } from 'lucide-react';
import { getDisponibilidadPublica } from '../api/agenda';
import CurrentTimeLine from '../features/agenda/components/CurrentTimeLine';


// ─── Constantes ────────────────────────────────────────────────────────────
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const GRID_START_HOUR = 7;   // 07:00
const GRID_END_HOUR = 21;    // 21:00
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR; // 14 horas visibles
const PX_PER_HOUR = 72;      // altura de cada hora en píxeles

// Calcula el top y height en px de un bloque horario dentro de la grilla
const blockStyle = (startISO, endISO) => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH = end.getHours() + end.getMinutes() / 60;
    const top = (startH - GRID_START_HOUR) * PX_PER_HOUR;
    const height = (endH - startH) * PX_PER_HOUR;
    return { top: `${top}px`, height: `${Math.max(height, 18)}px` };
};

// Calcula la posición del horario disponible del profesional (franja activa)
const availabilityStyle = (horaInicioStr, horaFinStr) => {
    const [sh, sm] = horaInicioStr.split(':').map(Number);
    const [eh, em] = horaFinStr.split(':').map(Number);
    const startH = sh + sm / 60;
    const endH = eh + em / 60;
    const top = (startH - GRID_START_HOUR) * PX_PER_HOUR;
    const height = (endH - startH) * PX_PER_HOUR;
    return { top: `${top}px`, height: `${Math.max(height, 18)}px` };
};

// ─── Componente: Semana helper ──────────────────────────────────────────────
const getWeekDays = (referenceDate) => {
    const start = new Date(referenceDate);
    const dow = start.getDay(); // 0=Dom
    const diff = dow === 0 ? -6 : 1 - dow; // mover a Lunes
    start.setDate(start.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
    });
};

// ─── Columna de un día ─────────────────────────────────────────────────────
const DayColumn = ({ dayDate, horario }) => {
    // horario puede ser undefined si el doctor no trabaja ese día
    const isWorking = !!horario;

    return (
        <div className="relative flex-1 border-r border-slate-700/50 last:border-r-0 min-h-full">
            {/* Líneas de hora */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {Array.from({ length: GRID_HOURS }).map((_, i) => (
                    <div
                        key={i}
                        className="border-b border-slate-700/30 w-full"
                        style={{ height: `${PX_PER_HOUR}px` }}
                    />
                ))}
            </div>

            {/* Franja de horario disponible (fondo sutil) */}
            {isWorking && (
                <div
                    className="absolute left-0 right-0 bg-sky-500/5 border-l-2 border-sky-500/20 z-0 pointer-events-none"
                    style={availabilityStyle(horario.hora_inicio, horario.hora_fin)}
                />
            )}

            {/* Bloques ocupados: gris con borde */}
            {isWorking && horario.bloques_ocupados.map((bloque, idx) => (
                <div
                    key={idx}
                    className="absolute left-1 right-1 rounded-md bg-slate-600/40 border border-slate-500/60 z-10 backdrop-blur-sm"
                    style={blockStyle(bloque.inicio, bloque.fin)}
                />
            ))}

            {/* Si no trabaja ese día: overlay tenue */}
            {!isWorking && (
                <div className="absolute inset-0 bg-slate-800/20 z-0 pointer-events-none" />
            )}
        </div>
    );
};

// ─── Grilla semanal ────────────────────────────────────────────────────────
const WeekGrid = ({ weekDays, doctorData }) => {
    // Construir mapa dia_semana → horario
    const horarioMap = {};
    (doctorData?.horarios || []).forEach(h => {
        horarioMap[h.dia_semana] = h;
    });

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col">
            {/* Cabecera de días */}
            <div className="grid grid-cols-8 border-b border-slate-700/50 sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm">
                <div className="p-3 bg-slate-900/60 text-xs font-bold text-slate-500 uppercase text-right border-r border-slate-700/50">
                    Hora
                </div>
                {weekDays.map((date, i) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const diaSemana = date.getDay() === 0 ? 6 : date.getDay() - 1;
                    const isWorkDay = horarioMap[diaSemana] !== undefined;
                    return (
                        <div
                            key={i}
                            className={`p-3 text-center border-r border-slate-700/50 last:border-r-0 ${isToday ? 'bg-sky-500/10' : ''}`}
                        >
                            <div className={`text-[11px] font-bold uppercase ${isWorkDay ? 'text-sky-400' : 'text-slate-600'}`}>
                                {DAY_LABELS[i]}
                            </div>
                            <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-sky-400' : isWorkDay ? 'text-slate-200' : 'text-slate-600'}`}>
                                {date.getDate()}
                            </div>
                            {isWorkDay && (
                                <div className="text-[9px] text-sky-500/70 mt-0.5">
                                    {horarioMap[diaSemana].hora_inicio}–{horarioMap[diaSemana].hora_fin}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Cuerpo de la grilla */}
            <div
                className="grid grid-cols-8 relative"
                style={{ height: `${GRID_HOURS * PX_PER_HOUR}px` }}
            >
                {/* Columna de horas */}
                <div className="bg-slate-900/40 border-r border-slate-700/50 sticky left-0 z-20">
                    {Array.from({ length: GRID_HOURS }).map((_, i) => {
                        const hour = GRID_START_HOUR + i;
                        return (
                            <div
                                key={hour}
                                className="flex items-start justify-end pr-2 pt-1"
                                style={{ height: `${PX_PER_HOUR}px` }}
                            >
                                <span className="text-[11px] font-bold text-slate-500">
                                    {String(hour).padStart(2, '0')}:00
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Columnas de días */}
                <div className="col-span-7 relative flex h-full">
                    <CurrentTimeLine startHour={GRID_START_HOUR} endHour={GRID_END_HOUR} />
                    {weekDays.map((dayDate, i) => {
                        const diaSemana = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;
                        return (
                            <DayColumn
                                key={i}
                                dayDate={dayDate}
                                horario={horarioMap[diaSemana]}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Leyenda ───────────────────────────────────────────────────────────────
const Leyenda = () => (
    <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sky-500/5 border-l-2 border-sky-500/30" />
            <span>Horario disponible</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-600/40 border border-slate-500/60" />
            <span>Slot ocupado</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-800/20" />
            <span>No labora</span>
        </div>
    </div>
);

// ─── Página principal ──────────────────────────────────────────────────────
const AgendaPublica = () => {
    const [servicios, setServicios] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [loadingServicios, setLoadingServicios] = useState(true);

    const weekDays = getWeekDays(currentDate);

    // Cargar servicios al montar (endpoint público IsAdminOrReadOnly → GET sin token)
    useEffect(() => {
        const fetchServicios = async () => {
            try {
                setLoadingServicios(true);
                const { default: axios } = await import('axios');
                const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
                const res = await axios.get(`${baseURL}servicios/`);
                setServicios((res.data || []).filter(s => s.activo));
            } catch (e) {
                console.error('Error cargando servicios:', e);
            } finally {
                setLoadingServicios(false);
            }
        };
        fetchServicios();
    }, []);


    // Cargar doctores cuando cambia el servicio seleccionado
    const fetchDoctores = useCallback(async (servicioId) => {
        try {
            setLoading(true);
            setSelectedDoctor(null);
            const data = await getDisponibilidadPublica(
                servicioId ? { servicio_id: servicioId } : {}
            );
            setDoctores(data || []);
        } catch (e) {
            console.error('Error cargando disponibilidad:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleServicioSelect = (servicio) => {
        setSelectedServicio(servicio);
        fetchDoctores(servicio?.id);
    };

    const handleVerTodos = () => {
        setSelectedServicio(null);
        fetchDoctores(null);
    };

    const changeWeek = (dir) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    const weekLabel = (() => {
        const start = weekDays[0];
        const end = weekDays[6];
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const getMonth = (d) => cap(d.toLocaleDateString('es-ES', { month: 'long' }));
        if (start.getMonth() !== end.getMonth()) {
            return `${start.getDate()} de ${getMonth(start)} → ${end.getDate()} de ${getMonth(end)}`;
        }
        return `${start.getDate()} – ${end.getDate()} de ${getMonth(start)}`;
    })();

    const doctorActivo = doctores.find(d => d.profesional_id === selectedDoctor?.profesional_id);

    return (
        <div className="min-h-screen bg-slate-950 pt-28 pb-20 font-inter">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold">
                        <Calendar size={14} />
                        Disponibilidad de Agenda
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Consulta la Disponibilidad
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Selecciona un servicio y un profesional para ver su horario de la semana.
                    </p>
                </div>

                {/* ── Selección de Servicio ─────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                        <Briefcase size={18} className="text-sky-400" />
                        Filtrar por Servicio
                    </h2>

                    {loadingServicios ? (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Loader2 size={18} className="animate-spin" />
                            Cargando servicios...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <button
                                id="btn-todos-servicios"
                                onClick={handleVerTodos}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                    !selectedServicio
                                        ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-sky-500/50 hover:text-sky-300'
                                }`}
                            >
                                Todos
                            </button>
                            {servicios.map(s => (
                                <button
                                    key={s.id}
                                    id={`btn-servicio-${s.id}`}
                                    onClick={() => handleServicioSelect(s)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                        selectedServicio?.id === s.id
                                            ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-sky-500/50 hover:text-sky-300'
                                    }`}
                                >
                                    {s.nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Selección de Doctor ───────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                        <User2 size={18} className="text-sky-400" />
                        Seleccionar Profesional
                    </h2>

                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500 py-4">
                            <Loader2 size={18} className="animate-spin" />
                            Cargando profesionales...
                        </div>
                    ) : doctores.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">
                            No hay profesionales con horario configurado para este servicio.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {doctores.map(doc => {
                                const isSelected = selectedDoctor?.profesional_id === doc.profesional_id;
                                const diasLaborables = doc.horarios.map(h => DAY_LABELS[h.dia_semana]).join(', ');
                                return (
                                    <button
                                        key={doc.profesional_id}
                                        id={`btn-doctor-${doc.profesional_id}`}
                                        onClick={() => setSelectedDoctor(doc)}
                                        className={`text-left p-4 rounded-xl border transition-all duration-200 group ${
                                            isSelected
                                                ? 'bg-sky-500/15 border-sky-500/60 shadow-lg shadow-sky-500/10'
                                                : 'bg-slate-800/50 border-slate-700/60 hover:border-sky-500/40 hover:bg-slate-800'
                                        }`}
                                    >
                                        {/* Avatar inicial */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3 transition-colors ${
                                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-sky-500/20 group-hover:text-sky-300'
                                        }`}>
                                            {doc.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                        </div>
                                        <p className={`font-semibold text-sm truncate ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                                            {doc.nombre}
                                        </p>
                                        {doc.cargo && (
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{doc.cargo}</p>
                                        )}
                                        {diasLaborables && (
                                            <p className="text-[11px] text-sky-500/70 mt-2 truncate">{diasLaborables}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── Grilla de Disponibilidad ──────────────────────── */}
                {selectedDoctor && (
                    <section className="space-y-4" id="grilla-disponibilidad">
                        {/* Barra de navegación semana */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-200">
                                    {doctorActivo?.nombre}
                                </h2>
                                {doctorActivo?.cargo && (
                                    <p className="text-sm text-slate-500">{doctorActivo.cargo}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    id="btn-semana-anterior"
                                    onClick={() => changeWeek(-1)}
                                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-slate-400 hover:text-sky-300 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 rounded-lg border border-slate-700 min-w-[220px] text-center">
                                    {weekLabel}
                                </span>
                                <button
                                    id="btn-semana-siguiente"
                                    onClick={() => changeWeek(1)}
                                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-slate-400 hover:text-sky-300 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <Leyenda />

                        {/* ── Vista móvil: 1 día a la vez ─────────── */}
                        <MobileWeekView weekDays={weekDays} doctorData={doctorActivo} />

                        {/* ── Vista desktop: grilla completa ──────── */}
                        <div className="hidden md:block overflow-x-auto">
                            <div className="min-w-[720px]">
                                <WeekGrid weekDays={weekDays} doctorData={doctorActivo} />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// ─── Vista móvil: selector de día + columna simple ────────────────────────
const MobileWeekView = ({ weekDays, doctorData }) => {
    const todayIdx = weekDays.findIndex(d => d.toDateString() === new Date().toDateString());
    const [selectedIdx, setSelectedIdx] = useState(todayIdx >= 0 ? todayIdx : 0);

    const horarioMap = {};
    (doctorData?.horarios || []).forEach(h => { horarioMap[h.dia_semana] = h; });

    const diaSemana = weekDays[selectedIdx].getDay() === 0 ? 6 : weekDays[selectedIdx].getDay() - 1;
    const horarioDia = horarioMap[diaSemana];

    return (
        <div className="md:hidden space-y-3">
            {/* Selector strip */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {weekDays.map((d, i) => {
                    const dS = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    const isToday = d.toDateString() === new Date().toDateString();
                    const isWorkDay = !!horarioMap[dS];
                    const isSelected = i === selectedIdx;
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedIdx(i)}
                            className={`flex flex-col items-center min-w-[3.2rem] px-2 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                    : isToday
                                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                        : isWorkDay
                                            ? 'text-slate-300 hover:bg-slate-800'
                                            : 'text-slate-600 hover:bg-slate-800/40'
                            }`}
                        >
                            <span className="text-[10px] uppercase">{DAY_LABELS[i]}</span>
                            <span className="text-base">{d.getDate()}</span>
                        </button>
                    );
                })}
            </div>

            {/* Grilla de 1 día */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div
                    className="grid grid-cols-[3rem_1fr] relative"
                    style={{ height: `${GRID_HOURS * PX_PER_HOUR}px` }}
                >
                    {/* Horas */}
                    <div className="bg-slate-900/40 border-r border-slate-700/50">
                        {Array.from({ length: GRID_HOURS }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-start justify-end pr-2 pt-1"
                                style={{ height: `${PX_PER_HOUR}px` }}
                            >
                                <span className="text-[10px] font-bold text-slate-600">
                                    {String(GRID_START_HOUR + i).padStart(2, '0')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Día */}
                    <div className="relative h-full">
                        <CurrentTimeLine startHour={GRID_START_HOUR} endHour={GRID_END_HOUR} />
                        <DayColumn dayDate={weekDays[selectedIdx]} horario={horarioDia} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaPublica;
