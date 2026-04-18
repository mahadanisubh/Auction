import Team from "../models/team.model.js";
import User from "../models/user.model.js";

export const createTeam = async (req, res) => {
  try {
    const { teamName, ownerId, auctionId } = req.body;
    const STARTING_BALANCE = 100;

    if(!auctionId){
      return res.status(400).json({message: "Auction Id is required"})
    }
    const existingTeam = await Team.findOne({ teamName, auctionId });
    if (existingTeam) {
      return res.status(400).json({ message: "TeamName already Exists in this auction" });
    }
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: "Owner not Found!" });
    }
    if (user.role !== "owner") {
      return res.status(400).json({
        message: "Selected user is not a team owner",
      });
    }
    const alreadyInAuction = await Team.findOne({ ownerId, auctionId });
    if (alreadyInAuction) {
      return res.status(400).json({ message: "Owner already has a team in this auction" });
    }

    const team = await Team.create({
      teamName: teamName,
      ownerId,
      auctionId,
      balance: STARTING_BALANCE,
      initialBalance: STARTING_BALANCE,
      players: [],
      categoryCounts: {},
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Team Created Successfully", team });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTeamsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!auctionId) {
      return res.status(400).json({
        message: "AuctionId is required"
      });
    }
    const teams = await Team.find({ auctionId })
      .populate("ownerId", "name email");

    res.status(200).json(teams);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const { auctionId } = req.query;

    const filter = { ownerId: req.user.id };
    if (auctionId) {
      filter.auctionId = auctionId;
    }

    const teams = await Team.find(filter)
      .populate("players.player")
      .populate("ownerId", "name email");

    res.status(200).json(teams);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate('players.player')
      .populate('ownerId', 'name email');
    
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
