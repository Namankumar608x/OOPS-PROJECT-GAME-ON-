import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import homeScreen from "../screens/homeScreen";
import game2048 from "../screens/2048";
import Blockoduko from "../screens/blockoduko";
import SnakeGame from "../screens/SnakeGame";
import DinoJumpScreen from "../screens/DinojumpScreen";
import TicTacToeScreen from "../screens/tictactoe";
import Sudoku from "../screens/sudoku";
import Bingo from "../screens/Bingo";
import Connect4Game from "../screens/Connect4Game";
import Tetris from "../screens/Tetris.js";
import FlappyBirdScreen from "../screens/FlappyBirdScreen";
const Stack = createNativeStackNavigator();
const StackNavigatorContainer =()=>{
    return (
    <Stack.Navigator >
        <Stack.Screen name="Home" component={homeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="2048" component={game2048} options={{headerShown:false}}/>
        <Stack.Screen name="Blockoduko" component={Blockoduko} options={{headerShown:false}}/>
         <Stack.Screen name="SnakeGame" component={SnakeGame} options={{headerShown:false}}/>
        <Stack.Screen name="Connect4Game" component={Connect4Game} options={{headerShown:false}}/>
        <Stack.Screen name="DinoJump" component={DinoJumpScreen} options={{headerShown:false}}/> 
        <Stack.Screen name="TicTacToe" component={TicTacToeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="Sudoku" component={Sudoku} options={{headerShown:false}}/> 
        <Stack.Screen name="Bingo" component={Bingo} options={{headerShown:false}}/> 
        <Stack.Screen name="Tetris" component={Tetris} options={{headerShown:false}}/> 
        <Stack.Screen name="FlappyBird" component={FlappyBirdScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return <StackNavigatorContainer />;
};

export default Navigation;