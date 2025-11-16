import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameManager from '../components/pacman/GameManager';

export default function PacmanGame() {
  return (
    <View style={styles.container}>
      <GameManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});