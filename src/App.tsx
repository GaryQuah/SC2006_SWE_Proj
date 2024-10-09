import {Routes, Route} from "react-router-dom"
import { Dashboard } from "./Pages/Dashboard"
import { AddActivities } from "./Pages/AddActivities"
import { ViewMap } from "./Pages/ViewMap"

function App() {
  return (
    <>
    <Routes>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/addactivities" element={<AddActivities/>}/>
      <Route path="/map" element={<ViewMap/>}/>
    </Routes>
    </>
    
  )
}

export default App
