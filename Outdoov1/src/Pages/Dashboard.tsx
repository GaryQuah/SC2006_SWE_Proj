import { Footer } from "../Components/Footer"; 
import Calendericon from "../assets/Calender icon.png";
import Healthbuddyicon from "../assets/Chatbot white Icon.png";
import Rewardicon from "../assets/Hand Reward icon.png";
import Hikingicon from "../assets/Hiking icon.png";
import Usericon from "../assets/User icon.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import dashboardstyle from "./css/Dashboard.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Healthbuddy } from "../Components/Healthbuddy";

export function Dashboard() {
    const DATA_API_URL = 'http://127.0.0.1:5000/dashboard';
    const UPDATE_POINTS_API_URL = 'http://127.0.0.1:5000/update_points';
    const [UVData, setUVData] = useState([]);
    const [WeatherData, setWeatherData] = useState([]);
    const [Weather_Des, setWeatherDes] = useState([]);
    const [UV_Des, setUVDes] = useState([]);
    const [UserPoints, setUserPoints] = useState([]);
    const [UserActivities, setActivities] = useState([]);
    const [WeatherIcon, setWeatherIcon] = useState(String);
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);
    const [showLoginNotification, setShowLoginNotification] = useState(false);  // State for notification
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const getData = () => {
        console.log("key = " + "Bearer " + token);
        axios.get(DATA_API_URL, { headers: { Authorization: "Bearer " + token } })
        .then(response => {
            setUVData(response.data.uv_index);
            setWeatherData(response.data.temperature);
            setWeatherDes(response.data.weather_description);
            setWeatherIcon("https://openweathermap.org/img/wn/" + response.data.weather_icon + "@2x.png");
            setUVDes(response.data.uv_description);
            setUserPoints(response.data.points);
            setActivities(response.data.activities);
        })
        .catch(error => {
            if (error.response && error.response.status === 401) {
                navigate("/");
            } else {
                console.error("Error fetching dashboard data:", error);
            }
        });
    };

    // Fetch initial data and conditionally add login points
    useEffect(() => {
        getData();

        // Check if user just logged in
        if (localStorage.getItem('justLoggedIn') === 'true') {
            // Add 100 points only on the first load after login
            updatePoints(100);
            setShowLoginNotification(true);  // Show notification after login
            // Remove the flag so points are not added again on subsequent visits
            localStorage.removeItem('justLoggedIn');
        }
    }, []);

    // Add 1 point every second
    useEffect(() => {
        const interval = setInterval(() => {
            updatePoints(1);
        }, 1000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    // Function to update points on the backend
    const updatePoints = (points) => {
        axios.post(UPDATE_POINTS_API_URL, { points }, {
            headers: { Authorization: "Bearer " + token }
        })
        .then(response => {
            setUserPoints(response.data.updatedPoints); // Update local points state
        })
        .catch(error => {
            console.error("Error updating points:", error);
        });
    };

    // Close notification handler
    const closeNotification = () => setShowLoginNotification(false);

    return (
        <>
            {/* Login Notification Dropdown */}
            {showLoginNotification && (
                <div className={dashboardstyle.notificationOverlay}>
                    <div>
                        <h3>🎉 Congrats on Logging In!</h3>
                        <p>You've gained 100 points. Keep it up!</p>
                    </div>
                    <button className={dashboardstyle.closeNotification} onClick={closeNotification}>&times;</button>
                </div>
            )}

            <div className={dashboardstyle.main_grid}>
                <div className={dashboardstyle.header}>
                    <div className={dashboardstyle.menu_logo}>                        
                        <div>
                            <NavLink to="/dashboard" className={dashboardstyle.logo}>
                                <img src={Hikingicon} alt="Logo"/>
                                <h4>Outdoo</h4>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/" className={dashboardstyle.profile}>
                        <img src={Usericon} alt="User Icon"/>
                    </NavLink>
                </div>
                <main className={dashboardstyle.main_main}>
                    <section className={dashboardstyle.user_points}>
                        <h2 className={dashboardstyle.section_title}>Your Points:</h2>
                        <h2 className={dashboardstyle.Information}>{UserPoints}</h2>
                    </section>

                    <section className={dashboardstyle.real_time_information}>
                        <div className={dashboardstyle.real_time_information__UV}>
                            <h2 className={dashboardstyle.section_title}>UV Index</h2>
                            <h2 className={dashboardstyle.Information}>{UVData}</h2>
                            <p>{UV_Des}</p>
                        </div>
                        <div className={dashboardstyle.real_time_information__Weather}>
                            <h2 className={dashboardstyle.section_title}>Weather</h2>
                            <h2 className={dashboardstyle.Information}>{WeatherData}°C</h2>
                            <div className={dashboardstyle.weatherdescription}>
                                <img className={dashboardstyle.weatherimg} src={WeatherIcon} alt="Weather Icon"/>
                                <p>{Weather_Des}</p>
                            </div>
                        </div>
                    </section>
        
                    <section className={dashboardstyle.upcoming_activities}>
                        <div className={dashboardstyle.upcoming_activities__header}>
                            <h2 className={dashboardstyle.section_title}>Upcoming Activities</h2>
                            <img src={Calendericon} className={dashboardstyle.Calender_icon} alt="Calendar Icon"/>
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
                            <button className={dashboardstyle.btn_healthbuddy} onClick={() => setShowHealthbuddy(!showhealthbuddy)}>
                                <img src={Healthbuddyicon} alt="Health Buddy Icon"/>
                                <p>Health Buddy</p>
                            </button>
                        </div>

                        <Link to="/rewards" className={dashboardstyle.btn_reward}>
                            <img src={Rewardicon} alt="Rewards Icon"/>
                            <p>Claim Rewards</p>
                        </Link>
                    </div>

                    {showhealthbuddy ? 
                        <div className={dashboardstyle.Healthbuddy}>
                            <div className={dashboardstyle.Health_buddy_header}>
                                <div className={dashboardstyle.health_buddy_logo}>    
                                    <img src={Healthbuddyicon} alt="Health Buddy Logo"/>
                                    <h4>HealthBuddy</h4>
                                </div>
                                <button className={dashboardstyle.Close_Health_buddy} onClick={() => setShowHealthbuddy(false)}>X</button>
                            </div>
                            <Healthbuddy/>
                        </div> : null
                    }
                </main>
            </div>            
            <Footer/>
        </>
    );
}
