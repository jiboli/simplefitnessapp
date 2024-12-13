// App.tsx
import React, { useEffect, useState } from 'react';
import { View,Text, ActivityIndicator, StatusBar, StyleSheet, Pressable } from 'react-native'; // Import Pressable here
import * as FileSystem from 'expo-file-system';
import { SQLiteProvider } from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './screens/Home'; // Assuming you have a Home screen component
import Workouts from './screens/Workouts';
import CreateWorkout from './screens/CreateWorkout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutDetails from './screens/WorkoutDetails';

const Bottom = createBottomTabNavigator();
const Stack = createNativeStackNavigator<WorkoutStackParamList>();

const resetDatabase = async () => {
  try {
    const dbName = "SimpleDB.db";
    const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

    // Check if the database file exists
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (fileInfo.exists) {
      // Delete the existing database file
      console.log("Deleting existing database...");
      await FileSystem.deleteAsync(dbFilePath, { idempotent: true });
      console.log("Database deleted.");
    }

    // Recreate the database folder if necessary
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );

    // Initialize a new database (or download a fresh copy)
    const dbAsset = require("./assets/SimpleDB.db");
    const dbUri = Asset.fromModule(dbAsset).uri;

    console.log("Downloading new database...");
    await FileSystem.downloadAsync(dbUri, dbFilePath);
    console.log("New database downloaded.");
  } catch (error) {
    console.error("Error resetting database:", error);
  }
};



const loadDatabase = async () => {
  try {
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
      console.log("Downloading database...");
      await FileSystem.downloadAsync(dbUri, dbFilePath);
    } else {
      console.log("Database already exists.");
    }
  } catch (error) {
    console.error("Error in loadDatabase:", error);
  }
};


export type WorkoutStackParamList = {
  WorkoutsList: undefined; // No parameters for this route
  CreateWorkout: undefined; // No parameters for this route
  WorkoutDetails: { workout_id: number }; // Add this
};

function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false, // Disable headers for all screens in this stack
    }}
  >
      <Stack.Screen
        name="WorkoutsList"
        component={Workouts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateWorkout"
        component={CreateWorkout}
        options={{ title: 'Create Workout' }}
      />
      <Stack.Screen
        name='WorkoutDetails'
        component={WorkoutDetails}
        options={{title: 'WorkoutDetails'}}
        />
    </Stack.Navigator>
  );
}

export default function App() {
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        //await resetDatabase();
        await loadDatabase();
        setDbLoaded(true);
      } catch (e) {
        console.error("Database loading error:", e);
      }
    })();
  }, []);
  
  if (!dbLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <React.Suspense
          fallback={
            <View style={{ flex:1}}>
              <ActivityIndicator size={'large'}/>
              <Text> Loading Database...</Text>
            </View>
          }
          />

        <SQLiteProvider databaseName="SimpleDB.db" useSuspense>
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
              component={WorkoutStack}
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
          </Bottom.Navigator>
        </SQLiteProvider>
      </NavigationContainer>
      </GestureHandlerRootView>
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
    height: 80, // Adjusted height for a larger tab bar
    paddingVertical: 10, // Reduced padding to balance spacing
  },
  tabBarLabel: {
    fontSize: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
});



