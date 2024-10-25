import {Footer} from "../Components/Footer"
import Calendericon from "../assets/Calender icon.png"
import Healthbuddyicon from "../assets/Chatbot white Icon.png"
import Rewardicon from "../assets/Hand Reward icon.png"
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import {Link, NavLink} from "react-router-dom"
import dashboardstyle from "./css/Dashboard.module.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { Healthbuddy } from "../Components/Healthbuddy"

export function Dashboard(){
    
    const UVAPI=import.meta.env.VITE_OPENWEATHER_UV_API_KEY;
    const WeatherAPI=import.meta.env.VITE_OPENWEATHER_WEATHER_API_KEY;
    const [UVData, setUVData] = useState([]);
    const [WeatherData, setWeatherData] = useState([]);
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);
    
    const getUVData = () =>{
        axios.get(UVAPI)
        .then(res => {
            console.log(res.data.value)
            setUVData(res.data.value);
        })
        .catch(err => {
            console.log(err)
        })
    }

    const getWeatherData = () =>{
        axios.get(WeatherAPI)
        .then(res => {
            console.log(res.data.main.temp)
            setWeatherData(res.data.main.temp);
        })
        .catch(err => {
            console.log(err)
        })
    }
    
    useEffect(()=>{
        getUVData()
        getWeatherData()
    },[])

    return(
        <>
            <div className={dashboardstyle.main_grid}>
                <div className={dashboardstyle.header}>
                    <div className={dashboardstyle.menu_logo}>                        
                        <div>
                            <NavLink to="/dashboard" className={dashboardstyle.logo}>
                                <img src={Hikingicon}></img>
                                <h4>Outdoo</h4>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/" className={dashboardstyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                </div>
                <main className={dashboardstyle.main_main}>
                    <section className={dashboardstyle.user_points}>
                        <h2 className={dashboardstyle.section_title}>Your Points</h2>
                        <h2 className={dashboardstyle.Information}>User's Points</h2>
                    </section>

                    <section className={dashboardstyle.real_time_information}>
                        <div className={dashboardstyle.real_time_information__UV}>
                            <h2 className={dashboardstyle.section_title}>UV Index</h2>
                            <h2 className={dashboardstyle.Information}>{UVData}</h2>
                            <p>Moderate risk of harm from unprotected sun</p>
                        </div>
                        <div className={dashboardstyle.real_time_information__Weather}>
                            <h2 className={dashboardstyle.section_title}>Weather</h2>
                            <h2 className={dashboardstyle.Information}>{WeatherData}°C</h2>
                            <p>Partly cloudy with a sight chance of rain</p>
                        </div>
                    </section>
        
                    <section className={dashboardstyle.upcoming_activities}>
                        <div className={dashboardstyle.upcoming_activities__header}>
                            <h2 className={dashboardstyle.section_title}>Upcoming Activities</h2>
                            <img src={Calendericon} className={dashboardstyle.Calender_icon}></img>
                        </div>
                        
                        <div className={dashboardstyle.activity_log}></div>
                    </section>
                    
                    <div className={dashboardstyle.btn_group1}>
                        <Link to="/addactivities" className={dashboardstyle.btn_primary}>
                            <h2>Add Activity +</h2>
                        </Link>

                        <Link to="/map" className={dashboardstyle.btn_primary}>
                            <h2>View Map</h2>
                        </Link>
                    </div>
                    
                    <div className={dashboardstyle.btn_group2}>
                        <div className={dashboardstyle.div_healthbuddy}>
                            <button className={dashboardstyle.btn_healthbuddy} onClick={()=>setShowHealthbuddy(!showhealthbuddy)}>
                                <img src={Healthbuddyicon}></img>
                                <p>Health Buddy</p>
                            </button>
                        </div>

                        <Link to="/rewards" className={dashboardstyle.btn_reward}>
                            <img src={Rewardicon}></img>
                            <p>Claim Rewards</p>
                        </Link>
                    </div>

                    {showhealthbuddy? 
                        <div className={dashboardstyle.Healthbuddy}>
                            <div className={dashboardstyle.Health_buddy_header}>
                                <div className={dashboardstyle.health_buddy_logo}>    
                                    <img src={Healthbuddyicon}/>
                                    <h4>HealthBuddy</h4>
                                </div>
                                <button className={dashboardstyle.Close_Health_buddy} onClick={()=> setShowHealthbuddy(false)}>X</button>
                            </div>
                            <Healthbuddy/>
                        </div>:null
                    }
                </main>
            </div>            
            <Footer/>
        </>
    )
}