import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, ClipboardList, ArrowRight } from 'lucide-react';

const StaffDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="container-custom py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Panel de Personal</h1>
                    <p className="text-slate-500 mt-2 italic font-inter">Entorno de trabajo para especialistas</p>
                </div>
                <button onClick={logout} className="btn btn-outline border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200">
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ... Profile Card ... */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border-4 border-white shadow-lg">
                            <span className="text-3xl font-bold">{user?.full_name?.charAt(0)}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user?.full_name}</h2>
                        <p className="text-slate-400 text-sm mb-2">{user?.role}</p>

                        {(user?.rut || user?.phone_number) && (
                            <div className="text-sm text-slate-500 space-y-1 mb-6">
                                {user?.rut && <p>Rut: {user.rut}</p>}
                                {user?.phone_number && <p>Tel: {user.phone_number}</p>}
                            </div>
                        )}

                        <Link to="/staff/agenda" className="w-full btn btn-primary mt-6 flex items-center justify-center gap-2">
                            <Calendar size={18} />
                            Ver Mi Agenda
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <Calendar className="text-primary" />
                                Citas de hoy
                            </h3>
                            <span className="text-sm font-medium text-slate-400 font-inter">Viernes, 9 Enero</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { time: "09:00", patient: "Maria Garcia", type: "Revisión" },
                                { time: "10:30", patient: "Carlos Ruiz", type: "Tratamiento" },
                                { time: "12:15", patient: "Ana Belén", type: "Primera Consulta" }
                            ].map((item, i) => (
                                <div key={i} className="group flex items-center gap-6 p-6 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary/5 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Clock size={20} className="mb-1" />
                                        <span className="font-bold text-sm tracking-tighter">{item.time}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-lg font-bold text-slate-800">{item.patient}</p>
                                        <p className="text-slate-400 text-sm flex items-center gap-1.5 font-inter">
                                            <ClipboardList size={14} />
                                            {item.type}
                                        </p>
                                    </div>
                                    <button className="p-3 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
