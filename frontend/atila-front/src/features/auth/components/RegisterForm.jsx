import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Input from '../../../components/common/Input';

import Button from '../../../components/common/Button';
import { formatRut, cleanRut, validateRut, formatPhone, cleanPhone, validatePhone } from '../../../utilities/formatters';

const RegisterForm = ({ onSubmit, loading, error }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        rut: '',
        phone_number: ''
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = name === 'email' ? value.toLowerCase() : value;
        if (name === 'rut') {
            newValue = formatRut(value);
        } else if (name === 'phone_number') {
            newValue = formatPhone(value);
        }

        setFormData({
            ...formData,
            [name]: newValue
        });
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (formData.password !== formData.confirmPassword) {
            setFormError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 4) {
            setFormError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Por favor, ingresa un correo electrónico válido');
            return;
        }

        if (formData.rut && !validateRut(formData.rut)) {
            setFormError('El Rut ingresado no es válido.');
            return;
        }

        if (formData.phone_number && !validatePhone(formData.phone_number)) {
            setFormError('El número de teléfono no es válido.');
            return;
        }

        const { confirmPassword, rut, phone_number, ...otherData } = formData;
        const userData = {
            ...otherData,
            rut: cleanRut(rut),
            phone_number: cleanPhone(phone_number)
        };
        onSubmit(userData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {(error || formError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-600 text-sm font-medium">{error || formError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                />

                <Input
                    label="Nombre"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                />

                <Input
                    label="Apellido"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Pérez"
                />

                <Input
                    label="Rut"
                    type="text"
                    name="rut"
                    maxLength="12"
                    value={formData.rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                />

                <Input
                    label="Teléfono"
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                />
                <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />

                <Input
                    label="Confirmar Contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />
            </div>

            <div className="pt-2">
                <Button type="submit" loading={loading}>
                    <UserPlus size={20} />
                    Crear Cuenta
                </Button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-600 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default RegisterForm;
