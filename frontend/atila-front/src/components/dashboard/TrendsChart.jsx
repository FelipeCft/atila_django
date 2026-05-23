import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { getDashboardTrends } from '../../api/Dashboard';

const TrendsChart = () => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState(7);

    useEffect(() => {
        fetchTrends();
    }, [period]);

    const fetchTrends = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDashboardTrends(period);
            console.log('Trends data received:', data);
            setTrends(data.trends || []);
        } catch (error) {
            console.error('Error fetching trends:', error);
            setError('Error al cargar tendencias');
        } finally {
            setLoading(false);
        }
    };

    const getMaxValue = () => {
        if (trends.length === 0) {
            return period === 7 ? 10 : 100;
        }
        const max = Math.max(...trends.map(t => t.total));

        if (period === 7) {
            // Para 7 días: escala base de 10
            if (max <= 10) return 10;
            // Si supera 10, redondea al siguiente múltiplo de 5
            const roundTo = 5;
            return Math.ceil(max / roundTo) * roundTo;
        } else {
            // Para 30 días: escala base de 100
            if (max <= 100) return 100;
            // Si supera 100, redondea al siguiente múltiplo de 50
            const roundTo = 50;
            return Math.ceil(max / roundTo) * roundTo;
        }
    };

    const getBarHeight = (value) => {
        if (value === 0) return '8px';
        const maxValue = getMaxValue();
        const percentage = (value / maxValue) * 100;
        return `${Math.max(percentage, 8)}%`;
    };

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, parseInt(month) - 1, day);
        const dayOfMonth = date.getDate();
        const monthStr = date.toLocaleDateString('es-ES', { month: 'short' });
        return `${dayOfMonth} ${monthStr}`;
    };

    const getYPosition = (value, chartHeight = 192) => {
        const maxValue = getMaxValue();
        if (maxValue === 0) return chartHeight;
        const percentage = (value / maxValue);
        return chartHeight - (percentage * chartHeight);
    };

    const createPath = (data, key = 'total') => {
        if (data.length === 0) return '';

        const chartHeight = 192;
        const chartWidth = 100;
        const stepX = chartWidth / (data.length - 1 || 1);

        let path = '';
        data.forEach((point, index) => {
            const x = index * stepX;
            const y = getYPosition(point[key], chartHeight);

            if (index === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });

        return path;
    };

    const createAreaPath = (data, key = 'total') => {
        if (data.length === 0) return '';

        const chartHeight = 192;
        const chartWidth = 100;
        const stepX = chartWidth / (data.length - 1 || 1);

        // Empezar desde abajo a la izquierda
        let path = `M 0 ${chartHeight}`;

        // Ir hacia arriba al primer punto
        const firstY = getYPosition(data[0][key], chartHeight);
        path += ` L 0 ${firstY}`;

        // Dibujar la línea siguiendo los datos
        data.forEach((point, index) => {
            const x = index * stepX;
            const y = getYPosition(point[key], chartHeight);
            path += ` L ${x} ${y}`;
        });

        // Bajar desde el último punto hasta abajo
        path += ` L ${chartWidth} ${chartHeight}`;

        // Cerrar el path
        path += ' Z';

        return path;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tendencia de Citas</h3>
                <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-slate-400 text-sm">Cargando datos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tendencia de Citas</h3>
                <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                        <p className="text-red-500 text-sm">{error}</p>
                        <button
                            onClick={fetchTrends}
                            className="mt-3 text-xs text-primary hover:underline"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary" size={20} />
                    <h3 className="text-lg font-bold text-slate-800">Tendencia de Citas</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod(7)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${period === 7
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        7 días
                    </button>
                    <button
                        onClick={() => setPeriod(30)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${period === 30
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        30 días
                    </button>
                </div>
            </div>

            {trends.length === 0 ? (
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No hay datos disponibles</p>
                </div>
            ) : (
                <>
                    {/* Gráfico de LÍNEAS para 30 días */}
                    <div className="relative mb-4">
                        {/* Eje Y - Labels de valores */}
                        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-slate-400 pr-2 -ml-8 w-8 text-right">
                            <span>{getMaxValue()}</span>
                            <span>{Math.round(getMaxValue() * 0.75)}</span>
                            <span>{Math.round(getMaxValue() * 0.5)}</span>
                            <span>{Math.round(getMaxValue() * 0.25)}</span>
                            <span>0</span>
                        </div>

                        {/* SVG Chart */}
                        <svg className="w-full h-48 ml-2" viewBox="0 0 100 48" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.05" />
                            <line x1="0" y1="12" x2="100" y2="12" stroke="#e2e8f0" strokeWidth="0.05" />
                            <line x1="0" y1="24" x2="100" y2="24" stroke="#e2e8f0" strokeWidth="0.05" />
                            <line x1="0" y1="36" x2="100" y2="36" stroke="#e2e8f0" strokeWidth="0.05" />
                            <line x1="0" y1="48" x2="100" y2="48" stroke="#e2e8f0" strokeWidth="0.05" />

                            {/* Gradiente para área */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Renderizar líneas y áreas usando un componente más controlado */}
                            {trends.length > 0 && (() => {
                                const chartHeight = 48;
                                const chartWidth = 100;
                                const maxVal = getMaxValue();
                                const padding = 2; // Padding superior e inferior
                                const points = trends.map((trend, index) => {
                                    const x = (index / (trends.length - 1 || 1)) * chartWidth;
                                    const availableHeight = chartHeight - (padding * 2);
                                    const yTotal = padding + (availableHeight - ((trend.total / maxVal) * availableHeight));
                                    const yConf = padding + (availableHeight - ((trend.confirmadas / maxVal) * availableHeight));
                                    const yComp = padding + (availableHeight - ((trend.completadas / maxVal) * availableHeight));
                                    const yCan = padding + (availableHeight - ((trend.canceladas / maxVal) * availableHeight));
                                    return { x, yTotal, yConf, yComp, yCan };
                                });

                                // Crear path del área
                                const areaPath = `M 0,${chartHeight} L ${points.map(p => `${p.x},${p.yTotal}`).join(' L ')} L ${chartWidth},${chartHeight} Z`;

                                // Crear paths de líneas
                                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.yTotal}`).join(' ');
                                const confPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.yConf}`).join(' ');
                                const compPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.yComp}`).join(' ');
                                const canPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.yCan}`).join(' ');

                                return (
                                    <>
                                        {/* Área bajo la curva */}
                                        <path d={areaPath} fill="url(#areaGradient)" />

                                        {/* Líneas */}
                                        <path d={linePath} stroke="#0EA5E9" strokeWidth="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d={confPath} stroke="#10B981" strokeWidth="0.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                                        <path d={compPath} stroke="#3B82F6" strokeWidth="0.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                                        <path d={canPath} stroke="#EF4444" strokeWidth="0.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

                                        {/* Puntos */}
                                        {points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.yTotal} r="0.3" fill="#0EA5E9" />
                                        ))}
                                    </>
                                );
                            })()}
                        </svg>

                        {/* Labels del eje X */}
                        <div className="flex justify-between mt-2 px-1">
                            {trends.filter((_, i) => period === 7 ? true : i % Math.ceil(trends.length / 6) === 0).map((trend, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">
                                        {formatDate(trend.date)}
                                    </span>
                                    {period === 7 && (
                                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">
                                            {trend.day}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-primary"></div>
                            <span className="text-xs text-slate-600">Total</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-emerald-500"></div>
                            <span className="text-xs text-slate-600">Confirmadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            <span className="text-xs text-slate-600">Completadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            <span className="text-xs text-slate-600">Canceladas</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrendsChart;
