import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ActivityIndicator, Animated, Dimensions, ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const getCardWidth = () => {
  if (isWeb) {
    const totalGap = 16 * 2;
    return Math.min((width - totalGap - 100) / 3, 280);
  }
  return (width - 60) / 2;
};

const GameCard = ({ item, index, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const cardWidth = getCardWidth();

  return (
    <ImageBackground source={require("../assets/images/personimage.png")}  style={{borderRadius:"25%",overflow:"hidden"}}>
      <Animated.View style={[styles.cardContainer, {
        transform: [{ scale: scaleAnim }],
        width: cardWidth,

      }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}>
          <View style={[styles.cardBackground, { backgroundImage: require("../assets/images/logo.jpg") }]}>
            <Text style={styles.gameIcon}>{item.icon}</Text>

            <View style={styles.cardGradient}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                </View>

                <View style={styles.playButtonContainer}>
                  <View style={[styles.playButton, pressed && styles.playButtonPressed]}>
                    <Icon name="play-circle" size={40} color="#4ECDC4" style={styles.playIcon} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </ImageBackground>
  );
};
const Playground = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const gamesData = [
      {
        id: 1,
        title: "2048",
        category: "Brain Game",

        bgColor: "#FF6B6B",
        screen: "2048",
      },
      {
        id: 2,
        title: "Blockoduko",
        category: "Puzzle",
        
        bgColor: "#4ECDC4",
        screen: "Blockoduko",
      },
      {
        id: 3,
        title: "TicTacToe",
        category: "Arcade",
        
        bgColor: "#FFE66D",
        screen: "TicTacToe",
      },
      {
        id: 4,
        title: "Snake Game",
        category: "Classic",
        
        bgColor: "#95E1D3",
        screen: "SnakeGame",
      },
      {
        id: 5,
        title: "Dino Jump",
        category: "Action",
        
        bgColor: "#A8E6CF",
        screen: "DinoJump",
      },
      {
        id: 6,
        title: "Connect4",
        category: "Arcade",
        
        bgColor: "#FFD166",
        screen: "Connect4Game",  
      },
      {
        id: 7,
        category: "Sudoku",
        
        bgColor: "#FFD166",
        screen: "Sudoku"
      },
      {
        id: 8,
        category: "Bingo",
        
        bgColor: "#FFB6C1",
        screen: "Bingo"
      },


    ];

    setTimeout(() => {
      setData(gamesData);
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  const handleGamePress = (screenName) => {
    if (navigation) {
      navigation.navigate(screenName);
    }
  };

  return (

    <ImageBackground source={require("../assets/images/background_main.png")} style={styles.background} screenOptions={{ headerShown: false }}>
      <View style={styles.backgroundPattern}>
        <View style={[styles.gradientCircle, styles.circle1]} />
        <View style={[styles.gradientCircle, styles.circle2]} />
        <View style={[styles.gradientCircle, styles.circle3]} />
        <View style={[styles.gradientCircle, styles.circle4]} />


        <View style={styles.gridPattern}>
          {[...Array(20)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: i * 40 }]} />
          ))}
          {[...Array(20)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 40 }]} />
          ))}
        </View>
      </View>

      <View style={styles.overlay}>

        <View style={styles.header}>
          <View style={styles.logoContainer}>

            <Image source={require("../assets/images/logo.jpg")} style={[{ width: "95%", height: "50" }, styles.logoText]}></Image>
          </View>

          {/* <Pressable style={styles.profileButton}>
             <Ionicons name="person-circle-outline" size={28} color="#cecdcdff" />

          </Pressable> */}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#624da0ff" />
            <Text style={styles.loadingText}>Loading games...</Text>
          </View>
        ) : (
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Play & Enjoy</Text>
                <Text style={styles.subtitle}>Choose your favorite game</Text>
              </View> */}

              <View style={styles.gamesGrid}>
                {data.map((item, index) => (
                  <GameCard
                    key={item.id}
                    item={item}
                    index={index}
                    onPress={() => handleGamePress(item.screen)}
                  />
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
};

export default Playground;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundImage: require("../assets/images/background_main.png")
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  gradientCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: "#da9e7eff",
    opacity: 0.08,
    top: -150,
    left: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: "#4ECDC4",
    opacity: 0.06,
    top: 100,
    right: -150,
  },
  circle3: {
    width: 350,
    height: 350,
    backgroundColor: "#ff1515ff",
    opacity: 0.05,
    bottom: -100,
    left: -50,
  },
  circle4: {
    width: 250,
    height: 250,
    backgroundColor: "#994b1eff",
    opacity: 0.04,
    bottom: 200,
    right: 50,
  },
  gridPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.03,
  },
  gridLine: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#7F5AF0",
  },
  gridLineVertical: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "#7F5AF0",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,15,0.75)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingTop: "10"
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFE",
    textShadowColor: "rgba(20, 255, 204, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(225, 177, 44, 1)",
  },
  profileIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#A7A9BE",
    fontSize: 14,
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: isWeb ? "center" : "stretch",
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: isWeb ? "center" : "flex-start",
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFE",
    marginBottom: 8,
    textShadowColor: "rgba(254, 250, 22, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0d53bff",
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isWeb ? "center" : "space-between",
    gap: 16,
    maxWidth: isWeb ? 1200 : "100%",
  },
  cardContainer: {
    marginBottom: 4,
  },
  card: {
    width: "100%",
    height: isWeb ? 240 : undefined,
    aspectRatio: isWeb ? undefined : 0.85,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameIcon: {
    fontSize: isWeb ? 60 : 70,
    marginBottom: -15,
    opacity: 0.9,
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    padding: 14,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: isWeb ? 16 : 15,
    fontWeight: "700",
    color: "#FFFFFE",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: isWeb ? 11 : 10,
    color: "#E3E4E8",
    opacity: 0.8,
  },
  playButtonContainer: {
    marginLeft: 8,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e6d705ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#f3b90dff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  playButtonPressed: {
    backgroundColor: "#c4a20dff",
  },
  playIcon: {
    fontSize: 14,
    color: "#FFFFFE",
    marginLeft: 2,
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
    paddingVertical: 20,
  },
  footerText: {
    color: "#26e8c1ff",
    fontSize: 13,
  },
});
export const unstable_settings = {
  headerShown: false,
}