import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface BoltLogoProps {
  size?: 'small' | 'medium' | 'large' | number;
}

export default function BoltLogo({ size = 'medium' }: BoltLogoProps) {
  let width: number;
  let height: number;

  if (typeof size === 'number') {
    width = size;
    height = size / 2;
  } else {
    const logoSizes = {
      small: { width: 80, height: 40 },
      medium: { width: 120, height: 60 },
      large: { width: 180, height: 90 }
    };
    width = logoSizes[size].width;
    height = logoSizes[size].height;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('@/public/bolt_logo.png')}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  }
}); 