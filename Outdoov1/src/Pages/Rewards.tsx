import { useState } from 'react';
import { Link } from 'react-router-dom';
import rewardsStyle from './css/Rewards.module.css';
import axios from 'axios';

// Images from the assets folder
import watsonsImg from '../assets/watsons.png';
import acaiImg from '../assets/acai.png';
import matchaImg from '../assets/matcha.png';

export function Rewards({ userPoints, setUserPoints }) {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClaimAllPopupVisible, setIsClaimAllPopupVisible] = useState(false);
    const [rewardInfo, setRewardInfo] = useState({ name: '', pointsRemaining: 0 });
    const token = localStorage.getItem('token');

    // Function to update points on the backend
    const updatePoints = (points) => {
        axios.post('http://127.0.0.1:5000/update_points', { points }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setUserPoints(response.data.updatedPoints);  // Update shared points state
        })
        .catch(error => {
            console.error("Error updating points:", error);
        });
    };

    const claimReward = (name, cost) => {
        console.log(`Attempting to claim ${name} which costs ${cost} points. User has ${userPoints} points.`);
        
        if (userPoints >= cost) {
            const remainingPoints = userPoints - cost;
            setRewardInfo({ name: name, pointsRemaining: remainingPoints });
            setIsPopupVisible(true);
            updatePoints(-cost);  // Deduct points for the claimed reward
        } else {
            alert("Insufficient points to claim this reward.");
        }
    };

    const claimAllRewards = () => {
        const totalCost = 100 + 50 + 200;  // Total points needed to claim all rewards
        console.log(`Attempting to claim all rewards which cost ${totalCost} points. User has ${userPoints} points.`);
        
        if (userPoints >= totalCost) {
            const remainingPoints = userPoints - totalCost;
            setRewardInfo({ name: 'All Rewards', pointsRemaining: remainingPoints });
            setIsClaimAllPopupVisible(true);
            updatePoints(-totalCost);  // Deduct points for all rewards
        } else {
            alert("Insufficient points to claim all rewards.");
        }
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
                <p>Your Points: {userPoints}</p>
            </header>
            <div className={rewardsStyle.rewardsList}>
                {/* Individual Reward Items */}
                <div className={rewardsStyle.reward}>
                    <img src={watsonsImg} alt="Watsons Voucher"/>
                    <div>
                        <h2>$10 Watsons Voucher</h2>
                        <p>Collect 100 points to claim</p>
                        <button onClick={() => claimReward('Watsons Voucher', 100)}>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={acaiImg} alt="Acai Voucher"/>
                    <div>
                        <h2>Acai Voucher</h2>
                        <p>Collect 50 points to claim</p>
                        <button onClick={() => claimReward('Acai Voucher', 50)}>Claim</button>
                    </div>
                </div>
                <div className={rewardsStyle.reward}>
                    <img src={matchaImg} alt="Matcha DIY Kit"/>
                    <div>
                        <h2>Matcha DIY Kit</h2>
                        <p>Collect 200 points to claim</p>
                        <button onClick={() => claimReward('Matcha DIY Kit', 200)}>Claim</button>
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
                    <p>Remaining balance: {rewardInfo.pointsRemaining} points</p>
                    <button onClick={closePopup}>Close</button>
                </div>
            )}

            <footer>
                <button className={rewardsStyle.claimAll} onClick={claimAllRewards}>Claim All Rewards</button>
            </footer>
        </div>
    ); 
}
