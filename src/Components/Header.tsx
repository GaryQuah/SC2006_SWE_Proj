import { NavLink } from "react-router-dom"
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import "./css/Header.css"

export function Header(){
    return(
        <div className="header">
            <div className="menu-logo">
                <div>
                    <NavLink to="/dashboard" className="logo">
                        <img src={Hikingicon}></img>
                        <h4>Outdoo</h4>
                    </NavLink>
                </div>
            </div>
            <NavLink to="/profile" className="profile">
                <img src={Usericon}></img>
            </NavLink>
        </div>
    )
}