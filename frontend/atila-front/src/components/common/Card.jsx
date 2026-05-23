import React from 'react';

const Card = ({ children, className = '', padding = 'p-6 md:p-10 lg:p-12' }) => {
    return (
        <div className={`bg-white ${padding} rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl md:shadow-2xl shadow-slate-200/60 transition-all ${className}`}>
            {children}
        </div>
    );
};

export default Card;
