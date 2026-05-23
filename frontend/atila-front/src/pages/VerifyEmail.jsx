import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/authService';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const { uid, token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                const response = await api.post('auth/verify-email/', {
                    uid,
                    token
                });


                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                setStatus('error');
                if (error.response && error.response.data && error.response.data.error) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage('Ocurrió un error al verificar tu cuenta.');
                }
            }
        };

        if (uid && token) {
            verifyAccount();
        } else {
            setStatus('error');
            setMessage('Enlace de verificación inválido.');
        }
    }, [uid, token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg text-center">
                <div className="bg-white p-10 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 transition-all">

                    {status === 'verifying' && (
                        <>
                            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 animate-pulse">
                                <Loader size={40} className="animate-spin" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Verificando...</h2>
                            <p className="text-slate-500">Por favor espera mientras validamos tu cuenta.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-bounce-subtle">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Correo Verificado!</h2>
                            <p className="text-slate-600 mb-8 text-lg">
                                {message}
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 btn btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                Iniciar Sesión <ArrowRight size={20} />
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-shake">
                                <XCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Error de Verificación</h2>
                            <p className="text-red-500 mb-8 font-medium bg-red-50 p-4 rounded-xl border border-red-100">
                                {message}
                            </p>
                            <Link
                                to="/"
                                className="text-slate-500 hover:text-slate-800 font-medium underline"
                            >
                                Volver al Inicio
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
