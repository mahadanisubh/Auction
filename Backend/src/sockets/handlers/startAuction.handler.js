import AuctionRoom from "../../../models/auctionRoom.model.js";
import Player from "../../../models/player.model.js";
import { startAuctionTimer } from "../utils/timerManager.js";

export const startAuction = async ({ io, socket, data }) => {

  try {

    const { auctionId } = data;
    const userId = socket.user?.id;

    const auction = await AuctionRoom
      .findById(auctionId)
      .populate("players.player");

    if (!auction) {
      return socket.emit("controlError", {
        message: "Auction not found"
      });
    }

    if (auction.createdBy.toString() !== userId?.toString()) {
      return socket.emit("controlError", {
        message: "Unauthorized"
      });
    }

    if (auction.status !== "waiting") {
      return socket.emit("controlError", {
        message: "Auction already started"
      });
    }

    const firstPlayer = auction.players[0];

    if (!firstPlayer) {
      return socket.emit("controlError", {
        message: "No players in auction"
      });
    }

    const player = firstPlayer.player;

    const basePrice = firstPlayer.basePrice;

    const timerEndTime = new Date(Date.now() + 20000);

    auction.currentPlayer = player._id;
    auction.currentBid = basePrice;
    auction.currentLeader = null;
    auction.timerEndTime = timerEndTime;
    auction.status = "live";

    await auction.save();

    // Start the timer for the auction
    startAuctionTimer(io, auctionId, timerEndTime);

    io.to(auctionId).emit("nextPlayer", {
      nextPlayer: player,
      nextBid: basePrice,
      timerEndTime
    });

  } catch (err) {
    socket.emit("controlError", {
      message: "Failed to start auction"
    });

  }
};