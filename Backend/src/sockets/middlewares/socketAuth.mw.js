import jwt from "jsonwebtoken";
import Team from "../../../models/team.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("No token provided");
      return next(new Error("Authentication Error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    if(decoded.role === "owner"){
        const team = await Team.findOne({ownerId: decoded.id})
         if (!team) {
        return next(new Error("Team not found for owner"));
      }
      socket.user.teamId = team._id;
    }
    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("Authentication Error"));
  }
};