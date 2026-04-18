import mongoose from "mongoose";

const bidHistorySchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuctionRoom"
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },
    bidAmount: Number,
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

const BidHistory = mongoose.model("BidHistory",bidHistorySchema)

export default BidHistory;