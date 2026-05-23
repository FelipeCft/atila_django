import React from 'react';

const WaveBackground = () => {
    return (
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 z-0 pointer-events-none">
            <svg
                className="relative block w-full h-[35vh] md:h-[48vh] transition-[height] duration-300 ease-in-out"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,0 V100 C 400,130 800,70 1200,90 V0 Z"
                    fill="url(#wave-gradient)"
                ></path>
            </svg>
        </div>
    );
};

export default WaveBackground;
