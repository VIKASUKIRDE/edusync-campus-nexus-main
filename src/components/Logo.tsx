
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const logoSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Professional alphabetic logo design */}
      <div className={`${logoSizes[size]} relative`}>
        {/* Main logo container with gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-lg"></div>
        
        {/* Logo letters - stylized 'ES' for Learn_Me */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-white font-bold relative">
            <span className="font-poppins text-lg font-black tracking-tight">LM</span>
          </div>
        </div>
        
        {/* Accent corner indicator */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
      </div>
      
      {showText && (
        <span className={`font-poppins font-bold ${textSizes[size]} bg-gradient-to-r from-primary-700 to-primary-800 bg-clip-text text-transparent`}>
          Learn_Me
        </span>
      )}
    </div>
  );
};

export default Logo;
