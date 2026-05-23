import React, { useState } from 'react';
import { Clock, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { computeLayout, getStaffColor } from '../utils/gridUtils';
import CurrentTimeLine from './CurrentTimeLine';

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const AgendaGrid = ({
    weekDays,
    filteredCitas,
    staffList,
    onSlotClick,
    onCitaClick
}) => {
    // Find today's index in the weekDays array (default to 0 if not found)
    const todayIndex = weekDays.findIndex(d => d.toDateString() === new Date().toDateString());
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);

    const selectedDay = weekDays[selectedDayIndex];

    /** Renders a single day column with its citas */
    const renderDayColumn = (dayDate, i, isMobile = false) => {
        const dayCitas = filteredCitas.filter(c => new Date(c.inicio).toDateString() === dayDate.toDateString());
        const layoutCitas = computeLayout(dayCitas);

        return (
            <div
                key={i}
                onClick={(e) => onSlotClick(e, dayDate)}
                className="relative h-full bg-white group hover:bg-slate-50/30 transition-colors border-r border-slate-100 last:border-r-0 cursor-pointer"
            >
                {/* Background Grid Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {Array.from({ length: 10 }).map((_, h) => (
                        <div key={h} className="h-24 border-b border-slate-200 w-full" />
                    ))}
                </div>

                {/* Click area indicator - visible on hover */}
                <div className="absolute left-0 top-0 w-[15%] h-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
                    <div className="w-full h-full bg-primary/5 border-r border-primary/20"></div>
                </div>

                {/* Render Citas */}
                {layoutCitas.map(({ cita, style }) => {
                    const staffColor = getStaffColor(cita.profesional?.id || cita.profesional);
                    const staffId = cita.profesional?.id || cita.profesional;
                    const staffMember = staffList.find(s => s.user_id === parseInt(staffId));
                    const staffName = staffMember ? staffMember.full_name : 'Staff';
                    const startTime = new Date(cita.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div
                            key={cita.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCitaClick(cita);
                            }}
                            className={`absolute rounded-lg border-l-4 p-1.5 text-xs cursor-pointer hover:shadow-xl z-10 hover:brightness-100 group overflow-hidden leading-tight ${isMobile ? '' : 'cita-card-hover'} ${staffColor.bg} ${staffColor.border}`}
                            style={style}
                        >
                            {/* Header: Service & Time */}
                            <div className="flex justify-between items-start gap-1">
                                <span className={`font-bold truncate group-hover:whitespace-normal ${staffColor.text}`}>
                                    {cita.servicio_data?.nombre || 'Servicio'}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    {cita.estado === 'CONFIRMED' && <CheckCircle size={10} className="text-emerald-600" />}
                                    {cita.estado === 'PENDING' && <Clock size={10} className="text-amber-600" />}
                                    <span className={`text-[10px] font-mono opacity-80 ${staffColor.text}`}>
                                        {startTime}
                                    </span>
                                </div>
                            </div>

                            {/* Client */}
                            <div className={`truncate group-hover:whitespace-normal font-medium mb-0.5 ${staffColor.text}`}>
                                <User size={10} className="inline mr-1 opacity-70" />
                                {cita.cliente_data?.full_name}
                            </div>

                            {/* Status Text */}
                            <div className={`${isMobile ? 'block' : 'hidden group-hover:block'} text-[9px] font-bold uppercase mb-0.5 ${cita.estado === 'CONFIRMED' ? 'text-emerald-700' :
                                cita.estado === 'PENDING' ? 'text-amber-700' :
                                    'text-slate-500'
                                }`}>
                                {cita.estado === 'CONFIRMED' ? 'Confirmada' :
                                    cita.estado === 'PENDING' ? 'Pendiente' : cita.estado}
                            </div>

                            {/* Staff */}
                            <div className={`truncate group-hover:whitespace-normal opacity-80 text-[10px] ${staffColor.text}`}>
                                <span className="opacity-70">Atiende: </span>
                                {staffName}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-auto">
            <style>{`
                .cita-card-hover:hover {
                    height: auto !important;
                    min-height: fit-content !important;
                    width: 16rem !important;
                    z-index: 100 !important;
                }
            `}</style>

            {/* ==================== MOBILE VIEW (<md) ==================== */}
            <div className="md:hidden flex flex-col h-full">
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
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-[3.5rem_1fr] min-h-[960px]">
                        {/* Time Column */}
                        <div className="bg-slate-50 divide-y divide-slate-100 border-r border-slate-100">
                            {Array.from({ length: 10 }).map((_, i) => {
                                const hour = i + 10;
                                return (
                                    <div key={hour} className="h-24 p-1 text-[11px] font-bold text-slate-400 text-right flex items-start justify-end pt-1">
                                        {hour}:00
                                    </div>
                                );
                            })}
                        </div>

                        {/* Single Day Column */}
                        <div className="relative h-full">
                            <CurrentTimeLine startHour={10} endHour={20} />
                            {renderDayColumn(selectedDay, selectedDayIndex, true)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== DESKTOP VIEW (≥md) ==================== */}
            <div className="hidden md:flex flex-1 overflow-auto relative flex-col">
                {/* Min-width wrapper to force scroll on smaller desktops */}
                <div className="min-w-[800px] flex flex-col flex-1">
                    {/* Header */}
                    <div className="grid grid-cols-8 divide-x divide-slate-100 border-b border-slate-100 sticky top-0 z-30 bg-white shadow-sm">
                        <div className="p-4 bg-slate-50 font-bold text-xs text-slate-400 uppercase sticky left-0 z-40 shadow-sm border-r border-slate-100">Hora</div>
                        {weekDays.map((date, i) => (
                            <div key={i} className={`p-4 text-center ${date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                                <div className="text-xs font-bold text-slate-400 uppercase">{DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                                <div className={`text-lg font-bold mt-1 ${date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-700'}`}>{date.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="grid grid-cols-8 divide-x divide-slate-100 min-h-[960px]">
                        {/* Time Column */}
                        <div className="bg-slate-50 divide-y divide-slate-100 sticky left-0 z-20 border-r border-slate-100 shadow-sm">
                            {Array.from({ length: 10 }).map((_, i) => {
                                const hour = i + 10;
                                return (
                                    <div key={hour} className="h-24 p-2 text-xs font-bold text-slate-400 text-right">
                                        {hour}:00
                                    </div>
                                );
                            })}
                        </div>

                        {/* Days Columns */}
                        <div className="col-span-7 relative flex w-full">
                            <CurrentTimeLine startHour={10} endHour={20} />
                            {weekDays.map((dayDate, i) => (
                                <div key={i} className="flex-1 w-full">
                                    {renderDayColumn(dayDate, i, false)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaGrid;
