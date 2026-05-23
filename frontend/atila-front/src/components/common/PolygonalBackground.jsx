import React from 'react';
import TrianglePattern from './TrianglePattern';

const PolygonalBackground = ({ children, className = "" }) => {
    return (
        <div className={`relative font-inter min-h-screen w-full ${className}`} style={{ background: 'linear-gradient(135deg, #00214E 0%, #0284c7 100%)' }}>
            {/* Unified Background Pattern */}
            <TrianglePattern className="fixed inset-0" />
            
            {/* Content Wrapper */}
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
};

export default PolygonalBackground;
