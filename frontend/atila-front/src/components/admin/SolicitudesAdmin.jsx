import React, { useState, useEffect } from 'react';
import { solicitudesService } from '../../api/Solicitudes';

const SolicitudesAdmin = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSolicitudes = async () => {
        try {
            setLoading(true);
            const data = await solicitudesService.getAll();
            setSolicitudes(data);
            setError(null);
        } catch (err) {
            console.error('Error loading solicitudes:', err);
            setError('Error al cargar las solicitudes de la IA');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSolicitudes();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await solicitudesService.updateStatus(id, newStatus);
            // Optimistically update
            setSolicitudes(prev =>
                prev.map(s => s.id === id ? { ...s, estado: newStatus } : s)
            );
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar el estado');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'PENDIENTE': 'bg-yellow-100 text-yellow-800',
            'CONTACTADO': 'bg-blue-100 text-blue-800',
            'AGENDADO': 'bg-green-100 text-green-800',
            'DESCARTADO': 'bg-gray-100 text-gray-800'
        };
        const defaultBadge = 'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || defaultBadge}`}>{status}</span>;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando solicitudes de IA...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Buzón de IA (Solicitudes de Cita)</h1>
                    <p className="text-sm text-gray-500 mt-1 pl-3">Solicitudes capturadas por el Asistente Virtual que requieren revisión.</p>
                </div>
                <button
                    onClick={loadSolicitudes}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Actualizar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-6">
                {solicitudes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">Buzón Vacío</p>
                        <p>No hay solicitudes pendientes en este momento.</p>
                    </div>
                ) : (
                    solicitudes.map(solicitud => {
                        const fecha = new Date(solicitud.fecha_hora_solicitada);
                        const isPending = solicitud.estado === 'PENDIENTE';

                        return (
                            <div key={solicitud.id} className={`bg-white rounded-xl shadow-sm border ${isPending ? 'border-yellow-300 shadow-yellow-100' : 'border-gray-200'} p-5 flex flex-col transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{solicitud.paciente_nombre}</h3>
                                        <div className="mt-1 flex flex-col gap-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {solicitud.paciente_telefono}
                                            </div>
                                            {solicitud.paciente_email && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {solicitud.paciente_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusBadge(solicitud.estado)}
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3 mb-4 flex-1">
                                    <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Detalles Solicitados</h4>
                                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
                                        <span className="font-medium text-gray-700">Servicio:</span>
                                        <span className="text-gray-900">{solicitud.servicio_solicitado}</span>
                                        <span className="font-medium text-gray-700">Profesional:</span>
                                        <span className="text-gray-900">{solicitud.profesional_solicitado}</span>
                                        <span className="font-medium text-gray-700">Día y Hora:</span>
                                        <span className="text-teal-700 font-semibold">
                                            {fecha.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} a las {fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                                    {solicitud.estado !== 'DESCARTADO' && (
                                        <button
                                            onClick={() => handleUpdateStatus(solicitud.id, 'DESCARTADO')}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                        >
                                            Descartar
                                        </button>
                                    )}
                                    {solicitud.estado === 'PENDIENTE' && (
                                        <button
                                            onClick={() => handleUpdateStatus(solicitud.id, 'CONTACTADO')}
                                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                                        >
                                            Marcar Contactado
                                        </button>
                                    )}
                                    {(solicitud.estado === 'PENDIENTE' || solicitud.estado === 'CONTACTADO') && (
                                        <button
                                            onClick={() => handleUpdateStatus(solicitud.id, 'AGENDADO')}
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors shadow-sm"
                                        >
                                            Agendar (Resolver)
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SolicitudesAdmin;
