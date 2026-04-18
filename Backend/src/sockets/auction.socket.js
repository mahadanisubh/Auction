import { placeBid } from "./handlers/bid.handler.js";
import { pauseAuction, resumeAuction, skipPlayer, forceSell } from "./handlers/control.handler.js";
import { startAuction } from "./handlers/startAuction.handler.js";

export const auctionSocket = (io, socket) => {
  socket.on("startAuction", (data) => startAuction({io, socket, data }))
  socket.on("placeBid", (data) => placeBid({ io, socket, data }));

  socket.on("pauseAuction", (data) => pauseAuction({ io, socket, data }));

  socket.on("resumeAuction", (data) => resumeAuction({ io, socket, data }));

  socket.on("skipPlayer", (data) => skipPlayer({ io, socket, data }));

  socket.on("forceSell", (data) => forceSell({ io, socket, data })); 
};


