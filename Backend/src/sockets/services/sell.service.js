import AuctionRoom from "../../../models/auctionRoom.model.js";
import Team from "../../../models/team.model.js";
import Player from "../../../models/player.model.js";
import { startAuctionTimer, auctionTimers } from "../utils/timerManager.js";

const processing = {};

export const autoSellPlayer = async (io, auctionId) => {

  if (processing[auctionId]) return;
  processing[auctionId] = true;

  try {

    const auction = await AuctionRoom.findById(auctionId);
   if (!auction) {
      processing[auctionId] = false;
      return;
    }

    let soldPlayer = null;

    // SELL PLAYER IF BID EXISTS
    if (auction.currentLeader) {

      const team = await Team.findById(auction.currentLeader);
      if (team) {

        soldPlayer = await Player.findOneAndUpdate(
          { _id: auction.currentPlayer, sold: false },
          {
            sold: true,
            assignedTeam: team._id,
            soldPrice: auction.currentBid
          },
          { new: true }
        );

        if (soldPlayer) {

          const alreadyAdded = team.players.some(
            p => p.player.toString() === soldPlayer._id.toString()
          );

          if (!alreadyAdded) {

            team.balance -= auction.currentBid;

            team.players.push({
              player: soldPlayer._id,
              price: auction.currentBid,
              category: soldPlayer.category
            });

            team.categoryCounts[soldPlayer.category] =
              (team.categoryCounts[soldPlayer.category] || 0) + 1;

            await team.save();
          }

          io.to(auctionId).emit("teamUpdated", {
            teamId: team._id,
            balance: team.balance,
            teamName: team.teamName,
            playersCount: team.players.length,
            categoryCounts: team.categoryCounts
          });

          io.to(auctionId).emit("playerSold", {
            playerName: soldPlayer.playerName,
            teamName: team.teamName,
            soldPrice: soldPlayer.soldPrice
          });
        }
      }
    }

    // MOVE TO NEXT PLAYER
    auction.playerIndex += 1;
    const nextPlayer = auction.players[auction.playerIndex];

    if (!nextPlayer) {

      auction.status = "completed";
      auction.currentPlayer = null;
      auction.currentBid = 0;
      auction.currentLeader = null;
      auction.timerEndTime = null;

      await auction.save();
      await Player.updateMany(
      { _id: { $in: auction.players.map(p => p.player) } },
      {
        sold: false,
        assignedTeam: null,
        soldPrice: null
      }
      );
      const STARTING_BALANCE = 100;
      await Team.updateMany(
      { _id: { $in: auction.teams.map(t => t.team) } },
      { $set: { balance: STARTING_BALANCE } }
      );
      io.to(auctionId).emit("auctionCompleted");

      processing[auctionId] = false;
      return;
    }

    const playerDoc = await Player.findById(nextPlayer.player);

    auction.currentPlayer = playerDoc._id;
    auction.currentBid = nextPlayer.basePrice || playerDoc.basePrice;
    auction.currentLeader = null;
    auction.timerEndTime = new Date(Date.now() + 20000);

    auction.priorityTeam = null;
    auction.priorityEndTime = null;
    await auction.save();

    io.to(auctionId).emit("nextPlayer", {
      nextPlayer: playerDoc,
      nextBid: auction.currentBid,
      timerEndTime: auction.timerEndTime
    });

    startAuctionTimer(io, auctionId, auction.timerEndTime);

  } catch (err) {
    console.log(err);
  }

  processing[auctionId] = false;
};