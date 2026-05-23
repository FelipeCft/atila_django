import React, { useState, useEffect } from 'react';

const CurrentTimeLine = ({ startHour, endHour }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // 60 seconds

        return () => clearInterval(timer);
    }, []);

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Check if the current time is within the grid's display hours
    if (hours < startHour || hours >= endHour) {
        return null;
    }

    // Calculate position: 96px per hour
    const topPosition = (hours - startHour + minutes / 60) * 96;

    return (
        <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${topPosition}px`, transform: 'translateY(-50%)' }}
        >
            {/* The line itself */}
            <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
            {/* The dot on the left side (time column area) to make it look like a playhead */}
            <div className="absolute left-0 w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
        </div>
    );
};

export default CurrentTimeLine;
