import { Server } from "socket.io";
import { auctionSocket } from "./auction.socket.js";
import { socketAuth } from "./middlewares/socketAuth.mw.js";
import AuctionRoom from "../../models/auctionRoom.model.js";
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  io.use(socketAuth);
  io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    socket.on("joinAuction", async (auctionId) =>{
        if(!auctionId) return;
        socket.join(auctionId);
        console.log(`Socket ${socket.id} joined auction ${auctionId}`);
        const auction = await AuctionRoom.findById(auctionId)
        .populate("currentPlayer")
        .populate("currentLeader");
        socket.emit("auctionState",auction)
    });

    socket.on("rejoinAuction", (auctionId) => {
    socket.join(auctionId);
    });

    auctionSocket(io, socket);

    socket.on("disconnect", () => {
      socket.removeAllListeners();
      console.log("Client disconnected:", socket.id);
    });

    if(!["organizer","owner"].includes(socket.user.role)){
    socket.disconnect();
    }

  });

  return io;
};