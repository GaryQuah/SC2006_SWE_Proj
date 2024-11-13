import loginstyle from "./css/Login.module.css";
import Hearticon from "../assets/Heart icon.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function OTP() {
    const [otp, setOtp] = useState<string>("");
    const otp_API_URL = 'http://127.0.0.1:5000/verify-otp';
    const navigate = useNavigate();

    const otpToken = localStorage.getItem('otp_token');

    const verifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("OTP verification function called");

        // Send OTP verification request with OTP token in the Authorization header
        axios.post(
            otp_API_URL, 
            { otp },  // Only the OTP is needed in the body
            {
                headers: {
                    Authorization: `Bearer ${otpToken}`,  // Include OTP token in the headers
                },
            }
        )
        .then(response => {
            console.log("OTP verification successful", response.data);

            // Extract the final token for authenticated sessions
            const token = response.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('justLoggedIn', 'true');  // Set flag for first login

            localStorage.removeItem('otp_token');

            navigate("/dashboard");
        })
        .catch(err => {
            if (err.response && err.response.status === 401) {
                alert("Invalid OTP or session expired");
            } else {
                console.error("Error verifying OTP:", err);
            }
        });
    };

    return (
        <main className={loginstyle.main_main}>
            <div className={loginstyle.login_div}>
                <div className={loginstyle.header}>
                    <img src={Hearticon} alt="Heart Icon" />
                    <h2>Outdoo</h2>
                </div>
                <form className={loginstyle.login_inputs} onSubmit={verifyOtp}>
                    <label htmlFor="otp">Enter OTP:</label>
                    <input 
                        type="text" 
                        placeholder="OTP" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        required 
                    />
                    <button type="submit" className={loginstyle.login_submit}>Verify OTP</button>
                </form>
            </div>
        </main>
    );
}
