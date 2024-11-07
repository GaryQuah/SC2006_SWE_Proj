import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Footer } from "../Components/Footer";
import Healthbuddyicon from "../assets/Chatbot white Icon.png";
import addactivitystyle from "./css/AddActivities.module.css";
import Hikingicon from "../assets/Hiking icon.png";
import Usericon from "../assets/User icon.png";
import { Healthbuddy } from "../Components/Healthbuddy";
import axios from "axios";

export function AddActivities() {
    const navigate = useNavigate();
    const addactivity_API_URL = "http://127.0.0.1:5000/addactivity";
    const updatePoints_API_URL = "http://127.0.0.1:5000/update_points"; // Define the URL for updating points
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        activity: '',
        timestart: '-1',
        timeend: '-1',
        intensity: '',
        location: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    // Function to update points on the backend
    const updatePoints = (points: number) => {
        axios.post(updatePoints_API_URL, { points }, {
            headers: { Authorization: "Bearer " + token }
        })
        .then(response => {
            console.log("Points updated:", response.data.updatedPoints);
        })
        .catch(error => {
            console.error("Error updating points:", error);
        });
    };

    // Submit handler for the "Plan Activity" button
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("token:" + token);

        localStorage.setItem('formdataactivity', formData.activity);
        localStorage.setItem('formdatalocation', formData.location);
        const formdataactivity = localStorage.getItem('formdataactivity');
        const formdatalocation = localStorage.getItem('formdatalocation');
        console.log(formdataactivity + "/" + formdatalocation);

        axios.post(addactivity_API_URL, { formdataactivity, formdatalocation }, { headers: { Authorization: "Bearer " + token } })
        .then(response => {
            updatePoints(100);  // Add 100 points when the activity is planned
            navigate("/map");
        })
        .catch(error => {
            console.error("Login error:", error);
        });
    };

    return (
        <>
            <div className={addactivitystyle.main_grid}>
                <div className={addactivitystyle.header}>
                    <div className={addactivitystyle.menu_logo}>
                        <div>
                            <NavLink to="/dashboard" className={addactivitystyle.logo}>
                                <img src={Hikingicon}></img>
                                <h4>Outdoo</h4>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/profile" className={addactivitystyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                </div>
                <main className={addactivitystyle.main_main}>
                    <h1 className={addactivitystyle.heading}>What would you like to do?</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={addactivitystyle.activity_input}>
                            <label htmlFor="activity">Activity Type:</label>
                            <input placeholder=" e.g. Running" type="text" id="activity" name="activity" value={formData.activity} onChange={handleInputChange}></input>
                        </div>

                        <div className={addactivitystyle.time_input}>
                            <label className={addactivitystyle.time_head} htmlFor="timestart">Time:</label>
                            <select className={addactivitystyle.timestart_select} name="timestart" id="timestart" value={formData.timestart} onChange={handleInputChange}>
                                <option value="-1">Now</option>
                                <option value="0">00:00AM</option>
                                {/* ... other options ... */}
                                <option value="47">11:30PM</option>
                            </select>
                            <p>to</p>
                            <select className={addactivitystyle.timeend_select} name="timeend" id="timeend" value={formData.timeend} onChange={handleInputChange}>
                                <option value="-1">Optional</option>
                                <option value="0">00:00AM</option>
                                {/* ... other options ... */}
                                <option value="47">11:30PM</option>
                            </select>
                        </div>

                        <div className={addactivitystyle.intensity_input}>                        
                            <label className={addactivitystyle.intensity_head} htmlFor="high">Intensity Level:</label>
                            <br/>
                            <div className={addactivitystyle.intensity_level}>
                                <div>
                                    <input type="radio" id="high" name="intensity" value="high" onChange={handleInputChange} checked={formData.intensity === "high"}></input>
                                    <label htmlFor="high">High</label>
                                </div>
                                <div>
                                    <input type="radio" id="medium" name="intensity" value="medium" onChange={handleInputChange} checked={formData.intensity === "medium"}></input>
                                    <label htmlFor="medium">Medium</label>
                                </div>
                                <div>
                                    <input type="radio" id="low" name="intensity" value="low" onChange={handleInputChange} checked={formData.intensity === "low"}></input>
                                    <label htmlFor="low">Low</label>
                                </div>                            
                            </div>                        
                        </div>

                        <div className={addactivitystyle.location_input}>
                            <label htmlFor="location">Location:</label>
                            <br/>
                            <input placeholder=" Postal code:" type="text" id="location" name="location" value={formData.location} onChange={handleInputChange}></input>
                        </div>

                        <button className={addactivitystyle.plan_activity} type="submit">Plan Activity</button>
                    </form>

                    {showhealthbuddy ? 
                        <div className={addactivitystyle.Healthbuddy}>
                            <div className={addactivitystyle.Health_buddy_header}>
                                <div className={addactivitystyle.health_buddy_logo}>    
                                    <img src={Healthbuddyicon}/>
                                    <h4>HealthBuddy</h4>
                                </div>
                                <button className={addactivitystyle.Close_Health_buddy} onClick={() => setShowHealthbuddy(false)}>X</button>
                            </div>
                            <Healthbuddy/>
                        </div> : null
                    }

                    <button className={addactivitystyle.btn_healthbuddy} onClick={() => setShowHealthbuddy(!showhealthbuddy)}>
                        <img src={Healthbuddyicon}></img>
                        <p>Health Buddy</p>
                    </button>
                </main>
            </div>
            <Footer/>
        </>
    )
}
