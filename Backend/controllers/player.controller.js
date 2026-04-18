import Player from "../models/player.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises"

export const createPlayer = async (req, res) => {
    try{
        const {playerName, category, basePrice} = req.body;
        const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "EventraImages",
      resource_type: "auto",
      quality: "auto:best",
      fetch_format: "auto",
    });
      if(!req.file){
        return res.status(400).json({ message: "Player image required"});
      }
        if(!playerName || !category || !basePrice){
            return res.status(400).json({ message: "Missing Fields" });
        }
        if(basePrice<=0){
           return res.status(400).json({ message: "Baseprice should be more than 0 " }); 
        }
        const existingPlayer = await Player.findOne({ playerName });
        if (existingPlayer) {
        return res.status(400).json({ message: "Player already added in Auction" });
        }

        const player = await Player.create({
            playerName: playerName,
            category: category,
            basePrice: basePrice,
            image: result.secure_url,
            sold: false,
            soldPrice: null,
            assignedTeam: null,
            createdBy: req.user.id
        })
        await fs.unlink(req.file.path);
        res.status(201).json({message: "Player created successfully",player})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ message: "Server Error" });
    }
}

export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(player);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};