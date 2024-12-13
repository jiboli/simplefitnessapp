import * as React from 'react';
import {Text, View } from "react-native"
import { Workout } from '../types'; 
import { Day } from '../types';
import { Exercise } from '../types';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView } from 'react-native-gesture-handler';
import WorkoutList from '../components/WorkoutList';


export default function Workouts() {
    const [workouts, setWorkouts] = React.useState<Workout[]>([]);
    const [days, setDays] = React.useState<Day[]>([]);
    const [exercises, setExercises] = React.useState<Exercise[]>([]);

    const db = useSQLiteContext();


    React.useEffect(()=>{
        db.withTransactionAsync(async () => {await getData();})
    }, [db] )

    async function getData() { 
        const result = await db.getAllAsync<Workout>(`SELECT * FROM Workouts;`);
        setWorkouts(result);
        
    }

    async function deleteWorkout(workout_id:number) {
        db.withTransactionAsync(async () => {
            await db.runAsync(`DELETE FROM Workouts WHERE workout_id = ?;`, [workout_id])
            await getData();
            
        })
        
    }
    

    return (
        <View>
          <WorkoutList
          workouts={workouts} 
          deleteWorkout={deleteWorkout}
          /> 
        </View>
    );
}

