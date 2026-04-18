import axios from "axios";

const API_BASE_URL = import.meta.env.API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Prevent invalid token loops
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (userData) => api.post("/registeruser", userData);
export const loginUser = (credentials) => api.post("/loginuser", credentials);

// Team APIs
export const createTeam = (teamData) => api.post("/createteam", teamData);
export const getTeamsByAuction = (auctionId) => api.get(`/auction/${auctionId}/teams`);

// Player APIs
export const createPlayer = (playerData) => {
  const formData = new FormData();
  formData.append("playerName", playerData.playerName);
  formData.append("category", playerData.category);
  formData.append("basePrice", playerData.basePrice);
  formData.append("image", playerData.image);

  return api.post("/createplayer", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// Auction APIs
export const createAuction = (auctionData) => api.post("/createauction", auctionData);
export const startAuction = (auctionId) => api.post(`/auction/${auctionId}/start`);
export const sellPlayer = (auctionId) => api.post(`/auction/${auctionId}/sell`);

// GET APIs for fetching data
export const getAllAuctions = () => api.get("/auctions");
export const getAuctionById = (auctionId) => api.get(`/auction/${auctionId}`);
export const getPlayerById = (playerId) => api.get(`/player/${playerId}`);
export const getTeamById = (teamId) => api.get(`/team/${teamId}`);
export const getAllPlayers = () => api.get("/players");
export const getAllTeams = () => api.get("/teams");
export const getMyTeams = (auctionId) => api.get(`/my-teams${auctionId ? `?auctionId=${auctionId}` : ""}`);
export const getAllUsers = (role) => api.get(`/users?role=${role}`);

// Update auction players and teams
export const updateAuctionPlayers = (auctionId, playerIds) => 
  api.put(`/auction/${auctionId}/players`, { playerIds });
export const updateAuctionTeams = (auctionId, teamIds) => 
  api.put(`/auction/${auctionId}/teams`, { teamIds });

export const exportAuctionCSV = (auctionId) =>
  api.get(`/auction/${auctionId}/export`, {
    responseType: "blob"
  });

export default api;
