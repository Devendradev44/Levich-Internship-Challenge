import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://levich-internship-challenge.onrender.com";

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const userId = useRef(localStorage.getItem("bid_user_id") || `user_${Math.random().toString(36).substring(2, 9)}`);

    useEffect(() => {
        if (!localStorage.getItem("bid_user_id")) {
            localStorage.setItem("bid_user_id", userId.current);
        }

        const s = io(SOCKET_URL);

        s.on("connect", () => {
            setIsConnected(true);
            console.log("Connected to socket server");
        });

        s.on("disconnect", () => {
            setIsConnected(false);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    const placeBid = (itemId, amount) => {
        if (socket) {
            socket.emit("BID_PLACED", {
                itemId,
                amount,
                userId: userId.current,
            });
        }
    };

    return { socket, isConnected, placeBid, userId: userId.current };
};
