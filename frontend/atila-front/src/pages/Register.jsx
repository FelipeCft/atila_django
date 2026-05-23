import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { publicRegister } from '../api/authService';
import Card from '../components/common/Card';
import RegisterForm from '../features/auth/components/RegisterForm';
import RegisterSuccess from '../features/auth/components/RegisterSuccess';

const Register = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const handleRegister = async (userData) => {
        setLoading(true);
        setError('');

        try {
            await publicRegister(userData);
            setRegisteredEmail(userData.email);
            setSuccess(true);
        } catch (err) {
            if (err.username) {
                setError(err.username[0]);
            } else if (err.email) {
                setError(err.email[0]);
            } else if (err.rut) {
                setError(err.rut[0]);
            } else if (err.phone_number) {
                setError(err.phone_number[0]);
            } else if (err.error) {
                setError(err.error);
            } else {
                setError('Error al registrar usuario. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return <RegisterSuccess email={registeredEmail} />;
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                <Card>
                    <div className="text-center mb-10">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-bounce-subtle">
                            <UserPlus size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Crear Cuenta</h1>
                        <p className="text-slate-400 mt-3 text-sm font-inter">
                            Regístrate para acceder a nuestros servicios
                        </p>
                    </div>

                    <RegisterForm
                        onSubmit={handleRegister}
                        loading={loading}
                        error={error}
                    />

                    <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 text-center font-inter leading-relaxed">
                            <span className="font-bold text-slate-700 block mb-1 uppercase tracking-tighter">
                                Nota
                            </span>
                            Al registrarte, tu cuenta será creada con rol de Cliente.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;
