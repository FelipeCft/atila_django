import React, { useEffect, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { getDashboardTopServices } from '../../api/Dashboard';

const TopServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopServices();
    }, []);

    const fetchTopServices = async () => {
        try {
            const data = await getDashboardTopServices(5, 30);
            setServices(data.services || []);
        } catch (error) {
            console.error('Error fetching top services:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMaxCount = () => {
        if (services.length === 0) return 1;
        return Math.max(...services.map(s => s.cantidad));
    };

    const getPercentage = (count) => {
        const max = getMaxCount();
        return (count / max) * 100;
    };

    const getMedalColor = (index) => {
        const colors = ['text-amber-500', 'text-slate-400', 'text-orange-600'];
        return colors[index] || 'text-slate-300';
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Servicios Más Solicitados</h3>
                <p className="text-slate-400 text-sm">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Award className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Top Servicios</h3>
                <span className="text-xs text-slate-500 ml-auto">Últimos 30 días</span>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-8">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No hay datos disponibles</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        >
                            <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center font-bold text-sm ${getMedalColor(index)}`}>
                                {index + 1}
                            </div>

                            {/* Información */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate mb-1">
                                    {service.nombre}
                                </p>
                                {/* Barra de progreso */}
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                                        style={{ width: `${getPercentage(service.cantidad)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-bold text-slate-800">{service.cantidad}</p>
                                <p className="text-xs text-slate-500">citas</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopServices;
