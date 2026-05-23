import React from 'react';
import { ArrowUpRight, ArrowDownLeft, User, History } from 'lucide-react';

const HistoryList = ({ history }) => {
    return (
        <div className="pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <History className="text-slate-400" />
                Historial de Movimientos
            </h2>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-left">Fecha</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-left">Tipo</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-left">Usuario</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-left">Detalle</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-left">Observación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No hay movimientos registrados</td></tr>
                            ) : (
                                history.map((record, idx) => (
                                    <tr key={`${record.tipo}-${record.id}-${idx}`} className="hover:bg-slate-50/50">
                                        <td className="p-4 text-sm text-slate-600 font-mono">
                                            {new Date(record.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            {record.tipo === 'CONSUMO' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-600 text-xs font-bold uppercase border border-rose-100">
                                                    <ArrowDownLeft size={14} /> Consumo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-bold uppercase border border-emerald-100">
                                                    <ArrowUpRight size={14} /> Reposición
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            {record.usuario_nombre || 'Desconocido'}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {record.detalles.map((d, i) => (
                                                    <div key={i} className="text-sm">
                                                        <span className={`font-bold ${record.tipo === 'CONSUMO' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {record.tipo === 'CONSUMO' ? '-' : '+'}{d.cantidad}
                                                        </span>
                                                        <span className="text-slate-600 ml-1">{d.insumo_nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 italic truncate max-w-[200px]">
                                            {record.observacion || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryList;
