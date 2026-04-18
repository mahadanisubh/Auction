import { Router } from "express";
import { registerUser,loginUser } from "../controllers/auth.controller.js";
import { createTeam,getTeamsByAuction, getTeamById, getMyTeams } from "../controllers/team.controller.js";
import { createPlayer, getAllPlayers, getPlayerById } from "../controllers/player.controller.js";
import { createAuctionRoom, getAllAuctions, getAuctionById, updateAuctionPlayers, updateAuctionTeams } from "../controllers/auctionRoom.controller.js";
import { authMiddleware, isOrganizer, isOwner } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multerImage.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import { exportAuctionCSV } from "../controllers/auctionRoom.controller.js";

const router = Router();

// Auth Routes
router.post("/registeruser",registerUser);
router.post("/loginuser",loginUser);

// Team Routes
router.post("/createteam",authMiddleware,isOrganizer,createTeam);
router.get("/teams", authMiddleware, async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-teams", authMiddleware, isOwner, getMyTeams);
router.get("/team/:teamId",authMiddleware, getTeamById);
router.get("/auction/:auctionId/teams", authMiddleware, getTeamsByAuction);

// Player Routes
router.post("/createplayer",authMiddleware,isOrganizer,upload.single("image"),createPlayer);
router.get("/players", authMiddleware, getAllPlayers);
router.get("/player/:playerId", authMiddleware, getPlayerById);

// Auction Routes
router.get("/auctions", authMiddleware, getAllAuctions);
router.get("/auction/:auctionId", authMiddleware, getAuctionById);
router.post("/createauction",authMiddleware,isOrganizer,createAuctionRoom);
router.put("/auction/:auctionId/players", authMiddleware, isOrganizer, updateAuctionPlayers);
router.put("/auction/:auctionId/teams", authMiddleware, isOrganizer, updateAuctionTeams);
router.get("/auction/:auctionId/export",authMiddleware,isOrganizer,exportAuctionCSV);

// User Routes
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

