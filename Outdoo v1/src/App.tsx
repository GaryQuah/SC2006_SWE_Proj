import {Routes, Route} from "react-router-dom"
import { Dashboard } from "./Pages/Dashboard"
import { AddActivities } from "./Pages/AddActivities"
import { MapFunctions } from "./Pages/MapFunctions"
import { Login } from "./Pages/Login"
import { Rewards } from './Pages/Rewards'
import { Signup } from "./Pages/Signup"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/addactivities" element={<AddActivities/>}/>
        <Route path="/map" element={<MapFunctions/>}/>
        <Route path="/rewards" element={<Rewards/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </>
    
  )
}

export default App
