import React, { useState } from 'react';
import { UserPlus, Shield, User, Briefcase, AlertTriangle } from 'lucide-react';

import { adminRegister } from '../../api/authService';
import { formatRut, cleanRut, validateRut, formatPhone, cleanPhone, validatePhone } from '../../utilities/formatters';

const CreateUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        position: '',
        rut: '',
        phone_number: '',
        role: 'CLIENT', // Default role
        agenda_color: '#3b82f6'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const isClient = formData.role === 'CLIENT';

    // Campos opcionales solo para CLIENT
    const missingOptionalFields = [];
    if (isClient) {
        if (!formData.email.trim()) missingOptionalFields.push('Email');
        if (!formData.first_name.trim()) missingOptionalFields.push('Nombre');
        if (!formData.last_name.trim()) missingOptionalFields.push('Apellido');
        if (!formData.position.trim()) missingOptionalFields.push('Cargo / Puesto');
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;
        if (name === 'rut') {
            newValue = formatRut(value);
        } else if (name === 'phone_number') {
            newValue = formatPhone(value);
        }

        setFormData({
            ...formData,
            [name]: newValue
        });
        setError('');
        setSuccess('');
        setShowWarning(false);
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        // Validar formato de email solo si se proporcionó
        if (formData.email.trim()) {
            const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,6}$/;
            if (!emailRegex.test(formData.email.toLowerCase())) {
                setError('El formato del email no es válido');
                return false;
            }
        }

        if (formData.rut && !validateRut(formData.rut)) {
            setError('El Rut ingresado no es válido');
            return false;
        }

        if (formData.phone_number && !validatePhone(formData.phone_number)) {
            setError('El número de teléfono no es válido');
            return false;
        }

        if (formData.password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        // Si es CLIENT y hay campos vacíos, mostrar advertencia antes de enviar
        if (isClient && missingOptionalFields.length > 0 && !showWarning) {
            setShowWarning(true);
            return;
        }

        await submitForm();
    };

    const submitForm = async () => {
        setLoading(true);
        setShowWarning(false);

        try {
            // Preparar datos (excluir confirmPassword y limpiar rut)
            const { confirmPassword, rut, phone_number, ...otherData } = formData;
            const userData = {
                ...otherData,
                rut: cleanRut(rut),
                phone_number: cleanPhone(phone_number)
            };

            await adminRegister(userData);

            setSuccess(`Usuario ${formData.username} creado exitosamente con rol ${formData.role}`);

            // Limpiar formulario
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                first_name: '',
                last_name: '',
                position: '',
                rut: '',
                phone_number: '',
                role: 'CLIENT',
                agenda_color: '#3b82f6'
            });
        } catch (err) {
            if (err.username) setError(`Username: ${err.username[0]}`);
            else if (err.email) setError(`Email: ${err.email[0]}`);
            else if (err.first_name) setError(`Nombre: ${err.first_name[0]}`);
            else if (err.last_name) setError(`Apellido: ${err.last_name[0]}`);
            else if (err.position) setError(`Cargo: ${err.position[0]}`);
            else if (err.rut) setError(`Rut: ${err.rut[0]}`);
            else if (err.phone_number) setError(`Teléfono: ${err.phone_number[0]}`);
            else if (err.error) setError(err.error);
            else setError('Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <UserPlus size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Crear Nuevo Usuario</h2>
                    <p className="text-slate-500 text-sm">Añade personal, administradores o clientes al sistema</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm font-medium">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="juan.perez"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Email {isClient && <span className="text-slate-400 font-normal">(opcional)</span>}
                        </label>
                        <input
                            type={isClient ? "text" : "email"}
                            name="email"
                            required={!isClient}
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="juan@atila.cl"
                        />
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Nombre {isClient && <span className="text-slate-400 font-normal">(opcional)</span>}
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            required={!isClient}
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="Juan"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Apellido {isClient && <span className="text-slate-400 font-normal">(opcional)</span>}
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            required={!isClient}
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="Pérez"
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Cargo / Puesto {isClient && <span className="text-slate-400 font-normal">(opcional)</span>}
                        </label>
                        <input
                            type="text"
                            name="position"
                            required={!isClient}
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="Enfermero Jefe"
                        />
                    </div>

                    {/* Rut */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Rut</label>
                        <input
                            type="text"
                            name="rut"
                            maxLength="12"
                            value={formData.rut}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="12.345.678-9"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Teléfono</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="+56 9 1234 5678"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Rol del Usuario</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.role === 'CLIENT' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="CLIENT"
                                    checked={formData.role === 'CLIENT'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'CLIENT' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <span className={`block font-bold ${formData.role === 'CLIENT' ? 'text-emerald-700' : 'text-slate-700'}`}>Cliente</span>
                                    <span className="text-xs text-slate-500">Acceso básico</span>
                                </div>
                            </label>

                            <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.role === 'STAFF' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="STAFF"
                                    checked={formData.role === 'STAFF'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'STAFF' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <span className={`block font-bold ${formData.role === 'STAFF' ? 'text-primary' : 'text-slate-700'}`}>Personal</span>
                                    <span className="text-xs text-slate-500">Gestión de citas</span>
                                </div>
                            </label>

                            <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.role === 'ADMIN' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="ADMIN"
                                    checked={formData.role === 'ADMIN'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'ADMIN' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <span className={`block font-bold ${formData.role === 'ADMIN' ? 'text-purple-700' : 'text-slate-700'}`}>Administrador</span>
                                    <span className="text-xs text-slate-500">Control total</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Color Picker (Only for STAFF or ADMIN) */}
                    {(formData.role === 'STAFF' || formData.role === 'ADMIN') && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Color en Agenda</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    name="agenda_color"
                                    value={formData.agenda_color}
                                    onChange={handleChange}
                                    className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                    {formData.agenda_color}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning banner for CLIENT with missing optional fields */}
                {showWarning && (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-2 rounded-xl text-amber-600 mt-0.5">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-amber-800 mb-1">Campos incompletos</p>
                                <p className="text-amber-700 text-sm mb-3">
                                    Los siguientes campos están vacíos: <strong>{missingOptionalFields.join(', ')}</strong>.
                                    El usuario se creará sin estos datos. ¿Deseas continuar?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary px-5 py-2 text-sm shadow-lg shadow-primary/20"
                                    >
                                        {loading ? 'Creando...' : 'Sí, crear de todas formas'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowWarning(false)}
                                        className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary px-8 py-3 shadow-lg shadow-primary/20"
                    >
                        <UserPlus size={20} />
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
