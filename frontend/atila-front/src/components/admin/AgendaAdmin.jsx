import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, XCircle } from 'lucide-react';
import { ui } from '../../utilities/ui';
import { getAllUsers } from '../../api/userService';
import { getCitas, getHorarios, getHorarioGeneral } from '../../api/agenda';
import { getServicios } from '../../api/Servicios';

// Sub-components
import AgendaGrid from '../../features/agenda/components/AgendaGrid';
import AppointmentModal from '../../features/agenda/components/AppointmentModal';
import GlobalAvailabilityForm from '../../features/agenda/components/GlobalAvailabilityForm';
import AvailabilityForm from '../../features/agenda/components/AvailabilityForm';


const AgendaAdmin = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('AGENDA'); // AGENDA, DISPONIBILIDAD
    const [availabilitySubTab, setAvailabilitySubTab] = useState('CLINICA'); // CLINICA, PERSONAL
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('ALL');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [citas, setCitas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [globalHours, setGlobalHours] = useState([]);

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
    const [editingCita, setEditingCita] = useState(null);
    const [clientsList, setClientsList] = useState([]);

    // Default new cita state (for modal initialization)
    const initialCitaState = {
        cliente: '', profesional: '', servicio: '', inicio: '', fin: '', observaciones: '', estado: 'PENDING'
    };

    // --- Loading ---
    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, citasData, horariosData, serviciosData, globalHoursData] = await Promise.all([
                getAllUsers(),
                getCitas(),
                getHorarios(),
                getServicios(),
                getHorarioGeneral()
            ]);

            const onlyStaff = usersData.filter(u => u.role === 'STAFF');
            setStaffList(onlyStaff);
            setClientsList(usersData.filter(u => u.role === 'CLIENT'));

            setCitas(citasData);
            setHorarios(horariosData);

            setServicios(serviciosData);
            setGlobalHours(globalHoursData || []);

        } catch (error) {
            console.error("Error loading agenda data:", error);
            ui.error("Error al cargar datos de la agenda");
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

    const changeWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // --- Handlers ---
    const openNewCitaModal = () => {
        setEditingCita(null);
        setIsCitaModalOpen(true);
    };

    const handleCitaClick = (cita) => {
        setEditingCita(cita);
        setIsCitaModalOpen(true);
    };

    const handleSlotClick = (e, date) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const pixelsPerHour = 96;
        const startHour = 10; // Grid starts at 10:00 AM

        const hoursElapsed = y / pixelsPerHour;
        const totalMinutesVal = hoursElapsed * 60;
        const roundedMinutes = Math.round(totalMinutesVal / 15) * 15;

        const addedHours = Math.floor(roundedMinutes / 60);
        const addedMinutes = roundedMinutes % 60;

        const finalHour = startHour + addedHours;
        const finalMinutes = addedMinutes;

        const selectedDate = new Date(date);
        selectedDate.setHours(finalHour, finalMinutes, 0, 0);

        // Format for input (YYYY-MM-DDTHH:mm) local time
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const hh = String(selectedDate.getHours()).padStart(2, '0');
        const mm = String(selectedDate.getMinutes()).padStart(2, '0');
        const isoInfo = `${year}-${month}-${day}T${hh}:${mm}`;

        setEditingCita(null);
        // We pass this initial date via props to the modal or state
        // Since we use the same modal, we kind of need to preset the state in the modal.
        // Or we can construct a "partial" cita object to pass as initialData
        setEditingCita({
            ...initialCitaState,
            inicio: isoInfo,
            profesional: selectedStaff !== 'ALL' ? selectedStaff : ''
        });
        setIsCitaModalOpen(true);
    };

    // --- Render Logic ---
    const filteredCitas = citas.filter(c => {
        if (selectedStaff !== 'ALL') {
            const staffId = c.profesional?.id || c.profesional;
            if (parseInt(staffId) !== parseInt(selectedStaff)) return false;
        }
        return true;
    });

    // Prepare data for Modal
    // If editingCita is null, we might have clicked "New Cita" (empty) or a Slot (partial).
    // If it has an ID, it's a real edit.
    // If it has no ID but has date, it's a slot click.
    const modalInitialData = editingCita && editingCita.id ? editingCita : (editingCita || initialCitaState);
    const isEditingRealCita = editingCita && !!editingCita.id;

    // However, AppointmentModal expects 'editingCita' to be the full object if editing, or null if new.
    // My previous logic separates 'editingCita' (the object from DB) vs 'newCita' (form state).
    // The Modal component I wrote takes `editingCita` (prop) to know if it's update vs create, 
    // AND `initialData` to seed the form.

    return (
        <div className="space-y-6 pb-20 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Agenda General</h1>
                    <p className="text-slate-500 mt-1">Gestión de citas y disponibilidad del personal</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openNewCitaModal} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all">
                        <Plus size={18} /> Nueva Cita
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
                {['AGENDA', 'DISPONIBILIDAD'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'AGENDA' && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <Filter size={20} className="text-slate-400 shrink-0" />
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary text-sm"
                        >
                            <option value="ALL">Todos los Profesionales</option>
                            {staffList.map(s => (
                                <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'AGENDA' && (
                        <div className="flex items-center gap-2 md:ml-auto justify-center">
                            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20} /></button>
                            <span className="font-semibold text-slate-700 text-sm md:text-lg min-w-fit px-2 md:px-4 text-center capitalize">
                                {(() => {
                                    const start = weekDays[0];
                                    const end = weekDays[6];

                                    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                                    const getMonth = (d) => capitalize(d.toLocaleDateString('es-ES', { month: 'long' }));

                                    if (start.getMonth() !== end.getMonth()) {
                                        return `${start.getDate()} de ${getMonth(start)} → ${end.getDate()} de ${getMonth(end)}`;
                                    } else {
                                        return `${start.getDate()} → ${end.getDate()} de ${getMonth(start)}`;
                                    }
                                })()}
                            </span>
                            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20} /></button>
                        </div>
                    )}
                </div>
            )}

            {/* Content Switch */}
            {activeTab === 'AGENDA' && (
                <AgendaGrid
                    weekDays={weekDays}
                    filteredCitas={filteredCitas}
                    staffList={staffList}
                    onSlotClick={handleSlotClick}
                    onCitaClick={handleCitaClick}
                />
            )}

            {activeTab === 'DISPONIBILIDAD' && (
                <div className="space-y-6">
                    {/* Sub-Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setAvailabilitySubTab('CLINICA')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${availabilitySubTab === 'CLINICA' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Horario Clínica (General)
                        </button>
                        <button
                            onClick={() => setAvailabilitySubTab('PERSONAL')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${availabilitySubTab === 'PERSONAL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Horario Personal
                        </button>
                    </div>

                    {availabilitySubTab === 'CLINICA' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Configurar Horario Clínica</h2>
                            <p className="text-sm text-slate-500 mb-4">Define los días y horarios de apertura general. Selecciona los días para editar su horario en bloque.</p>
                            <GlobalAvailabilityForm onSuccess={loadData} globalHours={globalHours} />
                        </div>
                    )}

                    {availabilitySubTab === 'PERSONAL' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Configurar Horario Personal</h2>
                            <p className="text-sm text-slate-500 mb-4">Asigna turnos a especialistas. Deben estar dentro del horario de la clínica.</p>
                            <AvailabilityForm staffList={staffList} onSuccess={loadData} globalHours={globalHours} horarios={horarios} />
                        </div>
                    )}
                </div>
            )
            }



            {/* Modal Nueva/Editar Cita */}
            <AppointmentModal
                isOpen={isCitaModalOpen}
                onClose={() => setIsCitaModalOpen(false)}
                onSuccess={loadData}
                editingCita={isEditingRealCita ? editingCita : null}
                initialData={modalInitialData}
                clientsList={clientsList}
                staffList={staffList}
                servicios={servicios}
                horarios={horarios}
                globalHours={globalHours}
                citas={citas}
            />
        </div >
    );
};

export default AgendaAdmin;
