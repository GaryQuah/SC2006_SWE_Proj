import signupstyle from "./css/Signup.module.css"
import Hearticon from "../assets/Heart icon.png"
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Signup(){
    const [email, setEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmpassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null); // Track errors if any
    const [loading, setLoading] = useState<boolean>(false);
    const [processedData, setProcessedData] = useState<any>(null); // Adjust type as needed
    const signup_API_URL = 'http://127.0.0.1:5000/sign-up';
    const navigate = useNavigate();
   
    const Back=() =>{
      navigate("/");
    };

    const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
          const payload = {
            email,
            userName,
            password,
            confirmpassword
          };
    
          console.log("Sending data to Flask:", payload);
    
          const res = await axios.post(signup_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
          });
          
          //const result = await res.json();
          console.log("Response from Flask:", res.data);
          setProcessedData(res.data.data);  // Store processed data in state
          setError(null);  // Clear any previous errors
          if(res.status === 200){
            navigate("/");
          }
        } catch (err: any) {
          if(err.status === 401){
                alert(err.response.data.message)
            }

          console.error("Error sending data:", err);
          setError(err.response.data.message);
        } finally{
          setLoading(false);
        }
    };

    return(
        <>
            <main className={signupstyle.main_main}>
              <button className={signupstyle.login_back} onClick={Back}>Back</button>
                <div className={signupstyle.login_div}>
                    <div className={signupstyle.header}>
                        <img src={Hearticon}/>
                        <h2>Outdoo</h2>
                    </div>
                    <form onSubmit={signUp} className={signupstyle.login_inputs}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" placeholder=" Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>  
                        <label htmlFor="email">Name:</label>
                        <input type="text" placeholder=" Name" value={userName} onChange={(e) => setUserName(e.target.value)} required/>   
                        <label htmlFor="password">Password:</label>
                        <input type="password" placeholder=" ********" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                        <label htmlFor="confirmpassword">Confirm Password:</label>
                        <input type="password" placeholder=" ********" value={confirmpassword} onChange={(e) => setConfirmPassword(e.target.value)}required/>
                        <button type="submit" className={signupstyle.login_submit} disabled={loading}>{loading? 'Singing Up...':'Sign Up'}</button>
                  
                        {error && <p className={signupstyle.error}>{error}</p>} {/* Show error message if exists */}
                    </form>
                </div>
            </main>
        </>
    );
}