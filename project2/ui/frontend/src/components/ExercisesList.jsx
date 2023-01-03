import { Link } from 'react-router-dom'
import { getLocalStorageItem} from '../utils/utils'
import { useState, useEffect } from 'react'

// 需要router
export default function ExercisesList( {exercises, update}) {
    const loggedUserJSON = getLocalStorageItem('loggedUser')
    const [completedExercises, setCompletedExercises] = useState([])
    const [noCompletedExercises, setNoCompletedExercises] = useState([])
    useEffect(() => {
        const getCompletedExercises = async () => {
            if(!loggedUserJSON) {
                return
            }
            const res = await fetch('http://localhost:7777/completed', {
                method: 'GET',
                headers: {
                    'Authorization': 'bearer ' + loggedUserJSON.token
                },
            })
            const data = await res.json()
            let count = 0
            const cex = []
            const nex = []
            exercises.forEach(exercise => {
                if(data.result.includes(exercise.id)) {
                    cex.push(exercise)
                } else {
                    if (count < 3) {
                        nex.push(exercise)
                        count++
                    }
                }
            })
            setCompletedExercises(cex)
            setNoCompletedExercises(nex)

        }
        getCompletedExercises()
    }, [update,exercises])

    if (!loggedUserJSON) {
        return (
            <div>
            <h2>Exercises</h2>
            <ul>
            {exercises.map((exercise) => (
                <li key={exercise.id}><Link to={`/exercises/${exercise.id}`}> {exercise.name} </Link></li>
            ))}
            </ul>
            </div>
        )
    }

   
    return (
        <div>
            <h2>Exercises</h2>
            <h3>Not Completed</h3>
            <ul>
            {noCompletedExercises.map((exercise) => (
                <li key={exercise.id}><Link to={`/exercises/${exercise.id}`}> {exercise.name} </Link></li>
            ))}
            </ul>
            <h3>Completed</h3>
            <ul>
            {completedExercises.map((exercise) => (
                <li key={exercise.id}><Link to={`/exercises/${exercise.id}`}> {exercise.name} </Link></li>
            ))}
            </ul>
        </div>
    )
}