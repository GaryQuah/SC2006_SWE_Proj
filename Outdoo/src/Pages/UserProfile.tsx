import signupstyle from "./css/Signup.module.css";
import Hearticon from "../assets/Heart icon.png";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Profile() {
    const [email, setEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<string>(Hearticon);
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
                setProfilePicture(profilePicture || Hearticon);
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError("Failed to load profile information.");
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

    const Back = () => {
        navigate("/dashboard");
    };

    return (
        <main className={signupstyle.main_main}>
            <button className={signupstyle.back_button} onClick={Back}>Back</button>
            <div className={signupstyle.profile_container}>
                <div className={signupstyle.profile_header}>
                    <img src={profilePicture} alt="Profile" className={signupstyle.profile_img} />
                    <h2>{userName}</h2>
                    <p>{email}</p>
                </div>
                
                <div className={signupstyle.change_password_section}>
                    <h3>Change Password</h3>
                    <hr />
                    <form onSubmit={handlePasswordChange} className={signupstyle.password_form}>
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
                        <button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                        </button>
                        {error && <p className={signupstyle.error}>{error}</p>}
                    </form>
                </div>
            </div>
        </main>
    );
}
