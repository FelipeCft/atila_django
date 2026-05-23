import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InsumoForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        cantidad: 0,
        stock_minimo: 5,
        disponible: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                cantidad: initialData.cantidad || 0,
                stock_minimo: initialData.stock_minimo || 5,
                disponible: initialData.disponible !== undefined ? initialData.disponible : true
            });
        } else if (isOpen) {
            setFormData({
                nombre: '',
                descripcion: '',
                cantidad: 0,
                stock_minimo: 5,
                disponible: true
            });
        }
        setErrors({});
    }, [isOpen, initialData]);

    const validate = () => {
        const newErrors = {};
        const trimmedName = formData.nombre.trim();

        if (!trimmedName) {
            newErrors.nombre = 'El nombre es requerido.';
        } else if (trimmedName.length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await onSubmit({ ...formData, nombre: formData.nombre.trim() });
        } catch (error) {
            // Handle backend validation errors (e.g., unique name)
            const data = error?.response?.data;
            if (data) {
                const backendErrors = {};
                if (data.nombre) backendErrors.nombre = Array.isArray(data.nombre) ? data.nombre[0] : data.nombre;
                if (Object.keys(backendErrors).length > 0) {
                    setErrors(backendErrors);
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                        <input type="text" required className={`w-full px-4 py-3 rounded-xl border outline-none focus:border-primary ${errors.nombre ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                            value={formData.nombre} onChange={e => { setFormData({ ...formData, nombre: e.target.value }); if (errors.nombre) setErrors({ ...errors, nombre: null }); }} />
                        {errors.nombre && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.nombre}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Stock Inicial</label>
                            <input type="number" required min="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                                value={formData.cantidad} onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Min. Alerta</label>
                            <input type="number" required min="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                                value={formData.stock_minimo} onChange={e => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                        <input type="checkbox" id="disponible" checked={formData.disponible} onChange={e => setFormData({ ...formData, disponible: e.target.checked })} className="w-5 h-5 text-primary" />
                        <label htmlFor="disponible" className="font-medium text-slate-600">Disponible</label>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                        <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary h-24 resize-none"
                            value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border font-semibold hover:bg-slate-50 text-slate-600 disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsumoForm;
