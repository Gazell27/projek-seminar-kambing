import React from 'react';

const GoatIcon = ({ size = 24, className = '', strokeWidth = 2 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 4c2-2 2-4 2-4s.5 1.5 1 2.5c1 2 3.5 1 5 .5 0 2.5-1.5 4-2.5 5 2.5 2.5 0 7.5-3.5 9-.5 1-1.5 2-3 2s-2.5-1-3-2c-3.5-1.5-6-6.5-3.5-9-1-1-2.5-2.5-2.5-5 1.5.5 4 1.5 5-.5.5-1 1-2.5 1-2.5S10 2 12 4z" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
            <path d="M12 15a2 2 0 0 0 0 2" />
        </svg>
    );
};

export default GoatIcon;
