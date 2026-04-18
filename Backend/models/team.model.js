import mongoose from "mongoose";
import AuctionRoom from "./auctionRoom.model.js";

const teamSchema = mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuctionRoom",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  initialBalance: {
    type: Number,
    required: true
  },
  players: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      price: {
        type: Number,
      },
      category: {
        type: String,
      },
    },
  ],
  categoryCounts: {
    batsman: { type: Number, default: 0 },
    bowler: { type: Number, default: 0 },
    allrounder: { type: Number, default: 0 },
    wicketkeeper: { type: Number, default: 0 },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Team = mongoose.model("Team", teamSchema)

export default Team;
