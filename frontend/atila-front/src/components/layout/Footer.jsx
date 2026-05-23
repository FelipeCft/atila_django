import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Clock } from 'lucide-react';
import { getConfiguracion } from '../../api/Configuracion';

const Footer = () => {
    const [configuracion, setConfiguracion] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await getConfiguracion();
                setConfiguracion(data);
            } catch (error) {
                console.error('Error fetching configuracion for footer:', error);
            }
        };
        fetchConfig();
    }, []);

    return (
        <footer className="bg-surface border-t border-border pt-16 pb-8">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-xl font-bold mb-6">ATILA CENTRO MÉDICO</h3>
                        <p className="text-text-light text-sm leading-relaxed">
                            Cuidamos tu salud con los más altos estándares de calidad y tecnología de vanguardia.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-slate-800">Horarios</h4>
                        <ul className="space-y-4 text-sm text-text-light">
                            <li className="flex items-start gap-3">
                                <Clock size={16} className="text-primary mt-1 shrink-0" />
                                <span>{configuracion?.horario_semana || 'Lunes a Viernes: 8:00 - 20:00'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock size={16} className="text-primary mt-1 shrink-0" />
                                <span>{configuracion?.horario_sabado || 'Sábados: 9:00 - 14:00'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock size={16} className="text-primary mt-1 shrink-0" />
                                <span>{configuracion?.horario_domingo || 'Domingos cerrado'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-slate-800">Contacto</h4>
                        <ul className="space-y-4 text-sm text-text-light">
                            <li className="flex items-center gap-3">
                                <Phone size={16} className="text-primary" />
                                {configuracion?.telefono || '+56 9 1234 5678'}
                            </li>
                            {configuracion?.telefono_fijo && (
                                <li className="flex items-center gap-3">
                                    <Phone size={16} className="text-primary" />
                                    {configuracion.telefono_fijo}
                                </li>
                            )}
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-primary" />
                                {configuracion?.email || 'contacto@atilaclinic.cl'}
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-primary mt-1 shrink-0" />
                                <span>{configuracion?.direccion || 'Av. Principal 123, Santiago'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-slate-800">Redes Sociales</h4>
                        <div className="flex gap-4">
                            {configuracion?.url_instagram && (
                                <a href={configuracion.url_instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background hover:bg-primary hover:text-white transition-all duration-300">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {configuracion?.url_facebook && (
                                <a href={configuracion.url_facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background hover:bg-primary hover:text-white transition-all duration-300">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {configuracion?.url_whatsapp && (
                                <a href={configuracion.url_whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background hover:bg-primary hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-text-light">
                    <p>© {new Date().getFullYear()} Atila Centro Médico. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
