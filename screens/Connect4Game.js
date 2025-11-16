import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameManager from '../components/connect4/GameManager';

export default function Connect4Game() {
  return (
    <View style={styles.container}>
      <GameManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});