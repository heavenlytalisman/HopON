import React from 'react';
import Svg, { Rect, Line, Circle } from 'react-native-svg';

export default function FeedIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Outer Card */}
      <Rect 
        x="4" 
        y="4" 
        width="24" 
        height="24" 
        rx="6" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      
      {/* Horizontal Divider */}
      <Line 
        x1="4" 
        y1="14" 
        x2="28" 
        y2="14" 
        stroke={color} 
        strokeWidth="3" 
      />
      
      {/* Avatar Circle */}
      <Circle 
        cx="10" 
        cy="9" 
        r="2.5" 
        fill={color} 
      />
      
      {/* Text Lines */}
      <Line 
        x1="15.5" 
        y1="7" 
        x2="24" 
        y2="7" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      <Line 
        x1="15.5" 
        y1="11" 
        x2="24" 
        y2="11" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </Svg>
  );
}
