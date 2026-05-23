import React, { useState, useMemo } from 'react';
import { XCircle } from 'lucide-react';
import { ui } from '../../../utilities/ui';
import { createCita, updateCita, deleteCita } from '../../../api/agenda';
import ProfessionalSchedulePreview from './ProfessionalSchedulePreview';

const AppointmentModal = ({
    isOpen,
    onClose,
    onSuccess,
    editingCita,
    initialData,
    clientsList,
    staffList,
    servicios,
    horarios,
    globalHours,
    citas // Needed for conflict checking
}) => {
    const [newCita, setNewCita] = useState(initialData);
    const [showEndInput, setShowEndInput] = useState(false);

    // Searchable Selects State
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    const [staffSearch, setStaffSearch] = useState('');
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

    const [serviceSearch, setServiceSearch] = useState('');
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

    // Sync state when modal opens or initialData changes
    React.useEffect(() => {
        if (isOpen) {
            setNewCita(initialData);
        }
    }, [isOpen, initialData]);

    const timeOptions = useMemo(() => {
        const options = [];
        for (let h = 9; h < 21; h++) {
            for (let m = 0; m < 60; m += 15) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                options.push(time);
            }
        }
        return options;
    }, []);

    const calculateEndDate = (start, duration) => {
        if (!start) return '';
        const date = new Date(start);

        let minutes = 30; // Default duration

        if (duration) {
            if (typeof duration === 'number') {
                minutes = duration;
            } else if (typeof duration === 'string' && duration.includes(':')) {
                const parts = duration.split(':').map(Number);
                if (parts.length >= 2) {
                    minutes = (parts[0] * 60) + parts[1];
                } else if (parts.length === 1) {
                    minutes = parts[0];
                }
            }
        }

        date.setMinutes(date.getMinutes() + minutes);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${min}`;
    };

    const validateAppointment = (appointment) => {
        const start = new Date(appointment.inicio);
        const end = new Date(appointment.fin);

        const jsDay = start.getDay();
        const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

        // 1. Clinic Global Hours
        const globalDay = globalHours.find(gh => gh.dia_semana === dayOfWeek && gh.activo);

        if (!globalDay) {
            return "La clínica está cerrada este día.";
        }

        const getTimeString = (dateObj) => {
            return dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        };

        const appStart = getTimeString(start);
        const appEnd = getTimeString(end);

        if (appStart < globalDay.hora_inicio.slice(0, 5) || appEnd > globalDay.hora_fin.slice(0, 5)) {
            return `La cita está fuera del horario de la clínica (${globalDay.hora_inicio.slice(0, 5)} - ${globalDay.hora_fin.slice(0, 5)}).`;
        }

        // 2. Staff Availability
        const staffId = parseInt(appointment.profesional);

        const staffSchedule = horarios.find(h =>
            h.profesional === staffId &&
            h.dia_semana === dayOfWeek
        );

        if (!staffSchedule) {
            return "El profesional no tiene turno asignado para este día.";
        }

        if (appStart < staffSchedule.hora_inicio.slice(0, 5) || appEnd > staffSchedule.hora_fin.slice(0, 5)) {
            return `La cita está fuera del horario del profesional (${staffSchedule.hora_inicio.slice(0, 5)} - ${staffSchedule.hora_fin.slice(0, 5)}).`;
        }

        // 3. Overlaps
        const conflicts = citas.filter(c => {
            const cStaffId = c.profesional?.id || c.profesional;

            if (cStaffId !== staffId) return false;

            // Handle editing: exclude self
            if (editingCita && c.id === editingCita.id) return false;

            // Citas canceladas no bloquean el horario
            if (c.estado === 'CANCELLED') return false;

            const cStart = new Date(c.inicio);
            const cEnd = new Date(c.fin);

            return start < cEnd && end > cStart;
        });

        if (conflicts.length > 0) {
            return "El profesional ya tiene una cita en este horario (Conflicto de horario).";
        }

        return null;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateAppointment(newCita);
        if (validationError) {
            ui.error(validationError);
            return;
        }

        try {
            const payload = {
                ...newCita,
                inicio: new Date(newCita.inicio).toISOString(),
                fin: new Date(newCita.fin).toISOString(),
            };

            if (editingCita) {
                await updateCita(editingCita.id, payload);
                ui.success("Cita actualizada exitosamente");
            } else {
                await createCita(payload);
                ui.success("Cita agendada exitosamente");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            ui.error(editingCita ? "Error al actualizar cita" : "Error al crear cita");
        }
    };

    const handleDelete = async () => {
        if (!editingCita) return;
        const confirmed = await ui.confirm({
            title: '¿Eliminar cita?',
            message: '¿Estás seguro de que deseas eliminar esta cita?',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            await deleteCita(editingCita.id);
            ui.success("Cita eliminada");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            ui.error("Error al eliminar cita");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" >
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">
                    <h2 className="text-xl font-bold">{editingCita ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    {editingCita && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Eliminar Cita"
                        >
                            <XCircle size={16} strokeWidth={2.5} />
                            Eliminar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Cliente</label>
                        <div
                            className={`w-full p-3 rounded-xl border flex justify-between items-center cursor-pointer bg-white border-slate-200 hover:border-slate-300`}
                            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        >
                            <span className="truncate">
                                {newCita.cliente
                                    ? (() => {
                                        const selectedClient = clientsList.find(c => c.user_id === parseInt(newCita.cliente));
                                        return selectedClient ? selectedClient.full_name : 'Seleccionar Cliente';
                                    })()
                                    : 'Seleccionar Cliente'}
                            </span>
                            <div className={`transition-transform duration-200 ${isClientDropdownOpen ? 'rotate-180' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {isClientDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                <div className="p-2 border-b border-slate-100 bg-slate-50">
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary bg-white"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {clientsList
                                        .filter(c => !clientSearch.trim() || c.full_name.toLowerCase().includes(clientSearch.trim().toLowerCase()))
                                        .map(c => (
                                            <div
                                                key={c.user_id}
                                                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors text-sm border-b border-slate-50 last:border-none ${parseInt(newCita.cliente) === c.user_id ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700'}`}
                                                onClick={() => {
                                                    setNewCita({ ...newCita, cliente: c.user_id.toString() });
                                                    setIsClientDropdownOpen(false);
                                                }}
                                            >
                                                <div className="font-medium">{c.full_name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {c.rut || c.email || c.phone_number || "Sin información extra"}
                                                </div>
                                            </div>
                                        ))}
                                    {clientsList.filter(c => !clientSearch.trim() || c.full_name.toLowerCase().includes(clientSearch.trim().toLowerCase())).length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No se encontraron clientes
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {isClientDropdownOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)} />
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Profesional</label>
                        <div
                            className={`w-full p-3 rounded-xl border flex justify-between items-center cursor-pointer bg-white border-slate-200 hover:border-slate-300`}
                            onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                        >
                            <span className="truncate">
                                {newCita.profesional
                                    ? (() => {
                                        const selectedStaff = staffList.find(s => s.user_id === parseInt(newCita.profesional));
                                        return selectedStaff ? selectedStaff.full_name : 'Seleccionar Profesional';
                                    })()
                                    : 'Seleccionar Profesional'}
                            </span>
                            <div className={`transition-transform duration-200 ${isStaffDropdownOpen ? 'rotate-180' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {isStaffDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                <div className="p-2 border-b border-slate-100 bg-slate-50">
                                    <input
                                        type="text"
                                        placeholder="Buscar profesional..."
                                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary bg-white"
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {staffList
                                        .filter(s => !staffSearch.trim() || s.full_name.toLowerCase().includes(staffSearch.trim().toLowerCase()))
                                        .map(s => (
                                            <div
                                                key={s.user_id}
                                                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors text-sm border-b border-slate-50 last:border-none ${parseInt(newCita.profesional) === s.user_id ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700'}`}
                                                onClick={() => {
                                                    setNewCita({ ...newCita, profesional: s.user_id.toString(), servicio: '' }); // Reset service on professional change
                                                    setIsStaffDropdownOpen(false);
                                                }}
                                            >
                                                <div className="font-medium">{s.full_name}</div>
                                                {s.position && <div className="text-xs text-slate-500 mt-0.5">{s.position}</div>}
                                            </div>
                                        ))}
                                    {staffList.filter(s => !staffSearch.trim() || s.full_name.toLowerCase().includes(staffSearch.trim().toLowerCase())).length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No se encontraron profesionales
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {isStaffDropdownOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsStaffDropdownOpen(false)} />
                        )}

                        <div className="mt-4">
                            <ProfessionalSchedulePreview
                                profesionalId={newCita.profesional}
                                horarios={horarios}
                                globalHours={globalHours}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Servicio</label>

                        <div
                            className={`w-full p-3 rounded-xl border flex justify-between items-center cursor-pointer ${!newCita.profesional ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            onClick={() => newCita.profesional && setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                        >
                            <span className="truncate">
                                {!newCita.profesional
                                    ? 'Primero selecciona un profesional'
                                    : newCita.servicio
                                        ? (() => {
                                            const selectedService = servicios.find(s => s.id === parseInt(newCita.servicio));
                                            return selectedService ? `${selectedService.nombre} - $${selectedService.precio}${selectedService.duracion ? ` (${selectedService.duracion} min)` : ''}` : 'Seleccionar Servicio';
                                        })()
                                        : 'Seleccionar Servicio'}
                            </span>
                            <div className={`transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Custom Dropdown Content */}
                        {isServiceDropdownOpen && newCita.profesional && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                {/* Search Bar Inside Dropdown */}
                                <div className="p-2 border-b border-slate-100 bg-slate-50">
                                    <input
                                        type="text"
                                        placeholder="Buscar servicio..."
                                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary bg-white"
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>

                                {/* Options List */}
                                <div className="max-h-60 overflow-y-auto">
                                    {servicios
                                        .filter(s => {
                                            const prof = staffList.find(staff => staff.user_id === parseInt(newCita.profesional));
                                            if (!prof) return true;

                                            // If the professional has no specialties assigned, show all services (fallback)
                                            if (!prof.especialidades || prof.especialidades.length === 0) return true;

                                            // If the service has no specialty assigned, it's a general service (always show)
                                            if (!s.especialidad) return true;

                                            // Only show service if its specialty ID is among the professional's specialty IDs
                                            return prof.especialidades.includes(s.especialidad);
                                        })
                                        .filter(s => {
                                            if (!serviceSearch.trim()) return true;
                                            return s.nombre.toLowerCase().includes(serviceSearch.trim().toLowerCase());
                                        })
                                        .map(s => (
                                            <div
                                                key={s.id}
                                                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors text-sm border-b border-slate-50 last:border-none ${parseInt(newCita.servicio) === s.id ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700'}`}
                                                onClick={() => {
                                                    let updates = { servicio: s.id.toString() };
                                                    if (newCita.inicio) {
                                                        updates.fin = calculateEndDate(newCita.inicio, s.duracion);
                                                    }
                                                    setNewCita({ ...newCita, ...updates });
                                                    setIsServiceDropdownOpen(false);
                                                }}
                                            >
                                                {s.nombre} - ${s.precio}{s.duracion ? ` (${s.duracion} min)` : ''}
                                            </div>
                                        ))}
                                    {servicios.filter(s => {
                                        const prof = staffList.find(staff => staff.user_id === parseInt(newCita.profesional));
                                        if (!prof) return true;
                                        if (!prof.especialidades || prof.especialidades.length === 0) return true;
                                        if (!s.especialidad) return true;
                                        return prof.especialidades.includes(s.especialidad);
                                    })
                                        .filter(s => !serviceSearch.trim() || s.nombre.toLowerCase().includes(serviceSearch.trim().toLowerCase()))
                                        .length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-500">
                                                No se encontraron servicios
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Overlay to close dropdown when clicking outside */}
                        {isServiceDropdownOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsServiceDropdownOpen(false)}
                            />
                        )}
                    </div>

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Inicio</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 rounded-xl border border-slate-200"
                                value={newCita.inicio ? newCita.inicio.split('T')[0] : ''}
                                onChange={e => {
                                    const newDate = e.target.value;
                                    const currentTime = newCita.inicio ? newCita.inicio.split('T')[1].slice(0, 5) : '10:00';
                                    const newStart = `${newDate}T${currentTime}`;

                                    let updates = { inicio: newStart };
                                    if (newCita.servicio) {
                                        const s = servicios.find(s => s.id === parseInt(newCita.servicio));
                                        if (s) {
                                            updates.fin = calculateEndDate(newStart, s.duracion);
                                        }
                                    }
                                    setNewCita({ ...newCita, ...updates });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Hora de Inicio</label>
                            <input
                                type="time"
                                list="time-options"
                                required
                                className="w-full p-3 rounded-xl border border-slate-200"
                                value={newCita.inicio ? newCita.inicio.split('T')[1].slice(0, 5) : ''}
                                onChange={e => {
                                    const newTime = e.target.value;
                                    const currentDate = newCita.inicio ? newCita.inicio.split('T')[0] : new Date().toLocaleDateString('en-CA');
                                    const newStart = `${currentDate}T${newTime}`;

                                    let updates = { inicio: newStart };
                                    if (newCita.servicio) {
                                        const s = servicios.find(s => s.id === parseInt(newCita.servicio));
                                        if (s) {
                                            updates.fin = calculateEndDate(newStart, s.duracion);
                                        }
                                    }
                                    setNewCita({ ...newCita, ...updates });
                                }}
                            />
                            <datalist id="time-options">
                                {timeOptions.map(t => (
                                    <option key={t} value={t} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* End Time (Conditional/Calculated) */}
                    <div>
                        {!showEndInput && newCita.fin ? (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-slate-500">
                                    Termina a las <strong className="text-slate-700">{new Date(newCita.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowEndInput(true)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    (Editar manualmente)
                                </button>
                            </div>
                        ) : (
                            <div className={!showEndInput && !newCita.fin ? 'hidden' : ''}>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Fin {showEndInput && <button type="button" onClick={() => setShowEndInput(false)} className="text-xs font-normal text-slate-400 ml-2 hover:text-slate-600">(Cancelar edición)</button>}
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                    value={newCita.fin}
                                    onChange={e => setNewCita({ ...newCita, fin: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Estado</label>
                            <select
                                className="w-full p-3 rounded-xl border border-slate-200"
                                value={newCita.estado}
                                onChange={e => setNewCita({ ...newCita, estado: e.target.value })}
                            >
                                <option value="PENDING">Pendiente</option>
                                <option value="CONFIRMED">Confirmada</option>
                                <option value="COMPLETED">Completada</option>
                                <option value="CANCELLED">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-slate-600">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">
                            {editingCita ? 'Guardar Cambios' : 'Crear Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default AppointmentModal;
