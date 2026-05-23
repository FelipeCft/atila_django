import React from 'react';

const ProfessionalSchedulePreview = ({ profesionalId, horarios = [], globalHours = [] }) => {
    const days = [
        { id: 0, label: 'Lunes' },
        { id: 1, label: 'Martes' },
        { id: 2, label: 'Miércoles' },
        { id: 3, label: 'Jueves' },
        { id: 4, label: 'Viernes' },
        { id: 5, label: 'Sábado' },
        { id: 6, label: 'Domingo' },
    ];

    if (!profesionalId) return null;

    // Filter schedule for this pro
    const staffSchedules = horarios.filter(h => h.profesional === parseInt(profesionalId));

    return (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Horario del Profesional</label>
            <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-x-auto">
                {days.map(day => {
                    const existingSchedule = staffSchedules.find(h => h.dia_semana === day.id);
                    const globalOpen = globalHours.find(h => h.dia_semana === day.id);

                    const hasSchedule = !!existingSchedule;
                    const isClosedGlobally = !globalOpen;

                    let cardClass = "bg-white border-transparent text-slate-400";

                    if (isClosedGlobally) {
                        cardClass = "bg-slate-100 text-slate-300 opacity-50";
                    } else if (hasSchedule) {
                        cardClass = "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                    }

                    return (
                        <div
                            key={day.id}
                            className={`flex flex-col items-center justify-center flex-1 min-w-14 p-1.5 rounded-lg border transition-all ${cardClass}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1">{day.label.slice(0, 3)}</span>

                            {isClosedGlobally ? (
                                <div className="text-[9px] font-bold">CERRADO</div>
                            ) : hasSchedule ? (
                                <div className="text-[9px] font-semibold text-center leading-tight whitespace-nowrap">
                                    {existingSchedule.hora_inicio.slice(0, 5)}<br />{existingSchedule.hora_fin.slice(0, 5)}
                                </div>
                            ) : (
                                <div className="text-[9px] opacity-70">Sin Horario</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfessionalSchedulePreview;
