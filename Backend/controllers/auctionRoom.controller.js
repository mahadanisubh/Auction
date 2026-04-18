import AuctionRoom from "../models/auctionRoom.model.js";
import Player from "../models/player.model.js";
import Team from "../models/team.model.js";
import {Parser} from "json2csv";

export const createAuctionRoom = async (req, res) => {
  try {
    const { auctionName } = req.body;
    if (!auctionName) {
      return res.status(400).json({ message: "Auction name is required" });
    }
    const players = await Player.find();
    if (!players.length) {
      return res
        .status(400)
        .json({ message: "No available players to create auction" });
    }
    const playerList = players.map((p) => ({
      player: p._id,
      basePrice: p.basePrice,
      category: p.category,
    }));
    const teams = [];
    // if (!teams.length) {
    //   return res
    //     .status(400)
    //     .json({ message: "No available teams to create auction" });
    // }
    const teamList = teams.map((t) => ({
      team: t._id,
    }));
    const auctionRoom = await AuctionRoom.create({
      auctionName,
      status: "waiting",
      players: playerList,
      teams: teamList,
      createdBy: req.user.id,
    });
    res
      .status(201)
      .json({ message: "Auction Room Created Successfully", auctionRoom });
  } catch (error) {
    console.log("createAuctionRoom error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await AuctionRoom.find()
      .sort({ createdAt: -1 })
      .populate([
        { path: "teams.team", model: "Team", populate: { path: "ownerId", model: "User", select: "name email" } },
        { path: "players.player", model: "Player" },
        { path: "currentPlayer", model: "Player" },
        { path: "currentLeader", model: "Team", populate: { path: "ownerId", model: "User", select: "name" } },
      ]);
    res.status(200).json(auctions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await AuctionRoom.findById(auctionId)
      .populate([
        { path: "teams.team", model: "Team", populate: { path: "ownerId", model: "User", select: "name email" } },
        { path: "players.player", model: "Player" },
        { path: "currentPlayer", model: "Player" },
        { path: "currentLeader", model: "Team", populate: { path: "ownerId", model: "User", select: "name" } },
      ]);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.status(200).json(auction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAuctionPlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { playerIds } = req.body;

    if (!playerIds || !Array.isArray(playerIds)) {
      return res.status(400).json({ message: "playerIds must be an array" });
    }

    const auction = await AuctionRoom.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Create new player list with selected player IDs
    const selectedPlayers = await Player.find({ _id: { $in: playerIds } });
    const newPlayerList = selectedPlayers.map((p) => ({
      player: p._id,
      basePrice: p.basePrice,
      category: p.category,
    }));

    auction.players = newPlayerList;
    await auction.save();

    res.status(200).json({ message: "Players updated successfully", auction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAuctionTeams = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { teamIds } = req.body;

    if (!teamIds || !Array.isArray(teamIds)) {
      return res.status(400).json({ message: "teamIds must be an array" });
    }

    const auction = await AuctionRoom.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Create new team list with selected team IDs
    const newTeamList = teamIds.map((teamId) => ({
      team: teamId,
    }));

    auction.teams = newTeamList;
    await auction.save();

    res.status(200).json({ message: "Teams updated successfully", auction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const exportAuctionCSV = async (req, res) => {
  try {

    const { auctionId } = req.params;

    const auction = await AuctionRoom.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

   const teamIds = auction.teams.map(t => t.team);

const teams = await Team.find({
  _id: { $in: teamIds }
}).populate("players.player");

    const rows = [];

    teams.forEach(team => {

      team.players.forEach(p => {
         const isPlayerInAuction = auction.players.some(
      ap => ap.player.toString() === p.player?._id.toString()
    );
    if (isPlayerInAuction) {
        rows.push({
          teamName: team.teamName,
          playerName: p.player?.playerName || "Unknown",
          category: p.category,
          soldPrice: p.price
        });
      }

      });

    });

    const parser = new Parser({
      fields: ["teamName", "playerName", "category", "soldPrice"]
    });

    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");

    res.attachment(`auction-${auctionId}.csv`);

    res.send(csv);

  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Failed to export CSV" });

  }
};