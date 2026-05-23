import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { login as loginService } from '../api/authService';
import Card from '../components/common/Card';
import LoginForm from '../features/auth/components/LoginForm';

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        setError('');
        setLoading(true);

        try {
            // Llamar al servicio de login
            const response = await loginService(credentials);

            // Guardar datos del usuario en el contexto
            login(response.user, response.token);

            // Redirigir según el rol
            if (response.user.role === 'ADMIN') {
                navigate('/admin');
            } else if (response.user.role === 'STAFF') {
                navigate('/staff');
            } else {
                navigate('/'); // Clientes van al home
            }
        } catch (err) {
            // Manejar errores
            if (err.non_field_errors) {
                setError(err.non_field_errors[0]);
            } else if (err.error) {
                setError(err.error);
            } else {
                setError('Error al iniciar sesión. Verifica tus credenciales.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <Card>
                    <div className="text-center mb-10">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-bounce-subtle">
                            <Activity size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h1>
                        <p className="text-slate-400 mt-3 text-sm font-inter">Accede a tu cuenta</p>
                    </div>

                    <LoginForm
                        onSubmit={handleLogin}
                        loading={loading}
                        error={error}
                    />

                    <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 text-center font-inter leading-relaxed">
                            <span className="font-bold text-slate-700 block mb-1 uppercase tracking-tighter">
                                Acceso con Usuario o Email
                            </span>
                            Puedes iniciar sesión usando tu nombre de usuario o tu correo electrónico.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
