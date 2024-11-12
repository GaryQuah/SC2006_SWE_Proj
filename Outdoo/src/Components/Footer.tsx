import { NavLink } from "react-router-dom"
import Homeicon from "../assets/Home icon.png"
import Rewardicon from "../assets/Trophy icon.png"
import Settingsicon from "../assets/Settings icon.png"
import "./css/Footer.css"

export function Footer(){
    return(
        <footer>
            <ul className="nav">
                <li><NavLink to="/dashboard"><img src={Homeicon}></img></NavLink></li>
                <li><NavLink to="/rewards"><img src={Rewardicon}></img></NavLink></li>
                <li><NavLink to="/settings"><img src={Settingsicon}></img></NavLink></li>
            </ul>
        </footer>
    )
}