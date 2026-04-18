import mongoose from "mongoose";

const playerSchema = mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["batsman", "bowler", "allrounder", "wicketkeeper"],
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  sold: {
    type: Boolean,
    default: false
  },
  soldPrice: {
    type: Number,
    default: null,
    min: 0
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

const Player = mongoose.model("Player", playerSchema)

export default Player;
