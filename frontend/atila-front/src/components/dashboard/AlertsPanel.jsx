import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Clock, MessageSquare, Package } from 'lucide-react';
import { getDashboardAlerts } from '../../api/Dashboard';

const AlertsPanel = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
        // Actualizar cada 3 minutos (180000 ms)
        const interval = setInterval(fetchAlerts, 180000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await getDashboardAlerts();
            setAlerts(data.alerts || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            'alert-circle': AlertCircle,
            'alert-triangle': AlertTriangle,
            'clock': Clock,
            'message-square': MessageSquare,
            'package': Package
        };
        const Icon = icons[iconName] || AlertCircle;
        return <Icon size={18} />;
    };

    const getAlertStyle = (type) => {
        const styles = {
            danger: 'bg-red-50 border-red-200 text-red-700',
            warning: 'bg-amber-50 border-amber-200 text-amber-700',
            info: 'bg-blue-50 border-blue-200 text-blue-700',
            success: 'bg-emerald-50 border-emerald-200 text-emerald-700'
        };
        return styles[type] || styles.info;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Alertas del Sistema</h3>
                <p className="text-slate-400 text-sm">Cargando alertas...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Alertas del Sistema</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
                </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Todo está funcionando correctamente</p>
                        <p className="text-slate-400 text-xs mt-1">No hay alertas en este momento</p>
                    </div>
                ) : (
                    alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-xl border ${getAlertStyle(alert.type)} transition-all hover:shadow-sm`}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon(alert.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{alert.message}</p>
                                {alert.category && (
                                    <p className="text-xs opacity-70 mt-1 capitalize">{alert.category}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
