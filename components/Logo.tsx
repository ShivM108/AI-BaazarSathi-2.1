import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle Frame */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" />
      
      {/* Head Shape (Solid Fill) */}
      <path 
        d="M38 28 
           Q 50 25 56 35 
           Q 58 40 56 45 
           L 56 50
           Q 58 55 54 62 
           Q 50 68 40 66 
           L 38 64
           L 38 28 Z" 
        fill="currentColor" 
      />
      
      {/* Ear Detail (Negative Space - Simulating cutout with white) */}
      <path d="M48 40 A 6 6 0 1 1 48 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Circuit Lines (Strokes) */}
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {/* Top Node */}
        <path d="M38 34 L 28 26" />
        <circle cx="28" cy="26" r="3" fill="currentColor" stroke="none" />
        
        {/* Mid Node */}
        <path d="M38 46 L 24 46" />
        <circle cx="24" cy="46" r="3" fill="currentColor" stroke="none" />
        
        {/* Bot Node */}
        <path d="M38 58 L 28 68" />
        <circle cx="28" cy="68" r="3" fill="currentColor" stroke="none" />
      </g>

      {/* Feather/Quill (Stroke) */}
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         {/* Leaf/Feather shape */}
         <path d="M60 62 Q 58 50 65 38 Q 75 25 85 25 Q 82 40 80 50 Q 78 65 60 62 Z" />
         {/* Rachis (Stem) */}
         <path d="M60 62 Q 72 45 85 25" strokeWidth="2" />
      </g>
      
      {/* Connection ZigZag */}
      <path d="M42 66 L 46 72 L 54 68 L 60 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Logo;