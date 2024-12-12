import * as React from 'react';
import {Text, View } from "react-native"
import { Workout } from '../types'; 
import { Day } from '../types';
import { Exercise } from '../types';
import { useSQLiteContext } from 'expo-sqlite';


export default function Workouts() {
    const [workouts, setWorkouts] = React.useState<Workout[]>([]);
    const [days, setDays] = React.useState<Day[]>([]);
    const [exercises, setExercises] = React.useState<Exercise[]>([]);

    const db = useSQLiteContext();


    React.useEffect(()=>{
        db.withTransactionAsync(async () => {await getData();})
    }, [db] )

    async function getData() { 
        const workoutsResult = await db.getAllAsync<Workout>(
            `SELECT name AS table_name FROM sqlite_master WHERE type = 'table'
;`
        )
        console.log('Workouts:', workoutsResult);
        setWorkouts(workoutsResult);
    }

    

    return (
        <View>
          <Text>Workouts </Text>  
        </View>
    );
}

