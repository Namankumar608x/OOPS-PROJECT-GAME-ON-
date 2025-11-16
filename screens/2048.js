import React, { useState, useEffect } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { Image } from 'react-native';
import { ImageBackground } from 'react-native';
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
import themeChange from '../assets/images/themeChange.png'
// import { ThemeProvider, useTheme } from '@react-navigation/native';
// const [Theme ,setTheme]=useState("light");

const App = () => {
    const [game, setGame] = useState(new GameManager());
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const [Theme, setTheme] = useState("light");

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };
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

        <ImageBackground source={require("../assets/images/background(1).png")} style={[styles.container]}>
            <View style={styles.header}>
                <Image source={require("../assets/images/2048.png")} style={{height:"40",width:"70%"}}></Image>
            </View>

            <View style={styles.scoreContainer}>
                <Text style={[styles.score, { color: "#000000" }]}>Score: {score}</Text>
                <Text style={[styles.score, { color: "#000000" }]}>High Score: {highScore}</Text>
            </View>
            <View style={[styles.grid,{opacity:1}]}>
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
                    <TouchableOpacity onPress={() => handleMove('up')} style={[styles.button ]}>
                        <Text style={[styles.buttonText,{color:"#12022b"}]}>Up</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleMove('left')} style={[styles.button]}>
                        <Text style={[styles.buttonText,{color:"#12022b"}]}>Left</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMove('right')} style={[styles.button]}>
                        <Text style={[styles.buttonText,{color:"#12022b"}]}>Right</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleMove('down')} style={[styles.button]}>
                        <Text style={[styles.buttonText,{color:"#12022b"}]}>Down</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>


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
    2:    '#C4B5FD', // soft lavender
    4:    '#A78BFA', // medium lavender
    8:    '#8B5CF6', // bright purple
    16:   '#7C3AED', // deep purple
    32:   '#6D28D9', // darker purple
    64:   '#5B21B6', // royal violet
    128:  '#F472B6', // neon pink
    256:  '#EC4899', // bright hot pink
    512:  '#DB2777', // deep raspberry
    1024: '#FBBF24', // sunset yellow (contrast boost)
    2048: '#F59E0B', // golden sunset
};

    return {
        backgroundColor: tile ? colors[tile.value] || '#1a1f3a' : '#1a1f3a',
    };
}
// const scheme = useColorScheme();
// const theme=useTheme();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        zIndex:2
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        width: '80%',
        marginBottom: 20,
        marginTop:20,
        gap:10
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: "#9b21d9",
        padding:10,
        margin:10,
        borderRadius: 5,
        borderColor:"#ffffff",
        borderWidth:2,
        opacity:0.8
    },
    grid: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        zIndex:2,
        marginLeft:5
    },
    cell: {
        width: 70,
        height: 70,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        
        backgroundColor: '#1a1f3a',
        borderWidth: 2,
        borderColor: '#2a3f5f',
        borderRadius: 8,
    },
    cellText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    controls: {
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        backgroundColor: "#9b21d9",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        borderColor:"#fff",
        borderWidth:2,
        marginRight:10,
        opacity:0.8,
        gap:10
    },
    buttonText: {
        color: '#f9f6f2',
        fontWeight: 'bold',
        fontSize: 18,
    },
    themeBtn: {
        justifyContent: "center",
        alignItems: "center",
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        borderWidth: 3,
        borderColor: "yellow",
    },
    header: {
        width: "75%",
        height:"auto",
        justifyContent: "center",
        alignItems:"center",
    }
});

export default App;
