import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import homeScreen from "../screens/homeScreen";
import game2048 from "../screens/2048"
import Blockoduko from "../screens/blockoduko"
import SnakeGame from "../screens/SnakeGame";
import PacmanScreen from "../screens/PacmanScreen";
import DinoJumpScreen from "../screens/DinojumpScreen";
import TicTacToeScreen from "../screens/tictactoe";
import Sudoku from "../screens/sudoku";
import Bingo from "../screens/Bingo";

const Stack = createNativeStackNavigator();
const StackNavigatorContainer =()=>{
    return (
    <Stack.Navigator >
        <Stack.Screen name="Home" component={homeScreen} />
        <Stack.Screen name="2048" component={game2048} />
        <Stack.Screen name="Blockoduko" component={Blockoduko}/>
         <Stack.Screen name="SnakeGame" component={SnakeGame}/>
        <Stack.Screen name="PacmanScreen" component={PacmanScreen}/>
        <Stack.Screen name="DinoJump" component={DinoJumpScreen}/> 
        <Stack.Screen name="TicTacToe" component={TicTacToeScreen}/>
        <Stack.Screen name="Sudoku" component={Sudoku}/> 
        <Stack.Screen name="Bingo" component={Bingo}/> 
    </Stack.Navigator>
    )
}
const Navigation = () => {
  return (
    <StackNavigatorContainer/>
   );
}
export default Navigation

