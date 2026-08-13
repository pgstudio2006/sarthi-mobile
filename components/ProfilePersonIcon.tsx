import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function ProfilePersonIcon({ size = 32, color = '#D69200' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="9" r="5" stroke={color} strokeWidth="2.4" />
      <Path d="M7 27C7 21.8 10.8 18.5 16 18.5C21.2 18.5 25 21.8 25 27" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  );
}
