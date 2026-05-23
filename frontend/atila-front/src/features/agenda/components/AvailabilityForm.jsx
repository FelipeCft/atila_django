import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { ui } from '../../../utilities/ui';
import { createHorario, updateHorario, deleteHorario } from '../../../api/agenda';

const AvailabilityForm = ({ staffList, onSuccess, globalHours = [], horarios = [] }) => {
    const [profesionalId, setProfesionalId] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('19:00');

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredStaff = useMemo(() => {
        if (!searchTerm) return staffList;
        return staffList.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [staffList, searchTerm]);

    // Update searchTerm when professional is selected (initial load or manual select)
    useEffect(() => {
        if (profesionalId) {
            const staff = staffList.find(s => s.user_id === parseInt(profesionalId));
            if (staff && staff.full_name !== searchTerm) {
                setSearchTerm(staff.full_name);
            }
        } else if (searchTerm === '') {
            // If cleared
        }
    }, [profesionalId, staffList]);

    // Filter existing schedules for the selected professional
    const staffSchedules = useMemo(() => {
        if (!profesionalId) return [];
        return horarios.filter(h => h.profesional === parseInt(profesionalId));
    }, [horarios, profesionalId]);

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const days = [
        { id: 0, label: 'Lunes' },
        { id: 1, label: 'Martes' },
        { id: 2, label: 'Miércoles' },
        { id: 3, label: 'Jueves' },
        { id: 4, label: 'Viernes' },
        { id: 5, label: 'Sábado' },
        { id: 6, label: 'Domingo' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profesionalId) {
            ui.error('Debe seleccionar un profesional');
            return;
        }

        try {
            const promises = selectedDays.map(day => {
                const existing = staffSchedules.find(h => h.dia_semana === day);
                const payload = {
                    profesional: profesionalId,
                    dia_semana: day,
                    hora_inicio: startTime,
                    hora_fin: endTime
                };

                // Check against Global Hours
                const globalDay = globalHours.find(gh => gh.dia_semana === day);
                if (!globalDay) {
                    throw new Error(`La clínica está cerrada el día ${days[day].label}`);
                }
                // Normalize times for comparison (HH:MM)
                const globalStart = globalDay.hora_inicio.slice(0, 5);
                const globalEnd = globalDay.hora_fin.slice(0, 5);

                if (startTime < globalStart || endTime > globalEnd) {
                    throw new Error(`El horario (${startTime}-${endTime}) debe estar dentro del horario de la clínica (${globalStart}-${globalEnd}) para el ${days[day].label}.`);
                }

                if (existing) {
                    return updateHorario(existing.id, payload);
                } else {
                    return createHorario(payload);
                }
            });

            await Promise.all(promises);
            ui.success('Horarios del personal actualizados');
            setSelectedDays([]);
            onSuccess();
        } catch (error) {
            // Helper to extract readable error message
            let message = 'Error al guardar horario';
            if (error instanceof Error) message = error.message;
            else if (typeof error === 'string') message = error;
            else if (error.detail) message = error.detail;
            else if (error.non_field_errors) message = error.non_field_errors.join(', ');
            else if (typeof error === 'object') {
                // Combine field errors
                message = Object.entries(error).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(', ');
            }

            ui.error(message);
        }
    };

    const handleDelete = async () => {
        if (!profesionalId) {
            ui.error('Debe seleccionar un profesional');
            return;
        }
        if (selectedDays.length === 0) {
            ui.error('Seleccione al menos un día para eliminar su horario.');
            return;
        }

        const confirmed = await ui.confirm({
            title: '¿Eliminar horarios?',
            message: '¿Estás seguro de que deseas eliminar los horarios de los días seleccionados? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            const promises = selectedDays.map(day => {
                const existing = staffSchedules.find(h => h.dia_semana === day);
                if (existing) {
                    return deleteHorario(existing.id);
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            ui.success('Horarios eliminados exitosamente');
            setSelectedDays([]);
            onSuccess();
        } catch (error) {
            console.error(error);
            ui.error("Error al eliminar horarios");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1">Profesional</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar profesional..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                            if (e.target.value === '') setProfesionalId('');
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        // Delay blur to allow click on options
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    />
                </div>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-20">
                        {filteredStaff.length > 0 ? (
                            filteredStaff.map(s => (
                                <div
                                    key={s.user_id}
                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                    onClick={() => {
                                        setProfesionalId(s.user_id);
                                        setSearchTerm(s.full_name);
                                        setIsDropdownOpen(false);
                                        setSelectedDays([]); // Reset selection on staff change
                                    }}
                                >
                                    <div className="font-semibold text-slate-700">{s.full_name}</div>
                                    <div className="text-xs text-slate-400">{s.email}</div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-sm">No se encontraron profesionales</div>
                        )}
                    </div>
                )}
            </div>

            {profesionalId && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Días a Configurar</label>
                        <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-x-auto">
                            {days.map(day => {
                                const existingSchedule = staffSchedules.find(h => h.dia_semana === day.id);
                                const globalOpen = globalHours.find(h => h.dia_semana === day.id);

                                const isSelected = selectedDays.includes(day.id);
                                const hasSchedule = !!existingSchedule;
                                const isClosedGlobally = !globalOpen;

                                let cardClass = "bg-white border-transparent text-slate-400 hover:bg-slate-100";

                                if (isClosedGlobally) {
                                    cardClass = "bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed border-transparent";
                                } else if (isSelected) {
                                    cardClass = "bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105 z-10";
                                } else if (hasSchedule) {
                                    cardClass = "bg-emerald-500 text-white border-emerald-500 shadow-sm hover:bg-emerald-600";
                                }

                                return (
                                    <label
                                        key={day.id}
                                        className={`flex flex-col items-center justify-center flex-1 min-w-28 p-4 rounded-xl border-2 transition-all ${cardClass} ${!isClosedGlobally && 'cursor-pointer'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => !isClosedGlobally && toggleDay(day.id)}
                                            disabled={isClosedGlobally}
                                            className="hidden"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-wider mb-2">{day.label}</span>

                                        {isClosedGlobally ? (
                                            <div className="text-[10px] font-bold">CLÍNICA CERRADA</div>
                                        ) : existingSchedule ? (
                                            <div className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${isSelected || hasSchedule ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {existingSchedule.hora_inicio.slice(0, 5)} - {existingSchedule.hora_fin.slice(0, 5)}
                                            </div>
                                        ) : (
                                            <div className={`text-[10px] opacity-70 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                Sin Horario
                                            </div>
                                        )}

                                        {isSelected && <CheckCircle size={16} className="mt-2 text-white" />}
                                        {!isSelected && hasSchedule && <div className="mt-2 w-4 h-4 rounded-full bg-white/30" />}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Inicio Turno</label>
                            <input type="time" required className="w-full p-3 rounded-xl border border-slate-200"
                                value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Fin Turno</label>
                            <input type="time" required className="w-full p-3 rounded-xl border border-slate-200"
                                value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                            Guardar Horario
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>

                    <p className="text-xs text-center text-slate-400">
                        * Solo se pueden seleccionar días donde la clínica esté abierta.
                    </p>
                </div>
            )}
        </form>
    );
};

export default AvailabilityForm;
