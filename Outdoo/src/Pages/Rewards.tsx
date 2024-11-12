import { useState } from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import rewardsStyle from './css/Rewards.module.css';

import watsonsImg from '../assets/watsons.png';
import acaiImg from '../assets/acai.png';
import matchaImg from '../assets/matcha.png';

interface Reward {
    id: number;
    name: string;
    pointsRequired: number;
    image: string;
    claimed: boolean;
}

export function Rewards() {
    const [points, setPoints] = useState<number>(200);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isClaimAllPopupVisible, setIsClaimAllPopupVisible] = useState(false);
    const [isAllRewardsClaimedPopupVisible, setIsAllRewardsClaimedPopupVisible] = useState(false);
    const [rewardInfo, setRewardInfo] = useState({ name: '', pointsRemaining: 0 });
    const [showConfetti, setShowConfetti] = useState(false);

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
            const response = await fetch('/api/user/points');  // Replace with actual backend endpoint

            const data = await response.json();
            setPoints(data.points);
            setRewards(data.rewards || initialRewards); // Set fetched rewards if available

        } catch (error) {
            console.error("Error fetching points:", error);
        }
    };

    // Function to send updated points and rewards to the backend
    const sendPointsAndRewards = async (updatedPoints: number, updatedRewards: Reward[]) => {
        try {
            await fetch('/api/user/points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ points: updatedPoints, rewards: updatedRewards }),
            });
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

    return (
        <div className={rewardsStyle.container}>
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            
            <header className={rewardsStyle.header}>
                <Link to="/dashboard" className={rewardsStyle.backButton}>Back</Link>
                <div className={rewardsStyle.title}>Rewards</div>
                <div className={rewardsStyle.pointsContainer}>
                    <div className={rewardsStyle.currentPoints}>Current Points: {points}</div>
                    <button className={rewardsStyle.refreshButton} onClick={getPoints}>Refresh Points</button>
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
                    <p>You have successfully claimed the {rewardInfo.name}!</p>
                    <p>Remaining balance: {rewardInfo.pointsRemaining} points</p>
                    <button onClick={closePopup}>Close</button>
                </div>
            )}

            {isClaimAllPopupVisible && (
                <div className={rewardsStyle.popup}>
                    <p>You have successfully claimed all available rewards!</p>
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
    );
}
