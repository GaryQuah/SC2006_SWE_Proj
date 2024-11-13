import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import Healthbuddyicon from "../assets/Chatbot white Icon.png"
import addactivitystyle from "./css/AddActivities.module.css"
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import { Healthbuddy } from "../Components/Healthbuddy"
import axios from "axios"

export function AddActivities(){
    const navigate = useNavigate();
    const addactivity_API_URL = "http://127.0.0.1:5000/addactivity";
    const LOGOUT_API_URL = 'http://127.0.0.1:5000/logout'
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);
    const token = localStorage.getItem('token');
    
    const [formData, setFormData] = useState({
        activity: '',
        timestart: '-1',
        timeend: '-1',
        intensity: '',
        location: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
        const { name, value } = event.target;
        setFormData((prevFormData) =>({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent) =>{
        event.preventDefault();
        console.log("token:" + token)
        localStorage.setItem('formdataactivity', formData.activity);
        localStorage.setItem('formdatalocation', formData.location);
        localStorage.setItem('formdatatime', formData.timestart);
        const formdataactivity = localStorage.getItem('formdataactivity')
        const formdatalocation = localStorage.getItem('formdatalocation')
        const formdatatime = localStorage.getItem('formdatatime')
        console.log(formdataactivity + "/" + formdatalocation)

        axios.post(addactivity_API_URL, {formdataactivity, formdatalocation, formdatatime},  {headers:{ Authorization : "Bearer " + token}})
        .then(response => {
            console.log(response.data.activities)
            localStorage.setItem('suggestedactivity', response.data.activities);
            navigate("/map");
        })
        .catch(error => {
            console.error("Login error:", error);
        });
    };
    
    const Back=() =>{
        navigate("/dashboard");
    };

    const Logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('formdataactivity');
        localStorage.removeItem('formdatalocation');
        localStorage.removeItem('formdatatime')
    };

    return (
        <>
            <div className={addactivitystyle.main_grid}>
                <div className={addactivitystyle.header}>
                    <NavLink to="/profile" className={addactivitystyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                        <div className={addactivitystyle.menu_logo}>                        
                            <div>
                                <NavLink to="/dashboard" className={addactivitystyle.logo}>
                                    <img src={Hikingicon}></img>
                                    <h3>Outdoo</h3>
                                </NavLink>
                            </div>
                        </div>
                        <NavLink to="/" className={addactivitystyle.profile} onClick={Logout}>
                            <h3 className={addactivitystyle.logout}>Logout</h3>
                        </NavLink>
                    </div>
                <main className={addactivitystyle.main_main}>
                    <button className={addactivitystyle.back} onClick={Back}>Back</button>
                    <div className={addactivitystyle.formdiv}>
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
                                    <option value="1">00:30AM</option>
                                    <option value="2">01:00AM</option>
                                    <option value="3">01:30AM</option>
                                    <option value="4">02:00AM</option>
                                    <option value="5">02:30AM</option>
                                    <option value="6">03:00AM</option>
                                    <option value="7">03:30AM</option>
                                    <option value="8">04:00AM</option>
                                    <option value="9">04:30AM</option>
                                    <option value="10">05:00AM</option>
                                    <option value="11">05:30AM</option>
                                    <option value="12">06:00AM</option>
                                    <option value="13">06:30AM</option>
                                    <option value="14">07:00AM</option>
                                    <option value="15">07:30AM</option>
                                    <option value="16">08:00AM</option>
                                    <option value="17">08:30AM</option>
                                    <option value="18">09:00AM</option>
                                    <option value="19">09:30AM</option>
                                    <option value="20">10:00AM</option>
                                    <option value="21">10:30AM</option>
                                    <option value="22">11:00AM</option>
                                    <option value="23">11:30AM</option>
                                    <option value="24">12:00PM</option>
                                    <option value="25">12:30PM</option>
                                    <option value="26">01:00PM</option>
                                    <option value="27">01:30PM</option>
                                    <option value="28">02:00PM</option>
                                    <option value="29">02:30PM</option>
                                    <option value="30">03:00PM</option>
                                    <option value="31">03:30PM</option>
                                    <option value="32">04:00PM</option>
                                    <option value="33">04:30PM</option>
                                    <option value="34">05:00PM</option>
                                    <option value="35">05:30PM</option>
                                    <option value="36">06:00PM</option>
                                    <option value="37">06:30PM</option>
                                    <option value="38">07:00PM</option>
                                    <option value="39">07:30PM</option>
                                    <option value="40">08:00PM</option>
                                    <option value="41">08:30PM</option>
                                    <option value="42">09:00PM</option>
                                    <option value="43">09:30PM</option>
                                    <option value="44">10:00PM</option>
                                    <option value="45">10:30PM</option>
                                    <option value="46">11:00PM</option>
                                    <option value="47">11:30PM</option>
                                </select>
                                <p>to</p>
                                <select className={addactivitystyle.timeend_select} name="timeend" id="timeend" value={formData.timeend} onChange={handleInputChange}>
                                    <option value="-1">Optional</option>
                                    <option value="0">00:00AM</option>
                                    <option value="1">00:30AM</option>
                                    <option value="2">01:00AM</option>
                                    <option value="3">01:30AM</option>
                                    <option value="4">02:00AM</option>
                                    <option value="5">02:30AM</option>
                                    <option value="6">03:00AM</option>
                                    <option value="7">03:30AM</option>
                                    <option value="8">04:00AM</option>
                                    <option value="9">04:30AM</option>
                                    <option value="10">05:00AM</option>
                                    <option value="11">05:30AM</option>
                                    <option value="12">06:00AM</option>
                                    <option value="13">06:30AM</option>
                                    <option value="14">07:00AM</option>
                                    <option value="15">07:30AM</option>
                                    <option value="16">08:00AM</option>
                                    <option value="17">08:30AM</option>
                                    <option value="18">09:00AM</option>
                                    <option value="19">09:30AM</option>
                                    <option value="20">10:00AM</option>
                                    <option value="21">10:30AM</option>
                                    <option value="22">11:00AM</option>
                                    <option value="23">11:30AM</option>
                                    <option value="24">12:00PM</option>
                                    <option value="25">12:30PM</option>
                                    <option value="26">01:00PM</option>
                                    <option value="27">01:30PM</option>
                                    <option value="28">02:00PM</option>
                                    <option value="29">02:30PM</option>
                                    <option value="30">03:00PM</option>
                                    <option value="31">03:30PM</option>
                                    <option value="32">04:00PM</option>
                                    <option value="33">04:30PM</option>
                                    <option value="34">05:00PM</option>
                                    <option value="35">05:30PM</option>
                                    <option value="36">06:00PM</option>
                                    <option value="37">06:30PM</option>
                                    <option value="38">07:00PM</option>
                                    <option value="39">07:30PM</option>
                                    <option value="40">08:00PM</option>
                                    <option value="41">08:30PM</option>
                                    <option value="42">09:00PM</option>
                                    <option value="43">09:30PM</option>
                                    <option value="44">10:00PM</option>
                                    <option value="45">10:30PM</option>
                                    <option value="46">11:00PM</option>
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

                        {showhealthbuddy? 
                            <div className={addactivitystyle.Healthbuddy}>
                                <div className={addactivitystyle.Health_buddy_header}>
                                    <div className={addactivitystyle.health_buddy_logo}>    
                                        <img src={Healthbuddyicon}/>
                                        <h4>HealthBuddy</h4>
                                    </div>
                                    <button className={addactivitystyle.Close_Health_buddy} onClick={()=> setShowHealthbuddy(false)}>X</button>
                                </div>
                                <Healthbuddy/>
                            </div>:null
                        }

                        <button className={addactivitystyle.btn_healthbuddy} onClick={()=>setShowHealthbuddy(!showhealthbuddy)}>
                            <img src={Healthbuddyicon}></img>
                            <p>Health Buddy</p>
                        </button>
                    </div>
                </main>
            </div>
        </>
    )
}