/**
 * Sistema unificado de notificaciones y modales.
 *
 * Uso:
 *   import { ui } from '../utilities/ui';
 *
 *   ui.success('Guardado correctamente');
 *   ui.error('Algo salió mal');
 *   ui.warning('Atención');
 *   ui.info('Dato informativo');
 *
 *   const ok = await ui.confirm({
 *     title: '¿Eliminar usuario?',
 *     message: 'Esta acción no se puede deshacer.',
 *     confirmText: 'Eliminar',
 *     variant: 'danger',
 *   });
 *   if (ok) { ... }
 */

import { sileo } from 'sileo';

// ─── Toasts ────────────────────────────────────────────────
const success = (msg) => sileo.success({
    title: 'Completado',
    description: msg,
    fill: '#059669',
    autopilot: { expand: 100, collapse: 3000 },
});

const error = (msg) => sileo.error({
    title: 'Error',
    description: msg,
    fill: '#DC2626',
    autopilot: { expand: 100, collapse: 4000 },
});

const warning = (msg) => sileo.warning({
    title: 'Advertencia',
    description: msg,
    fill: '#D97706',
    autopilot: { expand: 100, collapse: 3500 },
});

const info = (msg) => sileo.info({
    title: 'Información',
    description: msg,
    fill: '#0ea5e9',
    autopilot: { expand: 100, collapse: 3000 },
});

// ─── Confirm modal (pub/sub) ──────────────────────────────
let _confirmListener = null;

/**
 * Registra el listener del UIProvider.  Solo debe llamarse una vez.
 * @param {(opts: object) => void} listener
 * @returns {() => void} unsubscribe
 */
export function _registerConfirmListener(listener) {
    _confirmListener = listener;
    return () => { _confirmListener = null; };
}

/**
 * Abre un modal de confirmación y retorna una promesa.
 * @param {{ title?: string, message?: string, confirmText?: string, cancelText?: string, variant?: 'danger'|'warning'|'success' }} opts
 * @returns {Promise<boolean>}
 */
const confirm = (opts = {}) => {
    return new Promise((resolve) => {
        if (!_confirmListener) {
            // Fallback: si no hay UIProvider montado, usa window.confirm
            resolve(window.confirm(opts.message || opts.title || '¿Confirmar?'));
            return;
        }
        _confirmListener({ ...opts, resolve });
    });
};

// ─── Exportación pública ──────────────────────────────────

/**
 * Extrae un mensaje legible de un error de API (Axios + DRF).
 * Soporta formatos DRF: { field: ["msg"] }, { detail: "msg" }, ["msg"], "msg"
 * @param {Error} error - Error de Axios
 * @param {string} fallback - Mensaje genérico si no se puede extraer
 * @returns {string}
 */
const getApiErrorMessage = (error, fallback = 'Error inesperado') => {
    const data = error?.response?.data;
    if (!data) return fallback;

    // String directo
    if (typeof data === 'string') return data;

    // { detail: "msg" }
    if (data.detail) return data.detail;

    // { non_field_errors: ["msg"] }
    if (data.non_field_errors?.[0]) return data.non_field_errors[0];

    // Array: ["msg"]
    if (Array.isArray(data) && data[0]) return data[0];

    // Field errors: { nombre: ["ya existe"], precio: ["requerido"] }
    const fieldErrors = Object.entries(data)
        .filter(([, v]) => Array.isArray(v) && v.length > 0)
        .map(([field, msgs]) => `${field}: ${msgs[0]}`)
        .join('. ');
    if (fieldErrors) return fieldErrors;

    return fallback;
};

export const ui = {
    success,
    error,
    warning,
    info,
    confirm,
    getApiErrorMessage,
};
