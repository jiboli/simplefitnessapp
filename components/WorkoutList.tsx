import { Workout } from "../types"
import { Touchable, TouchableOpacity, Text, View } from "react-native";

export default function WorkoutList({
    workouts,
    deleteWorkout,
    }: {
        workouts: Workout[];
        deleteWorkout: (workout_id:number) => Promise<void>;
       }) {
    return ( 
        
        <View>
            {workouts.map((workout) => {
                return(
                    <TouchableOpacity key={workout.workout_id} activeOpacity={0.7} onLongPress={() => deleteWorkout(workout.workout_id)}>

                    <Text>

                        {workout.workout_id}  Workout name:{workout.workout_name}


                    </Text>
                    </TouchableOpacity>
                )
            })}


        </View>

    ) 
}