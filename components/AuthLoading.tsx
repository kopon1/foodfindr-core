import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface AuthLoadingProps {
  message?: string;
}

export default function AuthLoading({ message = 'Loading...' }: AuthLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
}); 