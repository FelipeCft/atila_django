import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Modal de confirmación reutilizable.
 * Reemplaza window.confirm con un diseño consistente con la app.
 *
 * Props:
 * - isOpen: boolean
 * - title: string
 * - message: string
 * - confirmText: string (default: "Confirmar")
 * - cancelText: string (default: "Cancelar")
 * - variant: "danger" | "warning" | "success" (default: "danger")
 * - loading: boolean
 * - onConfirm: () => void
 * - onCancel: () => void
 */
const ConfirmModal = ({
    isOpen,
    title = '¿Estás seguro?',
    message = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
        },
        success: {
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`${styles.iconBg} p-2.5 rounded-xl ${styles.iconColor}`}>
                                <AlertTriangle size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <p className="text-slate-500 text-sm leading-relaxed ml-[52px] mb-6">
                            {message}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all text-sm ${styles.button} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Procesando...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
