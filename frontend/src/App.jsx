import React, { useState, useEffect } from "react";
import AuctionCard from "./components/AuctionCard";
import { useSocket } from "./hooks/useSocket";
import { AlertCircle } from "lucide-react";

const BACKEND_URL = "https://levich-internship-challenge.onrender.com";

function App() {
  const [items, setItems] = useState([]);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [error, setError] = useState(null);
  const { socket, userId, placeBid } = useSocket();

  useEffect(() => {
    // Initial fetch
    const fetchItems = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/items`);
        const data = await response.json();

        // Calculate server time offset
        if (data.length > 0) {
          const clientNow = Date.now();
          const serverNow = data[0].serverTime;
          setServerTimeOffset(serverNow - clientNow);
        }

        setItems(data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("UPDATE_BID", (update) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === update.itemId
            ? { ...item, currentBid: update.currentBid, highestBidder: update.highestBidder }
            : item
        )
      );
    });

    socket.on("OUTBID", (msg) => {
      setError(msg.message);
      setTimeout(() => setError(null), 3000);
    });

    socket.on("ERROR", (msg) => {
      setError(msg.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off("UPDATE_BID");
      socket.off("OUTBID");
      socket.off("ERROR");
    };
  }, [socket]);

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Live Auctions
        </h1>
        <p style={{ color: '#94a3b8' }}>Compete for the best items in real-time</p>
      </header>

      <div className="dashboard">
        {items.map((item) => (
          <AuctionCard
            key={item.id}
            item={item}
            userId={userId}
            onBid={placeBid}
            serverTimeOffset={serverTimeOffset}
            backendUrl={BACKEND_URL}
          />
        ))}
      </div>

      {error && (
        <div className="error-toast">
          <AlertCircle size={20} style={{ marginRight: 8, display: 'inline' }} />
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
