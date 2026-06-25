import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Navbar = ({ isVisible = true, setIsVisible }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Usar el contexto de autenticación

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Servicios', path: '/servicios' },
        { name: 'Disponibilidad', path: '/agenda-publica' },
        { name: 'Convenios', path: '/convenios' },
        { name: 'Contacto', path: '/contacto' },
    ];


    // Enlaces adicionales si el usuario es staff/admin
    if (user?.role === 'ADMIN') {
        navLinks.push({ name: 'Panel Administrador', path: '/admin' });
    } else if (user?.role === 'STAFF') {
        navLinks.push({ name: 'Panel Personal', path: '/staff' });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 rounded-full bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0 pointer-events-none'}`}>
            <div className="px-6 md:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/ClinicIcon.svg" alt="Logo" className="h-10 md:h-12 w-auto" />
                        <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-[#3BBCDB] to-[#277BC0] bg-clip-text text-transparent">Atila Centro Médico</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-text-light hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold text-slate-700">{user.full_name}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                        {user.role === 'ADMIN' ? 'Administrador' : user.role === 'STAFF' ? 'Personal' : 'Cliente'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut size={18} />
                                    <span className="sr-only">Salir</span>
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                                    title="Ocultar Menú"
                                >
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn btn-outline"
                                >
                                    Registrarse
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary"
                                >
                                    <User size={18} />
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                                    title="Ocultar Menú"
                                >
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu & Hide Buttons */}
                    <div className="md:hidden flex items-center gap-1">
                        <button onClick={() => setIsVisible(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                            <ChevronUp size={24} />
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-700">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-2">
                    {user && (
                        <div className="px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                            <p className="font-bold text-slate-800">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    )}

                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block px-4 py-2 text-base font-medium text-text-light rounded-md hover:bg-background"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full btn bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                            >
                                <LogOut size={18} />
                                Cerrar Sesión
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => { navigate('/register'); setIsOpen(false); }}
                                    className="w-full btn btn-outline"
                                >
                                    Registrarse
                                </button>
                                <button
                                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                                    className="w-full btn btn-primary"
                                >
                                    Iniciar Sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
