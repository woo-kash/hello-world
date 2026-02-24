import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MissionSelectScreen from './src/screens/MissionSelectScreen';
import MissionScreen from './src/screens/MissionScreen';
import VictoryScreen from './src/screens/VictoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MissionSelect"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MissionSelect" component={MissionSelectScreen} />
          <Stack.Screen name="MissionScreen" component={MissionScreen} />
          <Stack.Screen name="VictoryScreen" component={VictoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
