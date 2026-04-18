import { autoSellPlayer } from "../services/sell.service.js";

export const auctionTimers = {};

export const startAuctionTimer = (io, auctionId, timerEndTime) => {

  if (auctionTimers[auctionId]) {
    clearInterval(auctionTimers[auctionId]);
    delete auctionTimers[auctionId]
  }

  const endTime = new Date(timerEndTime).getTime();

  auctionTimers[auctionId] = setInterval(async () => {

    const remainingTime = Math.max(
      0,
      Math.ceil((endTime - Date.now()) / 1000)
    );

    io.to(auctionId).emit("timerUpdate", { remainingTime });

    if (remainingTime === 0) {

      clearInterval(auctionTimers[auctionId]);
      delete auctionTimers[auctionId];

     await autoSellPlayer(io, auctionId);

      return;
    }

  }, 1000);

};