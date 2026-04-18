import mongoose from "mongoose";

const auctionRoomSchema = mongoose.Schema({
  auctionName: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["waiting", "live", "paused", "completed"],
    default: "waiting",
  },
  teams: [
    { 
      team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },
    }
  ],
  players: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
      },
      basePrice: {
        type: Number,
        required: true
      },
      category: {
        type: String,
        required: true
      },
    },
  ],
  categoryLimits: {
  batsman: { type: Number, default: 5 },
  bowler: { type: Number, default: 3 },
  allrounder: { type: Number, default: 2 },
  wicketkeeper: { type: Number, default: 1 }
},
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  playerIndex: {
    type: Number,
    default: 0
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  currentLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  timerEndTime: {
    type: Date,
    default: null,
  },
  priorityTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  priorityEndTime: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true
});

const AuctionRoom = mongoose.model("AuctionRoom", auctionRoomSchema);
export default AuctionRoom;
