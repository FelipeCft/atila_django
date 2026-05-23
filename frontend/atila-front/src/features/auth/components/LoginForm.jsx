import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const LoginForm = ({ onSubmit, loading, error }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ identifier, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
            )}

            <Input
                label="Usuario o Email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="usuario o email@ejemplo.com"
            />

            <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
            />

            <div className="pt-2">
                <Button type="submit" loading={loading}>
                    <LogIn size={20} />
                    {loading ? 'Iniciando...' : 'Entrar al Sistema'}
                </Button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-600 text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
