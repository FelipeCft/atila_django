import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    loading = false,
    onClick
}) => {

    const baseStyles = "w-full py-4.5 text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "btn btn-primary shadow-xl shadow-primary/20 text-white",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        outline: "border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
        >
            {loading ? 'Cargando...' : children}
        </button>
    );
};

export default Button;
