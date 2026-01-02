import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from './constants/colors';
import { TAB_CONFIG } from './constants/navigation';
import { registerForPushNotificationsAsync } from './services/notifications';
import HomeScreen from './screens/HomeScreen';
import DevotionalScreen from './screens/DevotionalScreen';
import AnnouncementsScreen from './screens/AnnouncementsScreen';
import SermonsScreen from './screens/SermonsScreen';
import ZoomScreen from './screens/ZoomScreen';
import MusicScreen from './screens/MusicScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
  },
};

const screenComponents = {
  Home: HomeScreen,
  Devotional: DevotionalScreen,
  Announcements: AnnouncementsScreen,
  Sermons: SermonsScreen,
  Zoom: ZoomScreen,
  Music: MusicScreen,
};

const App = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.primary },
            headerTitleStyle: { color: colors.white },
            headerTintColor: colors.white,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.gold,
            tabBarStyle: { backgroundColor: colors.cream },
            tabBarIcon: ({ color, size }) => {
              const icon = TAB_CONFIG.find((tab) => tab.name === route.name)?.icon || 'circle';
              return <MaterialCommunityIcons name={icon} size={size} color={color} />;
            },
          })}
        >
          {TAB_CONFIG.map((tab) => (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={screenComponents[tab.name]}
              options={{ title: tab.label }}
            />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
