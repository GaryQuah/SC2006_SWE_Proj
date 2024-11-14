import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import rewardsStyle from './css/Rewards.module.css';
import Hikingicon from "../assets/Hiking icon.png"
import watsonsImg from '../assets/watsons.png';
import acaiImg from '../assets/acai.png';
import matchaImg from '../assets/matcha.png';
import axios from 'axios';
import { AxiosError } from 'axios';
import Usericon from "../assets/User icon.png"
import {Link, NavLink, useNavigate} from "react-router-dom"

interface Reward {
    id: number;
    name: string;
    pointsRequired: number;
    image: string;
    claimed: boolean;
}

interface DataReward {
    rewardID: number;
    rewardName: string;
    rewardStatus: boolean;
}

export function Rewards() {
    const [points, setPoints] = useState<number>(200);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClaimAllPopupVisible, setIsClaimAllPopupVisible] = useState(false);
    const [isAllRewardsClaimedPopupVisible, setIsAllRewardsClaimedPopupVisible] = useState(false);
    const [rewardInfo, setRewardInfo] = useState({ name: '', pointsRemaining: 0 });
    const [showConfetti, setShowConfetti] = useState(false);
    const REWARD_API_URL = 'http://127.0.0.1:5000/rewards';
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Initial rewards data 
    const initialRewards: Reward[] = [
        { id: 1, name: '$10 Watsons Voucher', pointsRequired: 100, image: watsonsImg, claimed: false },
        { id: 2, name: 'Acai Voucher', pointsRequired: 50, image: acaiImg, claimed: false },
        { id: 3, name: 'Matcha DIY Kit', pointsRequired: 200, image: matchaImg, claimed: false },
    ];

    const [rewards, setRewards] = useState<Reward[]>(initialRewards);

    // Function to fetch points from the backend
    const getPoints = async () => {
        try {
            const response = await axios.get(REWARD_API_URL, { 
                headers: { Authorization: "Bearer " + token }
            });
    
            const data = response.data;
            console.log("points=" + data.reward);
    
            // Map over initialRewards to update the 'claimed' status based on the response data
            const updatedRewards = initialRewards.map(reward => {
                // Find the matching reward in the fetched data using reward.id
                const matchingRewardStatus = data.reward.find((d:DataReward) => d.rewardID === reward.id);
                
                // If there's a match, update the 'claimed' status
                if (matchingRewardStatus) {
                    return {
                        ...reward,
                        claimed: matchingRewardStatus.rewardStatus
                    };
                }

                return reward
            });
    
            // Update the points state
            setPoints(data.points);
            console.log(updatedRewards)
    
            // Set the updated rewards state with modified rewards
            setRewards(updatedRewards); // Set the updated rewards array
    
        } catch (error: unknown) {
            // Handle error correctly with type checking
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 401) {
                    navigate("/");  // Redirect to login page if unauthorized
                } else {
                    console.error("Error fetching dashboard data:", error.message);
                }
            } else {
                // For unexpected errors
                console.error("An unknown error occurred", error);
            }
        }
    };
    
    // Function to send updated points and rewards to the backend
    const sendPointsAndRewards = async (updatedPoints: number, updatedRewards: Reward[]) => {
        try {
            const response = await axios.post(REWARD_API_URL, { updatedPoints, updatedRewards },  {headers:{ Authorization : "Bearer " + token}})  // Replace with actual backend endpoint
            
        } catch (error) {
            console.error("Error sending updated points and rewards:", error);
        }
    };

    const claimReward = (reward: Reward) => {
        if (points >= reward.pointsRequired && !reward.claimed) {
            const newPoints = points - reward.pointsRequired;
            const updatedRewards = rewards.map((r) =>
                r.id === reward.id ? { ...r, claimed: true } : r
            );

            setPoints(newPoints);
            setRewards(updatedRewards);
            sendPointsAndRewards(newPoints, updatedRewards); // Send updated points and rewards to backend
            setRewardInfo({ name: reward.name, pointsRemaining: newPoints });
            setIsPopupVisible(true);
            setShowConfetti(true);

            if (updatedRewards.filter((r) => !r.claimed).length === 0) {
                setIsAllRewardsClaimedPopupVisible(true);
            }
        }
    };

    const claimAllRewards = () => {
        const totalPointsRequired = rewards
            .filter((reward) => !reward.claimed)
            .reduce((sum, reward) => sum + reward.pointsRequired, 0);

        if (points >= totalPointsRequired) {
            const newPoints = points - totalPointsRequired;
            const updatedRewards = rewards.map((reward) => ({ ...reward, claimed: true }));

            setPoints(newPoints);
            setRewards(updatedRewards);
            sendPointsAndRewards(newPoints, updatedRewards); // Send updated points and rewards to backend
            setIsClaimAllPopupVisible(true);
            setShowConfetti(true);
        }
    };

    const closePopup = () => {
        if (isPopupVisible) {
            setIsPopupVisible(false);
            setShowConfetti(false);
        } else if (isClaimAllPopupVisible) {
            setIsClaimAllPopupVisible(false);
            setShowConfetti(false);
            // After closing "Claim All Rewards" popup, show "Come back next week" popup if all rewards are claimed
            if (rewards.every((reward) => reward.claimed)) {
                setTimeout(() => setIsAllRewardsClaimedPopupVisible(true), 500); // Add delay
            }
        } else {
            setIsAllRewardsClaimedPopupVisible(false);
        }
    };

    const Logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('formdataactivity');
        localStorage.removeItem('formdatalocation');
        localStorage.removeItem('formdatatime')
    };

    const Back=() =>{
        navigate("/dashboard");
    };

    useEffect(()=>{        
        getPoints();
    },[])

    return (
        <>
            <div className={rewardsStyle.header}>
                <NavLink to="/profile" className={rewardsStyle.profile}>
                    <img src={Usericon}></img>
                </NavLink>
                <div className={rewardsStyle.menu_logo}>                        
                    <div>
                        <NavLink to="/dashboard" className={rewardsStyle.logo}>
                            <img src={Hikingicon}></img>
                            <h3>Outdoo</h3>
                        </NavLink>
                    </div>
                </div>
                <NavLink to="/" className={rewardsStyle.profile} onClick={Logout}>
                    <h3 className={rewardsStyle.logout}>Logout</h3>
                </NavLink>
            </div>
            
            <div className={rewardsStyle.container}>
                {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                
                <header className={rewardsStyle.header2}>
                    <button className={rewardsStyle.backButton} onClick={Back}>Back</button>
                    <div className={rewardsStyle.title}>Rewards</div>
                    <div className={rewardsStyle.pointsContainer}>
                        <div className={rewardsStyle.currentPoints}>Current Points: {points}</div>
                    </div>
                </header>

                <div className={rewardsStyle.rewardsList}>
                    {rewards.map((reward) => (
                        <div
                            key={reward.id}
                            className={`${rewardsStyle.reward} ${reward.claimed ? rewardsStyle.claimed : ''}`}
                            style={{ backgroundColor: reward.claimed ? '#d3d3d3' : '' }}
                        >
                            <img src={reward.image} alt={reward.name} />
                            <div>
                                <h2>{reward.name}</h2>
                                <p>Collect {reward.pointsRequired} points to claim</p>
                                <button
                                    onClick={() => claimReward(reward)}
                                    disabled={reward.claimed || points < reward.pointsRequired}
                                    style={{ backgroundColor: reward.claimed ? '#808080' : '' }}
                                >
                                    {reward.claimed ? 'Claimed' : 'Claim'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {isPopupVisible && (
                    <div className={rewardsStyle.popup}>
                        <p>You have successfully claimed the {rewardInfo.name}! The redemption QR codes will be sent to your email within 3 working days.</p>
                        <p>Remaining balance: {rewardInfo.pointsRemaining} points</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                )}

                {isClaimAllPopupVisible && (
                    <div className={rewardsStyle.popup}>
                        <p>You have successfully claimed all available rewards! The redemption QR codes will be sent to your email within 3 working days.</p>
                        <p>Remaining balance: {points} points</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                )}

                {isAllRewardsClaimedPopupVisible && (
                    <div className={rewardsStyle.popup}>
                        <p>Please continue to earn points and come back next week!</p>
                        <p>(New rewards refresh every Sunday at 23:59)</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                )}

                <footer>
                    <button
                        onClick={claimAllRewards}
                        className={rewardsStyle.claimAll}
                        disabled={
                            rewards.every((reward) => reward.claimed) || 
                            points < rewards.filter(reward => !reward.claimed).reduce((sum, reward) => sum + reward.pointsRequired, 0)
                        }
                        style={{
                            backgroundColor:
                                rewards.every((reward) => reward.claimed) || 
                                points < rewards.filter(reward => !reward.claimed).reduce((sum, reward) => sum + reward.pointsRequired, 0)
                                    ? '#808080' // Grey color when disabled
                                    : '#4CAF50', // Original green color when enabled
                            cursor: 
                                rewards.every((reward) => reward.claimed) || 
                                points < rewards.filter(reward => !reward.claimed).reduce((sum, reward) => sum + reward.pointsRequired, 0)
                                    ? 'not-allowed' 
                                    : 'pointer'
                        }}
                    >
                        Claim All Rewards
                    </button>
                </footer>
            </div>
        </>
    );
}