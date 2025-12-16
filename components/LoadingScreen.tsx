import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="relative flex flex-col items-center">
        {/* Animated Knight */}
        <div className="mb-8 relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-200/50 rounded-full animate-ping opacity-20 duration-1000"></div>
          
          <svg 
            viewBox="0 0 45 45" 
            className="w-20 h-20 drop-shadow-lg animate-[bounce_1s_infinite_ease-in-out]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="#111827" fillRule="evenodd" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Knight Base - Changed fill from none to match color */}
                <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" strokeLinejoin="miter" fill="#111827" />
                {/* Knight Head */}
                <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" fill="#111827" />
                {/* Details (Eyes/Nostrils) */}
                <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#f9fafb" stroke="none" />
                <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#f9fafb" stroke="none" />
            </g>
          </svg>
        </div>

        <h2 className="text-xl font-light tracking-[0.2em] uppercase text-gray-900 mb-2">Fetching Games</h2>
        <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};