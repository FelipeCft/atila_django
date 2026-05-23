import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, UserPlus, Activity, Shield, Tag, Package, ClipboardList, Truck, Calendar, Menu, X, MessageSquare } from 'lucide-react';
import CreateUser from '../components/admin/CreateUser';
import UserList from '../components/admin/UserList';
import ServicesManager from '../components/admin/ServicesManager';
import SpecialtiesManager from '../components/admin/SpecialtiesManager';
import ConveniosManager from '../components/admin/ConveniosManager';
import AgendaAdmin from '../components/admin/AgendaAdmin';
import InsumosManager from '../components/admin/InsumosManager';
import SolicitudesAdmin from '../components/admin/SolicitudesAdmin';
import SettingsManager from '../components/admin/SettingsManager';
import { getDashboardStats } from '../api/Dashboard';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import TrendsChart from '../components/dashboard/TrendsChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TodayAgenda from '../components/dashboard/TodayAgenda';
import TopServices from '../components/dashboard/TopServices';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Get active tab from URL or default to 'dashboard'
    const activeTab = searchParams.get('tab') || 'dashboard';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard General', icon: <LayoutDashboard size={20} /> },
        { id: 'solicitudes', label: 'Buzón IA', icon: <MessageSquare size={20} /> },
        { id: 'agenda', label: 'Gestión Agenda', icon: <Calendar size={20} /> },
        { id: 'create-user', label: 'Crear Usuario', icon: <UserPlus size={20} /> },
        { id: 'users', label: 'Gestión Usuarios', icon: <Users size={20} /> },
        { id: 'especialidades', label: 'Gestión Especialidades', icon: <Tag size={20} /> }, // New Item
        { id: 'services', label: 'Gestión Servicios', icon: <Activity size={20} /> },
        { id: 'convenios', label: 'Gestión Convenios', icon: <Shield size={20} /> },
        { id: 'insumos', label: 'Gestión Inventario', icon: <Package size={20} /> },
        { id: 'reports', label: 'Reportes', icon: <FileText size={20} /> },
        { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
        setIsSidebarOpen(false); // Auto-close on mobile when a tab is selected
    };

    const [stats, setStats] = React.useState({
        total_clientes: 0,
        total_citas_hoy: 0,
        proximas_citas: []
    });
    const [loadingStats, setLoadingStats] = React.useState(true);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            const fetchStats = async () => {
                try {
                    setLoadingStats(true);
                    const data = await getDashboardStats();
                    setStats(data);
                } catch (error) {
                    console.error("Error fetching dashboard stats:", error);
                } finally {
                    setLoadingStats(false);
                }
            };
            fetchStats();
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'solicitudes':
                return <SolicitudesAdmin />;
            case 'agenda':
                return <AgendaAdmin />;
            case 'create-user':
                return <CreateUser />;
            case 'users':
                return <UserList />;
            case 'especialidades':
                return <SpecialtiesManager />; // Render SpecialtiesManager
            case 'services':
                return <ServicesManager />;
            case 'convenios':
                return <ConveniosManager />; // Render ConveniosManager
            case 'insumos':
                return <InsumosManager />;
            case 'settings':
                return <SettingsManager />; // Render SettingsManager
            case 'dashboard':
            default:
                return (
                    <>
                        {/* Métricas principales - 4 cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                {
                                    label: "Clientes",
                                    value: loadingStats ? "..." : stats.total_clientes,
                                    subtitle: loadingStats ? "" : `+${stats.nuevos_clientes_mes || 0} este mes`,
                                    icon: <Users />,
                                    color: "bg-blue-500"
                                },
                                {
                                    label: "Citas Hoy",
                                    value: loadingStats ? "..." : stats.total_citas_hoy,
                                    subtitle: loadingStats ? "" : `${stats.citas_confirmadas_hoy || 0} confirmadas`,
                                    icon: <Calendar />,
                                    color: "bg-emerald-500"
                                },
                                {
                                    label: "Solicitudes",
                                    value: loadingStats ? "..." : stats.solicitudes_pendientes || 0,
                                    subtitle: loadingStats ? "" : `${stats.solicitudes_nuevas_24h || 0} en 24h`,
                                    icon: <MessageSquare />,
                                    color: "bg-purple-500"
                                },
                                {
                                    label: "Stock Bajo",
                                    value: loadingStats ? "..." : (stats.insumos_agotados || 0) + (stats.insumos_stock_bajo || 0),
                                    subtitle: loadingStats ? "" : `${stats.insumos_agotados || 0} agotados`,
                                    icon: <Package />,
                                    color: (stats.insumos_agotados > 0 ? "bg-red-500" : stats.insumos_stock_bajo > 0 ? "bg-amber-500" : "bg-slate-400")
                                },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4`}>
                                        {stat.icon}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                    {stat.subtitle && (
                                        <p className="text-xs text-slate-400 mt-2">{stat.subtitle}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Métricas secundarias - badges informativos */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                                <p className="text-xs font-medium text-blue-700 mb-1">
                                    Tasa Asistencia ({new Date().toLocaleString('es-ES', { month: 'short' })})
                                </p>
                                <p className="text-2xl font-bold text-blue-900">{loadingStats ? "..." : `${stats.tasa_asistencia || 0}%`}</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                                <p className="text-xs font-medium text-emerald-700 mb-1">Completadas (mes)</p>
                                <p className="text-2xl font-bold text-emerald-900">{loadingStats ? "..." : stats.citas_completadas_mes || 0}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
                                <p className="text-xs font-medium text-amber-700 mb-1">
                                    Tasa Cancelación ({new Date().toLocaleString('es-ES', { month: 'short' })})
                                </p>
                                <p className="text-2xl font-bold text-amber-900">{loadingStats ? "..." : `${stats.tasa_cancelacion || 0}%`}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                                <p className="text-xs font-medium text-purple-700 mb-1">Personal Activo</p>
                                <p className="text-2xl font-bold text-purple-900">{loadingStats ? "..." : stats.personal_activo || 0}</p>
                            </div>
                        </div>

                        {/* Gráfico de tendencias y alertas */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2">
                                <TrendsChart />
                            </div>
                            <div>
                                <AlertsPanel />
                            </div>
                        </div>

                        {/* Agenda del día y Top Servicios */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <TodayAgenda citas={stats.proximas_citas} loading={loadingStats} />
                            <TopServices />
                        </div>

                        {/* Actividad reciente y Estado del sistema */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <ActivityFeed />
                            </div>

                            <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20">
                                <h3 className="text-lg font-bold mb-6">Estado del Sistema</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 opacity-90">
                                            <span>Capacidad Servidor</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-white rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 opacity-90">
                                            <span>Base de Datos</span>
                                            <span>Óptimo</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="w-full h-full bg-emerald-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 opacity-90">
                                            <span>Versión</span>
                                            <span>v2.1</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="w-full h-full bg-blue-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleTabChange('settings')}
                                    className="w-full bg-white text-primary btn mt-8 hover:bg-slate-50 border-none transition-colors"
                                >
                                    Configuración Rápida
                                </button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="container-custom pt-32 lg:pt-36 pb-8 min-h-screen flex flex-col">

            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">Admin Panel</h1>
                    <p className="text-slate-500 text-xs">Gestión y control</p>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <Menu size={24} className="text-slate-700" />
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 lg:w-auto lg:shadow-none lg:bg-transparent lg:col-span-3 lg:z-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="bg-white p-6 rounded-none lg:rounded-4xl lg:border lg:border-slate-100 lg:shadow-sm h-full lg:h-auto overflow-y-auto lg:sticky lg:top-32">
                        <div className="mb-8 px-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
                                <p className="text-slate-400 text-xs mt-1">v1.2.0 Stable</p>
                            </div>
                            {/* Mobile Close Button */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 px-4 pb-8 lg:pb-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{user?.full_name}</p>
                                    <p className="text-xs text-slate-500">Administrador</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full btn btn-outline border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 justify-start px-4"
                            >
                                <LogOut size={18} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 w-full min-w-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
