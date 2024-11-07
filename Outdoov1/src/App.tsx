import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Pages/Dashboard";
import { AddActivities } from "./Pages/AddActivities";
import { MapFunctions } from "./Pages/MapFunctions";
import { Login } from "./Pages/Login";
import { Rewards } from "./Pages/Rewards";
import { Signup } from "./Pages/Signup";

function App() {
  const [userPoints, setUserPoints] = useState(0);  // Shared points state

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard userPoints={userPoints} setUserPoints={setUserPoints} />} />
        <Route path="/addactivities" element={<AddActivities />} />
        <Route path="/map" element={<MapFunctions />} />
        <Route path="/rewards" element={<Rewards userPoints={userPoints} setUserPoints={setUserPoints} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
