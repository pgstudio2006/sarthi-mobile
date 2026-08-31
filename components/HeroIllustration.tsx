import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, useWindowDimensions } from 'react-native';

const FIGMA_WIDTH = 390;
const ILLUSTRATION_HEIGHT = 340;
const MAX_SCREEN_RATIO = 0.42;

export default function HeroIllustration({ source }: { source: ImageSourcePropType }) {
  const { width, height } = useWindowDimensions();
  const scale = width / FIGMA_WIDTH;
  const calculatedHeight = ILLUSTRATION_HEIGHT * scale;
  const maxHeight = height * MAX_SCREEN_RATIO;

  return (
    <Image
      source={source}
      style={[styles.image, { width: '100%', height: Math.min(calculatedHeight, maxHeight) }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
