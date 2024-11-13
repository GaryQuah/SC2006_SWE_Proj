import profilestyle from "./css/Profile.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import Hikingicon from "../assets/Hiking icon.png"
import Usericon from "../assets/User icon.png"
import BigUsericon from "../assets/Big User icon.png"
import {NavLink, useNavigate} from "react-router-dom"
import { AxiosError } from 'axios';

export function Profile() {
    const [email, setEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>(BigUsericon);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const profile_API_URL = 'http://127.0.0.1:5000/profile';
    const changePassword_API_URL = 'http://127.0.0.1:5000/change-password';
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(profile_API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 200) {
                const { email, name, profilePicture } = res.data;
                setEmail(email);
                setUserName(name);
                setProfilePicture(profilePicture || BigUsericon);
            }
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
    
        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const payload = {
                currentPassword,
                newPassword,
                confirmNewPassword,
            };
    
            console.log("Payload:", payload); // Debugging step
    
            const res = await axios.post(changePassword_API_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
    
            if (res.status === 200) {
                alert("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setError(null);
            } else {
                setError(res.data.message || "Failed to change password.");
            }
        } catch (err: any) {
            console.error("Error changing password:", err);
            setError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };
    
    const Logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('formdataactivity');
        localStorage.removeItem('formdatalocation');
        localStorage.removeItem('formdatatime')
    };

    const Back = () => {
        navigate("/dashboard");
    };

    return (
        <>
            <div className={profilestyle.header}>
                    <NavLink to="/profile" className={profilestyle.profile}>
                        <img src={Usericon}></img>
                    </NavLink>
                    <div className={profilestyle.menu_logo}>                        
                        <div>
                            <NavLink to="/dashboard" className={profilestyle.logo}>
                                <img src={Hikingicon}></img>
                                <h3>Outdoo</h3>
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/" className={profilestyle.profile} onClick={Logout}>
                        <h3 className={profilestyle.logout}>Logout</h3>
                    </NavLink>
                </div>
            <main className={profilestyle.main_main}>
                <button className={profilestyle.backButton} onClick={Back}>Back</button>
                <div className={profilestyle.profile_container}>
                    <h2>Profile</h2>
                    <div className={profilestyle.profile_header}>
                        <img src={profilePicture} alt="Profile" className={profilestyle.profile_img} />
                        <div>
                            <h3>Name: {userName}</h3>
                            <h3>Email: {email}</h3>
                        </div>
                    </div>
                    
                    <div className={profilestyle.change_password_section}>
                        <h4>Change Password</h4>
                        <hr />
                        <form onSubmit={handlePasswordChange} className={profilestyle.password_form}>
                            <label>Current Password:</label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <label>New Password:</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <label>Confirm New Password:</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading} className={profilestyle.submit}>
                                {loading ? "Updating..." : "Update"}
                            </button>
                            {error && <p className={profilestyle.error}>{error}</p>}
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}