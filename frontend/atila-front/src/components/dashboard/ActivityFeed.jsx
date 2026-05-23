import React, { useEffect, useState } from 'react';
import { Activity, Calendar, MessageSquare, Clock } from 'lucide-react';
import { getDashboardActivity } from '../../api/Dashboard';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
        // Actualizar cada 60 segundos
        const interval = setInterval(fetchActivity, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchActivity = async () => {
        try {
            const data = await getDashboardActivity(8);
            setActivities(data.activities || []);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            'calendar': Calendar,
            'message-square': MessageSquare,
            'clock': Clock
        };
        const Icon = icons[iconName] || Activity;
        return <Icon size={16} />;
    };

    const getActivityColor = (type) => {
        const colors = {
            cita: 'bg-blue-100 text-blue-600',
            solicitud: 'bg-purple-100 text-purple-600',
            default: 'bg-slate-100 text-slate-600'
        };
        return colors[type] || colors.default;
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                <p className="text-slate-400 text-sm">Cargando actividad...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
            </div>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No hay actividad reciente</p>
                    </div>
                ) : (
                    activities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                {getIcon(activity.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
