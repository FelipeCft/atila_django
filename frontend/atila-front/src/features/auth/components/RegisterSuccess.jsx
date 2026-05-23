import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Card from '../../../components/common/Card';

const RegisterSuccess = ({ email }) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg text-center">
                <Card>
                    <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-bounce-subtle">
                        <Activity size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Registro Exitoso!</h2>
                    <p className="text-slate-600 mb-8 text-lg">
                        Hemos enviado un enlace de verificación a:
                        <br />
                        <span className="font-semibold text-primary">{email}</span>
                    </p>
                    <p className="text-slate-500 text-sm mb-8">
                        Por favor revisa tu bandeja de entrada (y spam) para activar tu cuenta.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block btn btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/20 text-white"
                    >
                        Ir al Iniciar Sesión
                    </Link>
                </Card>
            </div>
        </div>
    );
};

export default RegisterSuccess;
