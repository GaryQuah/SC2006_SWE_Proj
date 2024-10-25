import { Link } from 'react-router-dom';
import rewardsStyle from './css/Rewards.module.css'; 
import acaipng from "../assets/acai.png";
import watsonpng from "../assets/watsons.png";
import machapng from "../assets/matcha.png";

export function Rewards() {
    return (
        <div className={rewardsStyle.container}>
            <header className={rewardsStyle.header}>
                <Link to="/dashboard" className={rewardsStyle.backButton}>Back</Link>
                <h1>Rewards</h1>
            </header>
            <div className={rewardsStyle.rewardsList}>
                <div className={rewardsStyle.reward}>
                    <img src={watsonpng} alt="Watsons Voucher"/>
                    <div>
                        <h2>$10 Watsons Voucher</h2>
                        <p>Collect 100 points to claim</p>
                        <button>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={acaipng} alt="Acai Voucher"/>
                    <div>
                        <h2>Acai Voucher</h2>
                        <p>Collect 50 points to claim</p>
                        <button>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={machapng} alt="Matcha DIY Kit"/>
                    <div>
                        <h2>Matcha DIY Kit</h2>
                        <p>Collect 200 points to claim</p>
                        <button>Claim</button>
                    </div>
                </div>
            </div>
            <footer>
                <button className={rewardsStyle.claimAll}>Claim All Rewards</button>
            </footer>
        </div>
    );
}