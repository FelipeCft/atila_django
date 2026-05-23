import React from 'react';
import { Edit2, Trash2, Package, TrendingUp, AlertTriangle, AlertCircle, Archive, XCircle, Power, PowerOff } from 'lucide-react';

const InsumoList = ({
    loading,
    filteredInsumos,
    selectedItems,
    toggleSelection,
    toggleAll,
    openInsumoModal,
    handleDelete,
    handleToggleActive
}) => {
    const getAlertBadge = (status) => {
        switch (status) {
            case 'ALTO': return { color: 'bg-emerald-100 text-emerald-700', icon: <TrendingUp size={14} />, label: 'Alto' };
            case 'BAJO': return { color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} />, label: 'Bajo' };
            case 'AGOTADO': return { color: 'bg-rose-100 text-rose-700', icon: <AlertCircle size={14} />, label: 'Agotado' };
            default: return { color: 'bg-slate-100 text-slate-700', icon: <Archive size={14} />, label: status };
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="p-4 w-12 text-center">
                                <input type="checkbox"
                                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                                    checked={filteredInsumos.length > 0 && selectedItems.size === filteredInsumos.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Insumo</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Stock Actual</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Alertas</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400">Cargando...</td></tr> :
                            filteredInsumos.length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-slate-400">Sin resultados</td></tr> :
                                filteredInsumos.map((insumo) => {
                                    const alertBadge = getAlertBadge(insumo.alerta_stock);
                                    return (
                                        <tr key={insumo.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedItems.has(insumo.id) ? 'bg-primary/5' : ''}`}>
                                            <td className="p-4 text-center">
                                                <input type="checkbox"
                                                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                                                    checked={selectedItems.has(insumo.id)}
                                                    onChange={() => toggleSelection(insumo.id)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{insumo.nombre}</div>
                                                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{insumo.descripcion}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-2xl text-slate-700">
                                                {insumo.cantidad} <span className="text-xs font-normal text-slate-400">unid.</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase ${alertBadge.color}`}>
                                                        {alertBadge.icon} {alertBadge.label}
                                                    </span>
                                                    {!insumo.disponible && (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-200 text-slate-600 rounded-md text-xs font-bold uppercase">
                                                            <XCircle size={14} /> No Disp.
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {handleToggleActive && (
                                                        <button
                                                            onClick={() => handleToggleActive(insumo.id)}
                                                            className={`p-2 rounded-lg transition-colors ${insumo.disponible ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                            title={insumo.disponible ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {insumo.disponible ? <PowerOff size={18} /> : <Power size={18} />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => openInsumoModal(insumo)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(insumo.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InsumoList;
