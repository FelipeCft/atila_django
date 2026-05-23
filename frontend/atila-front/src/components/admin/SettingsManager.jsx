import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Mail, Clock, Navigation, AlertCircle, CheckCircle2, ExternalLink, Share2, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { getConfiguracion, updateConfiguracion } from '../../api/Configuracion';
import { ui } from '../../utilities/ui';

const SettingsManager = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        telefono: '',
        telefono_fijo: '',
        email: '',
        direccion: '',
        url_facebook: '',
        url_instagram: '',
        url_whatsapp: '',
        google_maps_embed_url: '',
        google_maps_link: '',
        horario_semana: '',
        horario_sabado: '',
        horario_domingo: '',
        info_estacionamiento: '',
        info_transporte: ''
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await getConfiguracion();
            setConfig(data);
            setFormData({
                telefono: data.telefono || '',
                telefono_fijo: data.telefono_fijo || '',
                email: data.email || '',
                direccion: data.direccion || '',
                url_facebook: data.url_facebook || '',
                url_instagram: data.url_instagram || '',
                url_whatsapp: data.url_whatsapp || '',
                google_maps_embed_url: data.google_maps_embed_url || '',
                google_maps_link: data.google_maps_link || '',
                horario_semana: data.horario_semana || '',
                horario_sabado: data.horario_sabado || '',
                horario_domingo: data.horario_domingo || '',
                info_estacionamiento: data.info_estacionamiento || '',
                info_transporte: data.info_transporte || ''
            });
        } catch (error) {
            console.error('Error loading configuration:', error);
            ui.error('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateConfiguracion(formData);
            ui.success('Configuración actualizada correctamente');
            loadConfig();
        } catch (error) {
            console.error('Error updating configuration:', error);
            ui.error('Error al actualizar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si es el campo del mapa y contiene un iframe, extraer solo la URL del src
        if (name === 'google_maps_embed_url' && value.includes('<iframe')) {
            const srcMatch = value.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                setFormData(prev => ({ ...prev, [name]: srcMatch[1] }));
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">Configuración del Sitio</h2>
                <p className="text-slate-400 text-sm">Administra la información de contacto y ubicación de la clínica</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información de Contacto */}
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Phone size={20} className="text-primary" />
                        Información de Contacto
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Teléfono Móvil
                            </label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="+56 9 1234 5678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Teléfono Fijo (Opcional)
                            </label>
                            <input
                                type="text"
                                name="telefono_fijo"
                                value={formData.telefono_fijo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="+56 41 234 5678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="contacto@atilaclinic.cl"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <MapPin size={16} className="inline mr-2" />
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Av. Principal 123, Vitacura, Santiago"
                            />
                        </div>
                    </div>
                </div>

                {/* Redes Sociales */}
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Share2 size={20} className="text-primary" />
                        Redes Sociales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Facebook size={16} className="inline mr-2" />
                                Facebook
                            </label>
                            <input
                                type="url"
                                name="url_facebook"
                                value={formData.url_facebook}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="https://facebook.com/atilaclinic"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Instagram size={16} className="inline mr-2" />
                                Instagram
                            </label>
                            <input
                                type="url"
                                name="url_instagram"
                                value={formData.url_instagram}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="https://instagram.com/atilaclinic"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <MessageCircle size={16} className="inline mr-2" />
                                WhatsApp
                            </label>
                            <input
                                type="url"
                                name="url_whatsapp"
                                value={formData.url_whatsapp}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="https://wa.me/56912345678"
                            />
                        </div>
                    </div>
                </div>

                {/* Mapa de Google */}
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <MapPin size={20} className="text-primary" />
                        Google Maps
                    </h3>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-2">¿Cómo obtener la URL del mapa?</p>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>Ve a <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google Maps</a></li>
                                    <li>Busca la dirección de la clínica</li>
                                    <li>Haz clic en "Compartir" → "Insertar un mapa"</li>
                                    <li>Copia <strong>TODO el código del iframe</strong> y pégalo abajo (se extraerá automáticamente la URL)</li>
                                </ol>
                                <p className="mt-2 text-xs italic">💡 Tip: Puedes pegar el código completo del iframe, el sistema extraerá solo la URL necesaria</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                URL del Mapa (iframe src)
                            </label>
                            <textarea
                                name="google_maps_embed_url"
                                value={formData.google_maps_embed_url}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-xs"
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Link para "Cómo llegar"
                            </label>
                            <input
                                type="url"
                                name="google_maps_link"
                                value={formData.google_maps_link}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="https://www.google.com/maps/search/?api=1&query=..."
                            />
                            {formData.google_maps_link && (
                                <a
                                    href={formData.google_maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                                >
                                    <ExternalLink size={14} />
                                    Probar enlace
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Horarios */}
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Horarios de Atención
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lunes a Viernes</label>
                            <input
                                type="text"
                                name="horario_semana"
                                value={formData.horario_semana}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="8:00 - 20:00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sábados</label>
                            <input
                                type="text"
                                name="horario_sabado"
                                value={formData.horario_sabado}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="9:00 - 14:00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Domingos</label>
                            <input
                                type="text"
                                name="horario_domingo"
                                value={formData.horario_domingo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Cerrado"
                            />
                        </div>
                    </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Navigation size={20} className="text-primary" />
                        Información Adicional
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Estacionamiento</label>
                            <input
                                type="text"
                                name="info_estacionamiento"
                                value={formData.info_estacionamiento}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Estacionamiento gratuito"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Transporte Público</label>
                            <textarea
                                name="info_transporte"
                                value={formData.info_transporte}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Metro: Línea 1, Estación Vitacura&#10;Bus: Líneas 412, 413, 425"
                            />
                            <p className="text-xs text-slate-500 mt-1">Puedes usar saltos de línea para separar la información</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        {config?.actualizado_en && (
                            <>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                <span className="text-sm">Última actualización: {new Date(config.actualizado_en).toLocaleString('es-CL')}</span>
                            </>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
