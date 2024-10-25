import { NavLink } from "react-router-dom"
import { useState } from "react"
import { Footer } from "../Components/Footer"
import Healthbuddyicon from "../assets/Chatbot white Icon.png"
import addactivitystyle from "./css/AddActivities.module.css"
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import { Healthbuddy } from "../Components/Healthbuddy"

export function AddActivities(){
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

        const postData = new FormData();
        postData.append('activity', formData.activity);
        postData.append('timestart', formData.timestart);
        postData.append('timeend', formData.timeend);
        postData.append('intensity', formData.intensity);
        postData.append('location', formData.location);

        fetch('http://127.0.0.1:8080/test',{
            method: "POST",
            body: postData,
        })
        .then((Response)=> Response.json())
        .then((data)=>{
            console.log(data)
        })
        .catch((err)=>{
            console.log(err)
        })
    }
    
    
    const [showhealthbuddy, setShowHealthbuddy] = useState(false);

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
                            <select className={addactivitystyle.location_select} name="location" id="location" value={formData.location} onChange={handleInputChange}>                        
                                <option value="EMPTY">Select Location</option>
                                <option value="Ang Mo Kio">Ang Mo Kio</option>
                                <option value="Bedok">Bedok</option>
                                <option value="Bishan">Bishan</option>
                                <option value="Boon Lay">Boon Lay</option>
                                <option value="Bukit Batok">Bukit Batok</option>
                                <option value="Bukit Merah">Bukit Merah</option>
                                <option value="Bukit Panjang">Bukit Panjang</option>
                                <option value="Bukit Timah">Bukit Timah</option>
                                <option value="Central Water Catchment">Central Water Catchment</option>
                                <option value="Changi">Changi</option>
                                <option value="Changi Bay">Changi Bay</option>
                                <option value="Choa Chu Kang">Choa Chu Kang</option>
                                <option value="Clementi">Clementi</option>
                                <option value="Downtown">Downtown</option>
                                <option value="Geylang">Geylang</option>
                                <option value="Hougang">Hougang</option>
                                <option value="Jurong East">Jurong East</option>
                                <option value="Jurong West">Jurong West</option>
                                <option value="Kallang">Kallang</option>
                                <option value="Lim Chu Kang">Lim Chu Kang</option>
                                <option value="Mandai">Mandai</option>
                                <option value="Marina East">Marina East</option>
                                <option value="Marina South">Marina South</option>
                                <option value="Marine Parade">Marine Parade</option>
                                <option value="Newton">Newton</option>
                                <option value="North-Eastern Islands">North-Eastern Islands</option>
                                <option value="Novena">Novena</option>
                                <option value="Orchard">Orchard</option>
                                <option value="Outram">Outram</option>
                                <option value="Pasir Ris">Pasir Ris</option>
                                <option value="Paya Lebar">Paya Lebar</option>
                                <option value="Pioneer">Pioneer</option>
                                <option value="Punggol">Punggol</option>
                                <option value="Queenstown">Queenstown</option>
                                <option value="River Valley">River Valley</option>
                                <option value="Rocher">Rocher</option>
                                <option value="Seletar">Seletar</option>
                                <option value="Sembawang">Sembawang</option>
                                <option value="Sengkang">Sengkang</option>
                                <option value="Serangoon">Serangoon</option>
                                <option value="Simpang">Simpang</option>
                                <option value="Singapore River">Singapore River</option>
                                <option value="Southern Islands">Southern Islands</option>
                                <option value="Straits View">Straits View</option>
                                <option value="Sungei Kadut">Sungei Kadut</option>
                                <option value="Tampines">Tampines</option>
                                <option value="Tanglin">Tanglin</option>
                                <option value="Tengah">Tengah</option>
                                <option value="Toa Payoh">Toa Payoh</option>
                                <option value="Tuas">Tuas</option>
                                <option value="Western Islands">Western Islands</option>
                                <option value="Western Water Catchment">Western Water Catchment</option>
                                <option value="Woodlands">Woodlands</option>
                                <option value="Yishun">Yishun</option>
                            </select>
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
                </main>
            </div>
            <Footer/>
        </>
    )
}