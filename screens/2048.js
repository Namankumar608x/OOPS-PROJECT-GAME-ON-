import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Tile, GameManager } from '../components/GameManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@react-navigation/native';
const App = () => {
    const [game, setGame] = useState(new GameManager());
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        loadHighScore();
    }, []);

    useEffect(() => {
        if (game.isGameOver()) {
            Alert.alert('Game Over', `Your score: ${score}`, [
                { text: 'Restart', onPress: () => restartGame() },
            ]);
        }
    }, [game]);

    const loadHighScore = async () => {
        try {
            const value = await AsyncStorage.getItem('HIGH_SCORE');
            if (value !== null) {
                setHighScore(parseInt(value, 10));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const saveHighScore = async (newScore) => {
        if (newScore > highScore) {
            try {
                await AsyncStorage.setItem('HIGH_SCORE', newScore.toString());
                setHighScore(newScore);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleMove = (direction) => {
        let moved = game.move(direction);
        if (moved) {
            setScore(game.score);
            saveHighScore(game.score);
            setGame(newGameManagerSnapshot(game));
        }
    };

    const restartGame = () => {
        let newGame = new GameManager();
        setGame(newGame);
        setScore(0);
    };

    return (
        <ThemeProvider>
            <SafeAreaView style={styles.container}>
            <Text style={styles.title}>2048 Game</Text>
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>Score: {score}</Text>
                <Text style={styles.score}>High Score: {highScore}</Text>
            </View>
            <View style={styles.grid}>
                {game.grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((tile, colIndex) => (
                            <View key={colIndex} style={[styles.cell, tileStyle(tile)]}>
                                <Text style={styles.cellText}>
                                    {tile ? tile.value : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
            <View style={styles.controls}>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleMove('up')} style={styles.button}>
                        <Text style={styles.buttonText}>Up</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleMove('left')} style={styles.button}>
                        <Text style={styles.buttonText}>Left</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMove('right')} style={styles.button}>
                        <Text style={styles.buttonText}>Right</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleMove('down')} style={styles.button}>
                        <Text style={styles.buttonText}>Down</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
        </ThemeProvider>
        
    );
};

function newGameManagerSnapshot(game) {
    const newGame = new GameManager();
    newGame.grid = game.grid.map(row => row.map(tile => tile ? new Tile(tile.value, tile.row, tile.col) : null));
    newGame.score = game.score;
    return newGame;
}

function tileStyle(tile) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e',
    };
    return {
        backgroundColor: tile ? colors[tile.value] || '#3c3a32' : '#cdc1b4',
    };
}
// const scheme = useColorScheme();
const theme=useTheme();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme==="light"?"#fff":"black",
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    grid: {
        backgroundColor: '#bbada0',
        padding: 5,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 70,
        height: 70,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    cellText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#776e65',
    },
    controls: {
        marginTop: 20,
        justifyContent:"center",
        alignItems:"center"
    },
    button: {
        backgroundColor: '#8f7a66',
        padding: 10,
        margin: 5,
        borderRadius: 5,

    },
    buttonText: {
        color: '#f9f6f2',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default App;
