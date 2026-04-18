import AuctionRoom from "../../../models/auctionRoom.model.js";
import Player from "../../../models/player.model.js";
import { startAuctionTimer, auctionTimers } from "../utils/timerManager.js";
import { autoSellPlayer } from "../services/sell.service.js";

 //pause auction
  export const pauseAuction = async ({ io, socket, data}) =>{
    try{
    const {auctionId} = data;
    const userId = socket.user?.id;
    const auction = await AuctionRoom.findById(auctionId);

    if(!auction) return;
    
    console.log("Pause - userId:", userId, "createdBy:", auction.createdBy);
    
    if(auction.createdBy.toString() !== userId?.toString()){
      return socket.emit("controlError", {
        message: "Unauthorized"
      })
    }
    if (auction.status !== "live") {
    return socket.emit("controlError", { message: "Auction not live" });
  }
  auction.status = "paused";
  await auction.save();

  if(auctionTimers[auctionId]){
    clearInterval(auctionTimers[auctionId]);
    delete auctionTimers[auctionId];
  }
  io.to(auctionId).emit("auctionPaused");
} catch (err){
  socket.emit("controlError", {message: "Server Error"})
}
  };
  //resume auction
    export const resumeAuction =  async({io, socket, data })=>{
      try{
     const {auctionId} = data;
     const userId = socket.user?.id;   
    const auction = await AuctionRoom.findById(auctionId);

  if (!auction) return;

  console.log("Resume - userId:", userId, "createdBy:", auction.createdBy);
  
  if (auction.createdBy.toString() !== userId?.toString()) {
    return socket.emit("controlError", { message: "Unauthorized" });
  }

  if (auction.status !== "paused") {
    return socket.emit("controlError", { message: "Auction not paused" });
  }

  auction.status = "live";
  auction.timerEndTime = new Date(Date.now() + 20000);
  auction.priorityTeam = null;
auction.priorityEndTime = null;

  await auction.save();

  startAuctionTimer(io, auctionId, auction.timerEndTime);

  io.to(auctionId).emit("auctionResumed", {
    timerEndTime: auction.timerEndTime
  });
}catch (err){
  socket.emit("controlError", {message: "Server Error"})
}
  }
  //skip player
 export const skipPlayer = async ({ io, socket, data }) => {
  try {

    const { auctionId } = data;
    const userId = socket.user?.id;

    const auction = await AuctionRoom.findById(auctionId);

    if (!auction) return;

    // Only organizer can skip
    if (auction.createdBy.toString() !== userId?.toString()) {
      return socket.emit("controlError", {
        message: "Unauthorized"
      });
    }

    // Stop existing timer
    if (auctionTimers[auctionId]) {
      clearInterval(auctionTimers[auctionId]);
      delete auctionTimers[auctionId];
    }

    const skippedPlayer = auction.currentPlayer;

    // Move to next player
    auction.playerIndex += 1;

    const nextPlayerData = auction.players[auction.playerIndex];

    // Auction finished
    if (!nextPlayerData) {

      auction.status = "completed";
      auction.currentPlayer = null;
      auction.currentBid = 0;
      auction.currentLeader = null;
      auction.timerEndTime = null;

      await auction.save();

      io.to(auctionId).emit("auctionCompleted");

      return;
    }

    const playerDoc = await Player.findById(nextPlayerData.player);

    const nextBid = nextPlayerData.basePrice || playerDoc.basePrice;

    const timerEndTime = new Date(Date.now() + 20000);

    // Reset auction state
    auction.currentPlayer = playerDoc._id;
    auction.currentBid = nextBid;
    auction.currentLeader = null;
    auction.priorityTeam = null;
    auction.priorityEndTime = null;
    auction.timerEndTime = timerEndTime;

    await auction.save();

    // Notify clients that player was skipped
    io.to(auctionId).emit("playerSkipped", {
      skippedPlayer
    });

    // Start timer for next player
    startAuctionTimer(io, auctionId, timerEndTime);

    io.to(auctionId).emit("nextPlayer", {
      nextPlayer: playerDoc,
      nextBid,
      timerEndTime
    });

  } catch (err) {

    console.log(err);

    socket.emit("controlError", {
      message: "Server Error"
    });

  }
};

//force sell
  export const forceSell = async ({ io, socket, data }) => {
    try{
    const {auctionId} = data;
    const userId = socket.user?.id;

  const auction = await AuctionRoom.findById(auctionId);

  if (!auction) return;

  console.log("ForceSell - userId:", userId, "createdBy:", auction.createdBy);
  
  if (auction.createdBy.toString() !== userId?.toString()) {
    return socket.emit("controlError", { message: "Unauthorized" });
  }

  if (!auction.currentLeader) {
    return socket.emit("controlError", {
      message: "No bids placed"
    });
  }

  if (auctionTimers[auctionId]) {
    clearInterval(auctionTimers[auctionId]);
    delete auctionTimers[auctionId];
  }

  await autoSellPlayer(io, auctionId);
}
catch(err){
   socket.emit("controlError", {message: "Server Error"})
}
};