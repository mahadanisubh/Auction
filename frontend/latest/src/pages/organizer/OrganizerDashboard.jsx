import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar.jsx";
import Loader from "../../components/common/Loader.jsx";
import Modal from "../../components/common/Modal.jsx";
import { createAuction, getAllAuctions } from "../../api/auctionApi.js";
import "./organizer.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [auctionName, setAuctionName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await getAllAuctions();
        setAuctions(response.data);
      } catch (err) {
        console.error("Failed to fetch auctions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleCreateAuction = async () => {
    if (!auctionName.trim()) {
      setError("Auction name is required");
      return;
    }

    try {
      const response = await createAuction({ auctionName });
      setAuctions((prev) => [...prev, response.data.auctionRoom]);
      setShowModal(false);
      setAuctionName("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create auction");
    }
  };

  const handleStartAuction = (auctionId) => {
    // Navigate to the auction room (starting the auction is managed via socket events)
    navigate(`/auction/room/${auctionId}`);
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="organizer-dashboard">
        <div className="dashboard-header">
          <h1>Auction Management System</h1>
        </div>

        <div className="quick-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            ➕ New Auction
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/organizer/player-entry")}
          >
            ➕ Add Players
          </button>
        </div>

        {auctions.length === 0 ? (
          <div className="empty-state">
            <p>No auctions created yet</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Create First Auction
            </button>
          </div>
        ) : (
          <div className="auctions-grid">
            {auctions.map((auction) => {
              const totalPlayers = auction.players?.length || 0;
              // Calculate sold players by counting total players across all teams
              const soldPlayers = auction.teams?.reduce((count, teamObj) => {
                return count + (teamObj.team?.players?.length || 0);
              }, 0) || 0;
              const auctionProgress = totalPlayers > 0 ? Math.round((soldPlayers / totalPlayers) * 100) : 0;
              return (
              <div key={auction._id} className="auction-card">
                <h3>{auction.auctionName}</h3>
                <p className="auction-status">
                  Status: <span>{auction.status}</span>
                </p>
                <p className="auction-info">
                  Players: {auction.players.length}
                </p>
                <p className="auction-info">Teams: {auction.teams.length}</p>
                {totalPlayers > 0 && (
                  <div className="auction-progress">
                    <span>Progress: {auctionProgress}%</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${auctionProgress}%`}}></div>
                    </div>
                  </div>
                )}
                <div className="auction-actions">
                  {auction.status === "waiting" && (
                    <>
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          navigate(`/organizer/team-entry/${auction._id}`)
                        }
                      >
                        Create Teams
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() =>
                          navigate(`/organizer/setup/${auction._id}`)
                        }
                      >
                        Setup
                      </button>

                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/auction/room/${auction._id}`)}
                      >
                        Enter Room
                      </button>
                    </>
                  )}
                  {auction.status === "live" && (
                    <button
                      className="btn-primary"
                      onClick={() => handleStartAuction(auction._id)}
                    >
                      Manage
                    </button>
                  )}
                  {auction.status === "completed" && (
                    <button className="btn-secondary" disabled>
                      Completed
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setError("");
          }}
          title="Create New Auction"
          onConfirm={handleCreateAuction}
          confirmText="Create"
        >
          <div className="modal-form">
            <label>Auction Name</label>
            <input
              type="text"
              value={auctionName}
              onChange={(e) => setAuctionName(e.target.value)}
              placeholder="Enter auction name"
              className="form-input"
            />
            {error && <p className="error-text">{error}</p>}
          </div>
        </Modal>
      </div>
    </>
  );
}
