import React from 'react';
import background from '../../assets/triangular-background.svg';

const TrianglePattern = ({ className = "absolute inset-0" }) => {
    return (
        <div
            className={`${className} z-0 pointer-events-none overflow-hidden`}
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.35, // Slightly lower but more intense with overlay
                mixBlendMode: 'overlay' // This highlights the underlying colors
            }}
        />
    );
};

export default TrianglePattern;
