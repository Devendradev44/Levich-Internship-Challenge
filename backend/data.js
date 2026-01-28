const auctionItems = [
  {
    id: 1,
    title: "Vintage Rolex Submariner",
    description: "A classic luxury watch in excellent condition.",
    startingPrice: 5000,
    currentBid: 5000,
    highestBidder: null,
    endTime: Date.now() + 600000, // 10 minutes from now
    image: "/rolex.png",
  },
  {
    id: 2,
    title: "MacBook Pro M3 Max",
    description: "The latest powerhouse from Apple.",
    startingPrice: 2000,
    currentBid: 2150,
    highestBidder: "TechGuru",
    endTime: Date.now() + 300000, // 5 minutes from now
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Abstract Oil Painting",
    description: "Modern masterpiece by an emerging artist.",
    startingPrice: 800,
    currentBid: 950,
    highestBidder: "ArtLover",
    endTime: Date.now() + 900000, // 15 minutes from now
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400",
  },
];

module.exports = { auctionItems };
