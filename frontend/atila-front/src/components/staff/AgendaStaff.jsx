import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Filter } from 'lucide-react';
import { ui } from '../../utilities/ui';
import { getCitas } from '../../api/agenda';
import { useAuth } from '../../context/AuthContext';
import CurrentTimeLine from '../../features/agenda/components/CurrentTimeLine';
import { getStaffColor } from '../../features/agenda/utils/gridUtils';

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const AgendaStaff = () => {
    // --- State ---
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Loading ---
    const loadData = async () => {
        try {
            setLoading(true);

            const citasData = await getCitas();
            // The API backend 'getCitas' for Staff role already filters by request.user.profile
            // So we just need to display them.
            setCitas(citasData);

        } catch (error) {
            console.error("Error loading agenda data:", error);
            ui.error("Error al cargar agenda");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Helpers ---
    const getWeekDays = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Start Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(currentDate);

    // Mobile: selected day index
    const todayIndex = weekDays.findIndex(d => d.toDateString() === new Date().toDateString());
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);

    const changeWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    /** Renders a single day column with its citas */
    const renderDayColumn = (dayDate, i) => (
        <div key={i} className="flex-1 w-full relative bg-white group hover:bg-slate-50/30 transition-colors border-r border-slate-100 last:border-r-0">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {Array.from({ length: 13 }).map((_, h) => (
                    <div key={h} className="h-24 border-b border-slate-100/50 w-full" />
                ))}
            </div>

            {/* Render Citas */}
            {citas.filter(c => new Date(c.inicio).toDateString() === dayDate.toDateString()).map(cita => {
                const start = new Date(cita.inicio);
                const end = new Date(cita.fin);
                const startHour = start.getHours();
                const duration = (end - start) / (1000 * 60 * 60); // hours
                const top = (startHour - 8) * 96;
                const height = duration * 96;

                // Determine color based on user's profile
                const staffColor = getStaffColor(user?.id, user?.profile?.agenda_color || user?.agenda_color);
                
                const customStyle = staffColor.isCustom ? {
                    backgroundColor: staffColor.backgroundColor,
                    borderColor: staffColor.borderColor,
                    color: staffColor.color
                } : {};

                const cardClasses = staffColor.isCustom 
                    ? "" 
                    : `${staffColor.bg} ${staffColor.border}`;
                    
                const textClasses = staffColor.isCustom ? "" : staffColor.text;

                return (
                    <div
                        key={cita.id}
                        className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 text-xs overflow-hidden hover:shadow-lg transition-all z-10 ${cardClasses}`}
                        style={{ top: `${top}px`, height: `${height}px`, ...customStyle }}
                    >
                        <div className={`font-bold truncate ${textClasses}`}>{cita.servicio_data?.nombre || 'Servicio'}</div>
                        <div className={`truncate ${textClasses}`}>{cita.cliente_data?.full_name}</div>
                        <div className={`text-[10px] ${textClasses}`}>
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    /** Renders the time column */
    const renderTimeColumn = (isMobile = false) => (
        <div className={`bg-slate-50 divide-y divide-slate-100 ${isMobile ? '' : 'sticky left-0 z-20 border-r border-slate-100 shadow-sm'}`}>
            {Array.from({ length: 13 }).map((_, i) => {
                const hour = i + 8;
                return (
                    <div key={hour} className={`h-24 p-1 ${isMobile ? 'text-[11px]' : 'p-2 text-xs'} font-bold text-slate-400 text-right flex items-start justify-end pt-1`}>
                        {hour}:00
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6 pb-20 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mi Agenda</h1>
                    <p className="text-slate-500 mt-1">Vista de tus próximas citas</p>
                </div>
                {/* Navigation */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20} /></button>
                    <span className="font-semibold text-slate-700 text-sm md:text-base w-auto md:w-48 text-center">
                        {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
                    </span>
                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

                {/* ==================== MOBILE VIEW (<md) ==================== */}
                <div className="md:hidden flex flex-col">
                    {/* Day Selector Strip */}
                    <div className="flex items-center border-b border-slate-100 bg-slate-50">
                        <button
                            onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                            className="p-2 hover:bg-slate-200 rounded-lg shrink-0 disabled:opacity-30"
                            disabled={selectedDayIndex === 0}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex-1 flex overflow-x-auto gap-1 px-1 py-2 scrollbar-hide">
                            {weekDays.map((date, i) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = i === selectedDayIndex;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDayIndex(i)}
                                        className={`flex flex-col items-center min-w-[3rem] px-2 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                            : isToday
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="text-[10px] uppercase">{DAY_LABELS[i]}</span>
                                        <span className="text-base">{date.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setSelectedDayIndex(Math.min(6, selectedDayIndex + 1))}
                            className="p-2 hover:bg-slate-200 rounded-lg shrink-0 disabled:opacity-30"
                            disabled={selectedDayIndex === 6}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Mobile Grid: Time + 1 Day */}
                    <div className="relative h-[600px] overflow-y-auto">
                        <div className="grid grid-cols-[3.5rem_1fr] min-h-[1200px]">
                            {renderTimeColumn(true)}
                            <div className="relative h-full">
                                <CurrentTimeLine startHour={8} endHour={21} />
                                {renderDayColumn(weekDays[selectedDayIndex], selectedDayIndex)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== DESKTOP VIEW (≥md) ==================== */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-8 divide-x divide-slate-100 border-b border-slate-100">
                        <div className="p-4 bg-slate-50 font-bold text-xs text-slate-400 uppercase">Hora</div>
                        {weekDays.map((date, i) => (
                            <div key={i} className={`p-4 text-center ${date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                                <div className="text-xs font-bold text-slate-400 uppercase">{DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                                <div className={`text-lg font-bold mt-1 ${date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-700'}`}>{date.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="relative h-[600px] overflow-y-auto">
                        <div className="grid grid-cols-8 divide-x divide-slate-100 min-h-[1200px]">
                            {renderTimeColumn(false)}
                            <div className="col-span-7 relative flex w-full">
                                <CurrentTimeLine startHour={8} endHour={21} />
                                {weekDays.map((dayDate, i) => renderDayColumn(dayDate, i))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AgendaStaff;
