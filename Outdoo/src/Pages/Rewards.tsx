import { useState } from 'react';
import { Link } from 'react-router-dom';
import rewardsStyle from './css/Rewards.module.css';

// images from the assets folder
import watsonsImg from '../assets/watsons.png';
import acaiImg from '../assets/acai.png';
import matchaImg from '../assets/matcha.png';

export function Rewards() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClaimAllPopupVisible, setIsClaimAllPopupVisible] = useState(false);
    const [rewardInfo, setRewardInfo] = useState({ name: '', pointsRemaining: 0 });

    const claimReward = (name: string, points: number) => {
        setRewardInfo({ name: name, pointsRemaining: points });
        setIsPopupVisible(true);
    };

    const claimAllRewards = () => {
        setIsClaimAllPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setIsClaimAllPopupVisible(false);
    };

    return (
        <div className={rewardsStyle.container}>
            <header className={rewardsStyle.header}>
                <Link to="/dashboard" className={rewardsStyle.backButton}>Back</Link>
                <h1>Rewards</h1>
            </header>
            <div className={rewardsStyle.rewardsList}>
                {/* Individual Reward Items */}
                <div className={rewardsStyle.reward}>
                    <img src={watsonsImg} alt="Watsons Voucher"/>
                    <div>
                        <h2>$10 Watsons Voucher</h2>
                        <p>Collect 100 points to claim</p>
                        <button onClick={() => claimReward('Watsons Voucher', 900)}>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={acaiImg} alt="Acai Voucher"/>
                    <div>
                        <h2>Acai Voucher</h2>
                        <p>Collect 50 points to claim</p>
                        <button onClick={() => claimReward('Acai Voucher', 950)}>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={matchaImg} alt="Matcha DIY Kit"/>
                    <div>
                        <h2>Matcha DIY Kit</h2>
                        <p>Collect 200 points to claim</p>
                        <button onClick={() => claimReward('Matcha DIY Kit', 800)}>Claim</button>
                    </div>
                </div>
            </div>

            {/* Popup for claiming individual rewards */}
            {isPopupVisible && (
                <div className={rewardsStyle.popup}>
                    <p>You have successfully claimed the {rewardInfo.name}!</p>
                    <p>Remaining balance: {rewardInfo.pointsRemaining} points</p>
                    <button onClick={closePopup}>Close</button>
                </div>
            )}

            {/* Popup for claiming all rewards */}
            {isClaimAllPopupVisible && (
                <div className={rewardsStyle.popup}>
                    <p>You have successfully claimed all rewards!</p>
                    <p>Remaining balance: 650 points</p>
                    <button onClick={closePopup}>Close</button>
                </div>
            )}

            <footer>
                <button className={rewardsStyle.claimAll} onClick={claimAllRewards}>Claim All Rewards</button>
            </footer>
        </div>
    ); 
}