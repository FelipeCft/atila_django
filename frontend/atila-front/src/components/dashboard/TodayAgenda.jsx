import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

const TodayAgenda = ({ citas, loading }) => {
    const getEstadoBadge = (estado) => {
        const badges = {
            'CONFIRMED': 'bg-emerald-50 text-emerald-600',
            'PENDING': 'bg-amber-50 text-amber-600',
            'CANCELLED': 'bg-red-50 text-red-600',
            'COMPLETED': 'bg-blue-50 text-blue-600'
        };
        return badges[estado] || 'bg-slate-100 text-slate-600';
    };

    const getEstadoText = (estado) => {
        const texts = {
            'CONFIRMED': 'Confirmada',
            'PENDING': 'Pendiente',
            'CANCELLED': 'Cancelada',
            'COMPLETED': 'Completada'
        };
        return texts[estado] || estado;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Agenda del Día</h3>
                <p className="text-slate-400 text-sm">Cargando agenda...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Agenda del Día</h3>
            </div>

            <div className="space-y-3">
                {!citas || citas.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Sin citas programadas</p>
                        <p className="text-slate-400 text-xs mt-1">No hay citas pendientes para hoy</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {citas.slice(0, 5).map((cita, index) => (
                            <div
                                key={cita.id || index}
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all"
                            >
                                {/* Hora */}
                                <div className="flex-shrink-0 w-16 text-center">
                                    <div className="flex items-center justify-center gap-1 text-primary">
                                        <Clock size={14} />
                                        <span className="text-sm font-bold">{cita.hora_inicio}</span>
                                    </div>
                                </div>

                                {/* Línea divisora */}
                                <div className="h-12 w-px bg-slate-200"></div>

                                {/* Información */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User size={14} className="text-slate-400 flex-shrink-0" />
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {cita.cliente_nombre}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {cita.servicio_nombre} • {cita.profesional_nombre}
                                    </p>
                                </div>

                                {/* Estado */}
                                <div className="flex-shrink-0">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEstadoBadge(cita.estado)}`}>
                                        {getEstadoText(cita.estado)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {citas.length > 5 && (
                            <div className="text-center pt-2">
                                <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    + {citas.length - 5} cita{citas.length - 5 !== 1 ? 's' : ''} más programada{citas.length - 5 !== 1 ? 's' : ''} para hoy
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayAgenda;
