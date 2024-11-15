import Calendericon from "../assets/Calender icon.png"
import Healthbuddyicon from "../assets/Chatbot white Icon.png"
import Rewardicon from "../assets/Hand Reward icon.png"
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import {Link, NavLink, useNavigate} from "react-router-dom"
import dashboardstyle from "./css/Dashboard.module.css"
import axios from "axios"
import { AxiosError } from 'axios';
import { useEffect, useState } from "react"
import { Healthbuddy } from "../Components/Healthbuddy"

export function Dashboard(){
    const DATA_API_URL = 'http://127.0.0.1:5000/dashboard';
    const DELETEACTIVITY_API_URL = 'http://127.0.0.1:5000/delete-activity';
    const UPDATEPOINTS_API_URL = 'http://127.0.0.1:5000/updatepoints';
    const [UVData, setUVData] = useState('Loading...');
    const [WeatherData, setWeatherData] = useState('Loading...');
    const [Weather_Des, setWeatherDes] = useState([]);
    const [UV_Des, setUVDes] = useState([]);
    const [UserPoints, setUserPoints] = useState('Loading...');
    const [UserActivities, setActivities] = useState([]);
    const [WeatherIcon, setWeatherIcon] = useState(String);
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);
    const [showLoginNotification, setShowLoginNotification] = useState(false);  // State for notification
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const getData = async () => {
        try {
            if (localStorage.getItem('justLoggedIn') === 'true') {
                const pointsres = await axios.get(UPDATEPOINTS_API_URL, { 
                    headers: { Authorization: "Bearer " + token }
                });
                console.log(pointsres.data.points)
                const updatedPoints = 400 + parseInt(pointsres.data.points, 10);  // Calculate updated points
                console.log("updated points= "+updatedPoints)
                updatePoints(updatedPoints);  // Wait for the points to be updated
                setShowLoginNotification(true);  // Show notification after points are updated
                localStorage.removeItem('justLoggedIn');  // Remove the flag to prevent re-adding points on future loads
            }
            
            // Use await to handle the promise returned by axios.get
            const response = await axios.get(DATA_API_URL, { 
                headers: { Authorization: "Bearer " + token }
            });
    
            // Update state with the fetched data
            setUVData(response.data.uv_index);
            setWeatherData(response.data.temperature + '°C');
            setWeatherDes(response.data.weather_description);
            setWeatherIcon("https://openweathermap.org/img/wn/" + response.data.weather_icon + "@2x.png");
            setUVDes(response.data.uv_description);
            setActivities(response.data.activities);
            setUserPoints(response.data.points);
    
            // Check if the user just logged in    
        } catch (error: unknown) {
            // Type assertion to Error
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 401) {
                    navigate("/");  // Redirect to login page if unauthorized
                } else {
                    console.error("Error fetching dashboard data:", error.message);
                }
            } else {
                // Handle case where error is not an instance of Error (shouldn't typically happen)
                console.error("An unknown error occurred", error);
            }
        }
    };

    const Deleteactivity = (activityID:String) =>{
        axios.post(DELETEACTIVITY_API_URL, {activityID}, {headers:{ Authorization : "Bearer " + token}})
        .then(response=>{
            getData();
        }).catch(error=>{
            console.error("Error", error);
        })
    }

    const Logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('formdataactivity');
        localStorage.removeItem('formdatalocation');
        localStorage.removeItem('formdatatime')
    };

    const updatePoints = async (points:number) => {
        axios.post(UPDATEPOINTS_API_URL, { points }, {
            headers: { Authorization: "Bearer " + token }
        })
        .then(response => {
        })
        .catch(error => {
            console.error("Error updating points:", error);
        });
    };
    
    useEffect(()=>{        
        getData();
    },[])

    // Close notification handler
    const closeNotification = () => setShowLoginNotification(false);

    return(
        <>
            {showLoginNotification && (
                <div className={dashboardstyle.notificationOverlay}>
                    <div>
                        <h3>🎉 Congrats on Logging In!</h3>
                        <p>You've gained 400 points. Keep it up!</p>
                    </div>
                    <button className={dashboardstyle.closeNotification} onClick={closeNotification}>&times;</button>
                </div>
            )}

            <div className={dashboardstyle.main_grid}>
                <div className={dashboardstyle.header}>
                    <NavLink to="/profile" className={dashboardstyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                    <div className={dashboardstyle.menu_logo}>                        
                        <div>
                            <NavLink to="/dashboard" className={dashboardstyle.logo}>
                                <img src={Hikingicon}></img>
                                <h3>Outdoo</h3>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/" className={dashboardstyle.profile} onClick={Logout}>
                        <h3 className={dashboardstyle.logout}>Logout</h3>
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
                            <h2 className={dashboardstyle.Information}>{WeatherData}</h2>
                            <div className={dashboardstyle.weatherdescription}>
                                {WeatherIcon? <img className={dashboardstyle.weatherimg} src={WeatherIcon}/>:null}
                                <p>{Weather_Des}</p>
                            </div>
                        </div>
                    </section>
        
                    <section className={dashboardstyle.upcoming_activities}>
                        <div className={dashboardstyle.upcoming_activities__header}>
                            <h2 className={dashboardstyle.section_title}>Upcoming Activities</h2>
                            <img src={Calendericon} className={dashboardstyle.Calender_icon}></img>
                        </div>
                        
                        <div className={dashboardstyle.activity_log}>
                            <div className={dashboardstyle.activities}><p>Activity</p><p>Location</p><p>Time</p></div>
                            {UserActivities.map(({activityID,activityName,activityTime,activityLocation}) => 
                                <div className={dashboardstyle.activities}><p>{activityName}</p><p>{activityLocation}</p><p>{activityTime}</p><button onClick={()=>Deleteactivity(activityID)}>x</button></div>
                                )}
                        </div>
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
        </>
    )
}