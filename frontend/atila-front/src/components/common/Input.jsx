import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    required = false,
    error = '',
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 ml-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`w-full px-5 py-4 rounded-2xl border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} focus:ring-4 outline-none transition-all font-inter`}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</p>
            )}
        </div>
    );
};

export default Input;
