import { useEffect, useState } from "react"
import loginstyle from "./css/Login.module.css"
import Hearticon from "../assets/Heart icon.png"

export function Login(){

    return(
        <>
            <main className={loginstyle.main_main}>
                <div className={loginstyle.login_div}>
                    <div className={loginstyle.header}>
                        <img src={Hearticon}/>
                        <h2>Outdoo</h2>
                    </div>
                    <form className={loginstyle.login_inputs}>
                        <input type="email" name="email" placeholder="Email" id="email" required/>
                        <input type="password" name="password" id="password" placeholder="*******" required/>
                        <button>Login</button>
                    </form>
                </div>
            </main>
        </>
    )
}