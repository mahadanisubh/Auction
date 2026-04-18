import AuctionRoom from "../../../models/auctionRoom.model.js";
import Team from "../../../models/team.model.js";
import Player from "../../../models/player.model.js";
import BidHistory from "../../../models/bidHistory.model.js";
import { startAuctionTimer } from "../utils/timerManager.js";

export const placeBid = async ({ io, socket, data }) => {
  try {
    const { auctionId, bidAmount, teamId } = data;

    const auction = await AuctionRoom.findById(auctionId);
    if (!auction) {
      return socket.emit("bidError", {
        message: "Auction not Found",
      });
    }
    if (auction.status !== "live") {
      return socket.emit("bidError", {
        message: "Auction is not live",
      });
    }
    if (!auction.timerEndTime || new Date() > auction.timerEndTime) {
      return socket.emit("bidError", {
        message: "Bidding time ended",
      });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      return socket.emit("bidError", {
        message: "Team not Found",
      });
    }
    if (team.balance < bidAmount) {
      return socket.emit("bidError", {
        message: "Insufficient Balance",
      });
    }
    const isTeamInAuction = auction.teams.some(
      (t) => t.team.toString() === teamId.toString(),
    );
    if (!isTeamInAuction) {
      return socket.emit("bidError", {
        message: "Team not part of this auction",
      });
    }
    //p.w
    const now = new Date();
    if (
      auction.priorityTeam &&
      auction.priorityEndTime &&
      auction.timerEndTime
    ) {
      const pEnd = new Date(auction.priorityEndTime).getTime();
      const tEnd = new Date(auction.timerEndTime).getTime();
      const nowMs = now.getTime();

      const isFirstWindow = nowMs < pEnd;
      const isSecondWindow = nowMs >= pEnd && nowMs < tEnd;

      if (isFirstWindow) {
        if (team._id.toString() !== auction.priorityTeam.toString()) {
          return socket.emit("bidError", {
            message: "Priority window active",
          });
        }
      }
      if (isSecondWindow) {
        if (team._id.toString() === auction.priorityTeam.toString()) {
          return socket.emit("bidError", {
            message: "Wait until the next round to bid again",
          });
        }
      }
    }
    if (
      auction.currentLeader &&
      auction.currentLeader.toString() === team._id.toString()
    ) {
      return socket.emit("bidError", {
        message: "You are already the highest bidder",
      });
    }
    const player = await Player.findById(auction.currentPlayer);

    if (!player) {
      return socket.emit("bidError", { message: "Player not found" });
    }

    //addedddddddd
    const playerCategory = player.category;

    const maxAllowed = auction.categoryLimits[playerCategory];

    const currentCount = team.categoryCounts[playerCategory] || 0;

    if (currentCount >= maxAllowed) {
      return socket.emit("bidError", {
        message: `${playerCategory} category already filled for this team`,
      });
    }
    //increment ladder
    const increment = player.basePrice * 0.1;

    if (bidAmount < auction.currentBid + increment) {
      return socket.emit("bidError", {
        message: "Bid too low",
      });
    }
    const previousLeader = auction.currentLeader;

    const updatedAuction = await AuctionRoom.findOneAndUpdate(
      {
        _id: auctionId,
        currentBid: auction.currentBid,
        currentPlayer: auction.currentPlayer,
        status: "live",
      },
      {
        currentBid: bidAmount,
        currentLeader: team._id,
        timerEndTime: new Date(Date.now() + 20000),
        priorityTeam: previousLeader || null,
        priorityEndTime: previousLeader ? new Date(Date.now() + 10000) : null,
      },
      { new: true },
    );

    if (!updatedAuction) {
      return socket.emit("bidError", {
        message: "Another team already placed a higher bid",
      });
    }

    startAuctionTimer(io, auctionId, updatedAuction.timerEndTime);
    io.to(auctionId).emit("bidUpdated", {
      bidAmount,
      teamName: team.teamName,
      leaderName: team.teamName,
      leader: team._id,
      timestamp: new Date(),
      timerEndTime: updatedAuction.timerEndTime,
    });
    await BidHistory.create({
      auctionId,
      playerId: auction.currentPlayer,
      teamId,
      bidAmount,
      timestamp: new Date(),
    });
  } catch (err) {

    socket.emit("bidError", {
      message: "Server error",
    });
  }
};
