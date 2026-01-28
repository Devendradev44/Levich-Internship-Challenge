import React, { useState, useEffect, useRef } from "react";
import { Clock, Trophy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AuctionCard = ({ item, userId, onBid, serverTimeOffset, backendUrl }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFlashing, setIsFlashing] = useState(false);
    const prevBid = useRef(item.currentBid);

    // Sync countdown with server time offset
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now() + serverTimeOffset;
            const difference = item.endTime - now;
            setTimeLeft(Math.max(0, Math.floor(difference / 1000)));
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [item.endTime, serverTimeOffset]);

    // Flash green when bid increases
    useEffect(() => {
        if (item.currentBid > prevBid.current) {
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), 1000);
            prevBid.current = item.currentBid;
            return () => clearTimeout(timer);
        }
    }, [item.currentBid]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`;
    };

    const isHighestBidder = item.highestBidder === userId;
    const isExpired = timeLeft === 0;

    return (
        <motion.div
            layout
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <img
                src={item.image.startsWith('http') ? item.image : `${backendUrl}${item.image}`}
                alt={item.title}
                className="card-img"
            />

            <AnimatePresence>
                {isHighestBidder && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="badge badge-winning"
                    >
                        <Trophy size={14} style={{ marginRight: 4 }} /> Winning
                    </motion.div>
                )}
                {!isHighestBidder && item.highestBidder && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="badge badge-outbid"
                    >
                        Outbid
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.description}</p>

                <div className={`timer-section ${timeLeft < 60 ? "urgent" : ""}`}>
                    <Clock size={16} />
                    <span>{isExpired ? "Auction Ended" : formatTime(timeLeft)}</span>
                </div>

                <div className={`price-section ${isFlashing ? "flash-green" : ""}`}>
                    <div>
                        <div className="price-label">Current Bid</div>
                        <div className="price-value">${item.currentBid.toLocaleString()}</div>
                    </div>
                </div>

                <button
                    className="bid-button"
                    disabled={isExpired}
                    onClick={() => onBid(item.id, item.currentBid + 10)}
                >
                    {isExpired ? "Closed" : "Bid +$10"}
                </button>
            </div>
        </motion.div>
    );
};

export default AuctionCard;
