import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { ui } from '../../../utilities/ui';
import { createHorarioGeneral, updateHorarioGeneral, deleteHorarioGeneral, toggleHorarioGeneralActive } from '../../../api/agenda';

const GlobalAvailabilityForm = ({ onSuccess, globalHours }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('19:00');

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const promises = selectedDays.map(day => {
                const existing = globalHours.find(h => h.dia_semana === day);
                const payload = {
                    dia_semana: day,
                    hora_inicio: startTime,
                    hora_fin: endTime,
                    activo: true
                };

                if (existing) {
                    return updateHorarioGeneral(existing.id, payload);
                } else {
                    return createHorarioGeneral(payload);
                }
            });

            await Promise.all(promises);
            ui.success('Horarios configurados correctamente');
            setSelectedDays([]); // Clear selection after save
            onSuccess();
        } catch (error) {
            ui.error(error.message || 'Error al guardar horarios');
        }
    };

    const handleClose = async () => {
        if (selectedDays.length === 0) {
            ui.error('Seleccione al menos un día para cerrar.');
            return;
        }

        const confirmed = await ui.confirm({
            title: '¿Cerrar clínica?',
            message: '¿Estás seguro de que deseas cerrar la clínica en los días seleccionados? Los horarios se desactivarán.',
            confirmText: 'Cerrar',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            const results = [];
            for (const day of selectedDays) {
                const existing = globalHours.find(h => h.dia_semana === day);
                if (existing) {
                    try {
                        // Try to delete first (only works if no professional schedules)
                        await deleteHorarioGeneral(existing.id);
                        results.push({ day, action: 'deleted' });
                    } catch (deleteError) {
                        // If delete fails (dependencies), deactivate instead
                        if (existing.activo) {
                            await toggleHorarioGeneralActive(existing.id);
                            results.push({ day, action: 'deactivated' });
                        } else {
                            results.push({ day, action: 'already_inactive' });
                        }
                    }
                }
            }

            const deactivated = results.filter(r => r.action === 'deactivated').length;
            const deleted = results.filter(r => r.action === 'deleted').length;

            if (deleted > 0 && deactivated > 0) {
                ui.success(`${deleted} día(s) eliminado(s) y ${deactivated} día(s) desactivado(s) (tenían horarios de profesionales)`);
            } else if (deactivated > 0) {
                ui.success(`${deactivated} día(s) desactivado(s) (tenían horarios de profesionales configurados)`);
            } else if (deleted > 0) {
                ui.success(`${deleted} día(s) eliminado(s)`);
            }

            setSelectedDays([]);
            onSuccess();
        } catch (error) {
            console.error(error);
            const msg = error?.detail || 'Error al cerrar horarios';
            ui.error(msg);
        }
    };

    const handleReopen = async () => {
        if (selectedDays.length === 0) {
            ui.error('Seleccione al menos un día para reabrir.');
            return;
        }

        try {
            const promises = selectedDays.map(day => {
                const existing = globalHours.find(h => h.dia_semana === day);
                if (existing && !existing.activo) {
                    return toggleHorarioGeneralActive(existing.id);
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            ui.success('Día(s) reabierto(s) correctamente');
            setSelectedDays([]);
            onSuccess();
        } catch (error) {
            console.error(error);
            ui.error('Error al reabrir horarios');
        }
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

    // Check if any selected day has an inactive schedule (for showing reopen button)
    const hasInactiveDays = selectedDays.some(day => {
        const existing = globalHours.find(h => h.dia_semana === day);
        return existing && !existing.activo;
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Días de Atención</label>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-x-auto">
                    {days.map(day => {
                        const existingSchedule = globalHours.find(h => h.dia_semana === day.id);
                        const isSelected = selectedDays.includes(day.id);
                        const hasSchedule = !!existingSchedule;
                        const isInactive = existingSchedule && !existingSchedule.activo;

                        // Styling logic
                        let cardClass = "bg-white border-transparent text-slate-400 hover:bg-slate-100"; // Default: no schedule
                        if (isSelected) {
                            cardClass = "bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105 z-10";
                        } else if (isInactive) {
                            cardClass = "bg-amber-100 text-amber-700 border-amber-300 shadow-sm hover:bg-amber-200";
                        } else if (hasSchedule) {
                            cardClass = "bg-emerald-500 text-white border-emerald-500 shadow-sm hover:bg-emerald-600";
                        }

                        return (
                            <label
                                key={day.id}
                                className={`flex flex-col items-center justify-center flex-1 min-w-28 p-4 rounded-xl border-2 cursor-pointer transition-all ${cardClass}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleDay(day.id)}
                                    className="hidden"
                                />
                                <span className="text-xs font-bold uppercase tracking-wider mb-2">{day.label}</span>

                                {existingSchedule ? (
                                    <div className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${isSelected || (hasSchedule && !isInactive) ? 'bg-white/20 text-white' : isInactive ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {isInactive ? 'Desactivado' : `${existingSchedule.hora_inicio.slice(0, 5)} - ${existingSchedule.hora_fin.slice(0, 5)}`}
                                    </div>
                                ) : (
                                    <div className={`text-[10px] opacity-70 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        Cerrado
                                    </div>
                                )}

                                {isSelected && <CheckCircle size={16} className="mt-2 text-white" />}
                                {!isSelected && hasSchedule && !isInactive && <div className="mt-2 w-4 h-4 rounded-full bg-white/30" />}
                                {!isSelected && isInactive && <div className="mt-2 text-[10px] font-bold text-amber-600">⚠</div>}
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Apertura</label>
                    <input type="time" required className="w-full p-3 rounded-xl border border-slate-200"
                        value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Cierre</label>
                    <input type="time" required className="w-full p-3 rounded-xl border border-slate-200"
                        value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
            </div>

            <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                    Aplicar Horario a Días Seleccionados
                </button>
                {hasInactiveDays && (
                    <button
                        type="button"
                        onClick={handleReopen}
                        className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                        Reabrir
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                    Cerrar Clínica
                </button>
            </div>
        </form>
    );
};

export default GlobalAvailabilityForm;
