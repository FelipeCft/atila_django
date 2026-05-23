import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Truck, AlertTriangle } from 'lucide-react';
import { ui } from '../../../utilities/ui';

const StockMovementForm = ({ isOpen, onClose, type, selectedInsumos, onSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({});
    const [observacion, setObservacion] = useState('');

    useEffect(() => {
        if (isOpen && selectedInsumos.length > 0) {
            const initialStruct = {};
            selectedInsumos.forEach(i => initialStruct[i.id] = 1);
            setFormData(initialStruct);
            setObservacion('');
        }
    }, [isOpen, selectedInsumos]);

    const getStockWarning = (insumo) => {
        if (type !== 'CONSUMO') return null;
        const requested = parseInt(formData[insumo.id] || 0);
        if (requested > insumo.cantidad) {
            return `Excede stock (disponible: ${insumo.cantidad})`;
        }
        if (requested > 0 && requested === insumo.cantidad) {
            return `Se agotará el stock`;
        }
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const itemsToSubmit = selectedInsumos.map(insumo => ({
            insumo: insumo.id,
            cantidad: parseInt(formData[insumo.id] || 0)
        })).filter(item => item.cantidad > 0);

        if (itemsToSubmit.length === 0) {
            ui.error('Cantidades inválidas');
            return;
        }

        // Client-side stock validation for consumo
        if (type === 'CONSUMO') {
            for (const item of itemsToSubmit) {
                const insumo = selectedInsumos.find(i => i.id === item.insumo);
                if (insumo && item.cantidad > insumo.cantidad) {
                    ui.error(`Stock insuficiente para ${insumo.nombre}`);
                    return;
                }
            }
        }

        onSubmit({
            observacion,
            detalles: itemsToSubmit
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className={`p-6 border-b flex items-center justify-between sticky top-0 z-10 ${type === 'CONSUMO' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'CONSUMO' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {type === 'CONSUMO' ? <TrendingDown size={24} /> : <Truck size={24} />}
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${type === 'CONSUMO' ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {type === 'CONSUMO' ? 'Registrar Consumo' : 'Reponer Stock'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {type === 'CONSUMO' ? 'Descontar items del inventario' : 'Agregar items al inventario'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Items Seleccionados</label>
                        {selectedInsumos.map(insumo => {
                            const warning = getStockWarning(insumo);
                            return (
                                <div key={insumo.id} className={`flex items-center gap-4 p-4 rounded-xl border ${warning ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-700">{insumo.nombre}</div>
                                        <div className="text-xs text-slate-500">Stock Actual: {insumo.cantidad}</div>
                                        {warning && (
                                            <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                                                <AlertTriangle size={12} /> {warning}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">Cantidad</label>
                                        <input
                                            type="number" min="1" required
                                            className={`w-full px-3 py-2 rounded-lg border outline-none font-bold text-center ${warning
                                                ? 'border-amber-300 focus:border-amber-500 text-amber-700'
                                                : type === 'CONSUMO'
                                                    ? 'border-rose-200 focus:border-rose-500 text-rose-700'
                                                    : 'border-emerald-200 focus:border-emerald-500 text-emerald-700'
                                                }`}
                                            value={formData[insumo.id] || ''}
                                            onChange={e => setFormData({ ...formData, [insumo.id]: e.target.value })}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Observación (Opcional)</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-400 h-20 resize-none"
                            placeholder={type === 'CONSUMO' ? "Motivo del uso..." : "Proveedor, N° Factura..."}
                            value={observacion}
                            onChange={e => setObservacion(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border font-semibold hover:bg-slate-50 text-slate-600 disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting}
                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${type === 'CONSUMO'
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                }`}
                        >
                            {isSubmitting ? 'Procesando...' : `Confirmar ${type === 'CONSUMO' ? 'Descuento' : 'Reposición'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockMovementForm;
