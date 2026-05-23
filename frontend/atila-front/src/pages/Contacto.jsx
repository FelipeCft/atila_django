import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Navigation, Clock } from 'lucide-react';
import PolygonalBackground from '../components/common/PolygonalBackground';
import { getConfiguracion } from '../api/Configuracion';

const Contacto = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await getConfiguracion();
                setConfig(data);
            } catch (error) {
                console.error('Error loading configuration:', error);
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, []);

    if (loading) {
        return (
            <PolygonalBackground className="py-20">
                <div className="container-custom flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            </PolygonalBackground>
        );
    }

    // Valores por defecto en caso de que no se haya configurado
    const telefono = config?.telefono || '+56 9 1234 5678';
    const telefonoFijo = config?.telefono_fijo || '';
    const email = config?.email || 'contacto@atilaclinic.cl';
    const direccion = config?.direccion || 'Av. Principal 123, Vitacura, Santiago';
    const googleMapsEmbedUrl = config?.google_maps_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.7267890123456!2d-70.5956789!3d-33.3904874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDIzJzI1LjgiUyA3MMKwMzUnNDQuNCJX!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl';
    const googleMapsLink = config?.google_maps_link || 'https://www.google.com/maps/search/?api=1&query=Av.+Principal+123,+Vitacura,+Santiago';
    const horarioSemana = config?.horario_semana || 'Lunes a Viernes: 8:00 - 20:00';
    const horarioSabado = config?.horario_sabado || 'Sábados: 9:00 - 14:00';
    const horarioDomingo = config?.horario_domingo || 'Domingos cerrado';
    const infoEstacionamiento = config?.info_estacionamiento || 'Estacionamiento gratuito';
    const infoTransporte = config?.info_transporte || 'Metro: Línea 1, Estación Vitacura\nBus: Líneas 412, 413, 425';

    // Dividir el texto del transporte en líneas
    const transporteLineas = infoTransporte.split('\n').filter(linea => linea.trim() !== '');

    return (
        <PolygonalBackground className="pt-32 md:pt-40 pb-20">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">Contacto</h1>
                    <p className="text-slate-300 text-lg leading-relaxed font-inter">
                        Estamos aquí para ayudarle. Póngase en contacto con nosotros para agendar una cita o resolver cualquier inquietud médica.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex gap-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 p-5 rounded-2xl text-primary h-fit">
                                <Phone size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-slate-800">Teléfono</h3>
                                <p className="text-slate-500 font-inter">{telefono}</p>
                                {telefonoFijo && (
                                    <p className="text-slate-500 font-inter mt-1">{telefonoFijo}</p>
                                )}
                                <p className="text-slate-400 text-sm mt-1">Atención 24/7 para emergencias</p>
                            </div>
                        </div>

                        <div className="flex gap-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 p-5 rounded-2xl text-primary h-fit">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-slate-800">Email</h3>
                                <p className="text-slate-500 font-inter">{email}</p>
                                <p className="text-slate-400 text-sm mt-1">Respuesta en menos de 2h</p>
                            </div>
                        </div>

                        <div className="flex gap-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 p-5 rounded-2xl text-primary h-fit">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-slate-800">Dirección</h3>
                                <p className="text-slate-500 font-inter">{direccion}</p>
                                <p className="text-slate-400 text-sm mt-1">{infoEstacionamiento}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Nuestra Ubicación</h2>
                                    <p className="text-slate-500 font-inter">Encuéntranos en el mapa</p>
                                </div>
                                <a
                                    href={googleMapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary py-3 px-6 flex items-center justify-center gap-2 text-sm w-full md:w-auto"
                                >
                                    <Navigation size={18} />
                                    Cómo llegar
                                </a>
                            </div>

                            {/* Google Maps Embed */}
                            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border-2 border-slate-200">
                                <iframe
                                    title="Ubicación de Centro Médico Atila"
                                    src={googleMapsEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale-0 hover:grayscale-0 transition-all"
                                ></iframe>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock size={18} className="text-primary" />
                                        Horario de Atención
                                    </h4>
                                    <p className="text-slate-600 text-sm font-inter">{horarioSemana}</p>
                                    <p className="text-slate-600 text-sm font-inter">{horarioSabado}</p>
                                    <p className="text-slate-500 text-sm font-inter italic mt-1">{horarioDomingo}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Navigation size={18} className="text-primary" />
                                        Cómo Llegar
                                    </h4>
                                    {transporteLineas.map((linea, index) => (
                                        <p key={index} className="text-slate-600 text-sm font-inter">{linea}</p>
                                    ))}
                                    <p className="text-slate-500 text-sm font-inter italic mt-1">{infoEstacionamiento}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PolygonalBackground>
    );
};

export default Contacto;
