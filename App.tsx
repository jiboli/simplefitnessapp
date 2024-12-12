// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet, Pressable } from 'react-native'; // Import Pressable here
import * as FileSystem from 'expo-file-system';
import { SQLiteProvider } from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './screens/Home'; // Assuming you have a Home screen component
import Workouts from './screens/Workouts';

const Bottom = createBottomTabNavigator();

const loadDatabase = async () => {
  const dbName = "SimpleDB.db";
  const dbAsset = require("./assets/SimpleDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);

  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
};

const App: React.FC = () => {
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error("Database loading error:", e));
  }, []);

  if (!dbLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SQLiteProvider databaseName="SimpleDB.db">
        <Bottom.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarActiveTintColor: 'black', // Active icon color
            tabBarInactiveTintColor: 'gray', // Inactive icon color
          }}
        >
          <Bottom.Screen
            name="Home"
            component={Home}
            options={{
              tabBarButton: (props) => (
                <TabButton {...props} iconName="home" />
              ),
              tabBarLabel: 'Home',
            }}
          />
          <Bottom.Screen
            name="My Workouts"
            component={Workouts}
            options={{
              tabBarButton: (props) => (
                <TabButton {...props} iconName="barbell" />
              ),
              tabBarLabel: 'My Workouts',
            }}
          />
          <Bottom.Screen
            name="My Calendar"
            component={Home}
            options={{
              tabBarButton: (props) => (
                <TabButton {...props} iconName="calendar" />
              ),
              tabBarLabel: 'My Calendar',
            }}
          />
          <Bottom.Screen
            name="My Progress"
            component={Home}
            options={{
              tabBarButton: (props) => (
                <TabButton {...props} iconName="stats-chart" />
              ),
              tabBarLabel: 'My Progress',
            }}
          />
          <Bottom.Screen
            name="Settings"
            component={Home}
            options={{
              tabBarButton: (props) => (
                <TabButton {...props} iconName="settings" />
              ),
              tabBarLabel: 'Settings',
            }}
          />
        </Bottom.Navigator>
      </SQLiteProvider>
    </NavigationContainer>
  );
}

// Custom TabButton component to handle icon rendering
const TabButton = (props: any) => {
  const { accessibilityState, onPress } = props;
  const isSelected = accessibilityState?.selected; // Use optional chaining

  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Ionicons name={props.iconName} size={24} color={isSelected ? 'black' : 'gray'} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 10,
    paddingVertical: 100,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // Adjust padding as needed
  },
});

export default App;
