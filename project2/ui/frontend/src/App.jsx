import React, { Suspense, useEffect, useState } from "react";
import "antd/dist/antd.css";
import {
  Navigate,
  Route,
  Routes,
  useMatch,
  useNavigate,
} from "react-router-dom";
import { getLocalStorageItem, removeLocalStorageItem } from "./utils/utils";

const LoginFormHandle = React.lazy(() => import("./components/LoginForm"));
const ExercisesListHandle = React.lazy(() =>
  import("./components/ExercisesList")
);
const ExerciseHandle = React.lazy(() => import("./components/Exercise"));

function LoginForm({ setUser, setUpdate }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginFormHandle setUser={setUser} setUpdate={setUpdate} />
      </Suspense>
    </div>
  );
}

function ExercisesList({ exercises, update }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ExercisesListHandle exercises={exercises} update={update} />
      </Suspense>
    </div>
  );
}

function Exercise({ exercise, setUpdate }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ExerciseHandle exercise={exercise} setUpdate={setUpdate} />
      </Suspense>
    </div>
  );
}

function App() {
  // const evtSource = new EventSource("http://localhost:7778/sse");
  // evtSource.addEventListener("message", function (event) {
  //   console.log("message", event.data);
  // });
  // evtSource.addEventListener("reply", function (event) {
  //   console.log("reply", event.data);
  // });
  const initalData = [{
    id: 1,
    name: "Sum of three values",
    content:
      "Write a function int sum(int first, int second, int third) that returns the sum of the given integers. As an example, the function call sum(1, 2, 3) should return the value 6.",
  }];
  const [exercises, setExercises] = useState([]);
  const [update, setUpdate] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localost:7777/exercises");
      const data = await response.json();
      setExercises(data.data);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const loggedUserJSON = getLocalStorageItem("loggedUser");
    if (loggedUserJSON) {
      setUser(loggedUserJSON);
    }
  }, []);
  const [user, setUser] = useState(null);
  const handleLogout = () => {
    removeLocalStorageItem("loggedUser");
    setUser(null);
  };
  const match = useMatch("/exercises/:id");
  const selectedExercise = match
    ? exercises.find((exercise) => exercise.id === Number(match.params.id))
    : null;
  const navigate = useNavigate();

  return (
    <div>
      <h2>B+ Service</h2>
      {user === null
        ? (
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </button>
        )
        : (
          <p>
            {user.username} logged in{" "}
            <button onClick={handleLogout}>log out</button>
          </p>
        )}

      <Routes>
        <Route
          path="/login"
          element={<LoginForm setUser={setUser} setUpdate={setUpdate} />}
        />
        <Route
          path="/exercises"
          element={<ExercisesList exercises={exercises} update={update} />}
        />
        <Route
          path="/exercises/:id"
          element={
            <Exercise exercise={selectedExercise} setUpdate={setUpdate} />
          }
        />
        <Route path="/" element={<Navigate to="/exercises" replace />} />
      </Routes>
    </div>
  );
}

// TODO: add router v6 auth

export default App;
