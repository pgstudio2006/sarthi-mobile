import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export default function GlobeIcon({ size = 22, color = '#2BA8A6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.8" />
      <Path d="M3.5 9H20.5M3.5 15H20.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
