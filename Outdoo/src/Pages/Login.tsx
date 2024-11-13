import loginstyle from "./css/Login.module.css"
import Hearticon from "../assets/Heart icon.png"
import { useNavigate } from "react-router-dom"
import { useState } from "react";
import axios from "axios";

export function Login(){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const login_API_URL = 'http://127.0.0.1:5000/login';
    const navigate = useNavigate();
    
    const logInUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("logInUser function called");
        console.log(email, password);
        axios.post(login_API_URL, { email, password })
    .then(response => {
        const otpToken = response.data.otp_token;
        localStorage.setItem('otp_token', otpToken);
        navigate("/verify-otp");
    })
    .catch(err => {
        if(err.status === 401){
            alert(err.response.data.message)
        }

      console.error("Error sending data:", err);
    });
    };
    
    const gotoSignup=() =>{
        navigate("/signup");
    }
    return(
        <>
            <main className={loginstyle.main_main}>
                <div className={loginstyle.login_div}>
                    <div className={loginstyle.header}>
                        <img src={Hearticon}/>
                        <h2>Outdoo</h2>
                    </div>
                    <form className={loginstyle.login_inputs} onSubmit={logInUser}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" placeholder=" Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>    
                        <label htmlFor="password">Password:</label>
                        <input type="password" placeholder=" ********" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                        <button type="submit" className={loginstyle.login_submit}>Login</button>
                    </form>
                    <button className={loginstyle.login_signup} onClick={()=>gotoSignup()}>Sign up</button>
                </div>
            </main>
        </>
    )
}