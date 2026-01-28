const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { auctionItems } = require("./data");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// REST API: GET /
app.get("/", (req, res) => {
    res.send("Auction Backend is running! Use /items to see auction items.");
});

// REST API: GET /items
app.get("/items", (req, res) => {
    res.json(auctionItems.map(item => ({
        ...item,
        serverTime: Date.now(),
    })));
});

// Real-Time Socket Events
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("BID_PLACED", (payload) => {
        const { itemId, amount, userId } = payload;
        const item = auctionItems.find((i) => i.id === itemId);

        if (!item) {
            return socket.emit("ERROR", { message: "Item not found" });
        }

        const now = Date.now();

        // Check if auction ended
        if (now >= item.endTime) {
            return socket.emit("ERROR", { message: "Auction has already ended" });
        }

        // Race Condition Handling:
        // In a production environment with multiple server instances, 
        // we would use a distributed lock (e.g., Redis SETNX) or a database transaction.
        // For this single-instance Node.js server, JavaScript's single-threaded event loop 
        // ensures that this block of code is atomic relative to other socket events.

        if (amount <= item.currentBid) {
            return socket.emit("OUTBID", { message: "Your bid must be higher than the current bid" });
        }

        // Update the bid
        item.currentBid = amount;
        item.highestBidder = userId;

        // Broadcast the new highest bid to all connected clients instantly
        io.emit("UPDATE_BID", {
            itemId: item.id,
            currentBid: item.currentBid,
            highestBidder: item.highestBidder,
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (accessible on network)`);
});
