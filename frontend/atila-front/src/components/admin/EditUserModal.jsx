import React, { useState, useEffect } from 'react';
import { X, Save, User, Briefcase, Shield, Mail } from 'lucide-react';

import { updateUser } from '../../api/userService';
import { formatRut, cleanRut, validateRut, formatPhone, cleanPhone, validatePhone } from '../../utilities/formatters';

const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        position: '',
        role: '',
        agenda_color: ''
    });
    const [password, setPassword] = useState(''); // Only if changing
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                position: user.position || '',
                rut: formatRut(user.rut) || '',
                phone_number: formatPhone(user.phone_number) || '',
                role: user.role,
                agenda_color: user.agenda_color || '#3b82f6'
            });
            setPassword('');
            setError('');
        }
    }, [user]);

    if (!isOpen) return null;

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToUpdate = { ...formData };
            if (dataToUpdate.rut) {
                dataToUpdate.rut = cleanRut(dataToUpdate.rut);
            }
            if (dataToUpdate.phone_number) {
                dataToUpdate.phone_number = cleanPhone(dataToUpdate.phone_number);
            }

            if (password.trim()) {
                dataToUpdate.password = password;
            }

            await updateUser(user.id, dataToUpdate);
            onSave(); // Notify parent to reload
            onClose();
        } catch (err) {
            if (err.username) setError(`Username: ${err.username[0]}`);
            else if (err.email) setError(`Email: ${err.email[0]}`);
            else if (err.rut) setError(`Rut: ${err.rut[0]}`);
            else if (err.phone_number) setError(`Teléfono: ${err.phone_number[0]}`);
            else if (err.error) setError(err.error);
            else setError('Error al actualizar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                                <EditIcon size={24} />
                            </div>
                            Editar Usuario
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required={formData.role !== 'CLIENT'}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Nombre</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    required={formData.role !== 'CLIENT'}
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Apellido</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    required={formData.role !== 'CLIENT'}
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Cargo</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="position"
                                        required={formData.role !== 'CLIENT'}
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Rut */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Rut</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="rut"
                                        maxLength="12"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="12.345.678-9"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Teléfono</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>
                            </div>

                            {/* Password (Optional) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="Dejar en blanco para mantener"
                                />
                            </div>

                            {/* Role */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Rol</label>
                                <div className="flex gap-4">
                                    {['CLIENT', 'STAFF', 'ADMIN'].map((roleOption) => (
                                        <label key={roleOption} className={`cursor-pointer px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${formData.role === roleOption ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={roleOption}
                                                checked={formData.role === roleOption}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <Shield size={16} className={formData.role === roleOption ? 'text-white' : 'text-slate-400'} />
                                            <span className="text-sm font-semibold">{roleOption === 'CLIENT' ? 'Cliente' : roleOption === 'STAFF' ? 'Personal' : 'Administrador'}</span>
                                        </label>
                                    ))}
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

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary px-8 py-3 shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                <Save size={20} />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Internal icon component to avoid Import issues if Lucide doesn't export EditIcon but Edit
const EditIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

export default EditUserModal;
