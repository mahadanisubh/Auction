import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar.jsx";
import Loader from "../../components/common/Loader.jsx";
import PlayerCard from "../../components/auction/PlayerCard.jsx";
import Timer from "../../components/auction/Timer.jsx";
import BidPanel from "../../components/auction/BidPanel.jsx";
import SoldBanner from "../../components/auction/SoldBanner.jsx";
import BidHistory from "../../components/history/BidHistory.jsx";
import { useSocketConnection } from "../../hooks/useSocketConnection.js";
import { useAuction } from "../../hooks/useAuction.js";
import { useAuctionSocket } from "../../hooks/useAuctionSocket.jsx";
import {
  joinAuction,
  pauseAuction,
  resumeAuction,
  skipPlayer,
  forceSell,
  startAuction
} from "../../sockets/socket.js";
import {
  getAuctionById,
  getMyTeams,
} from "../../api/auctionApi.js";
import { playPlayerSoldSound, playBidSound,playPauseSound } from "../../utils/countdownSound.js";
import AuctionTeamsTable from "../../components/auction/AuctionTeamsTable.jsx";
import { exportAuctionCSV } from "../../api/auctionApi.js";
import "./auction.css";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function AuctionRoom() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuction();
  const socket = useSocketConnection();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bids, setBids] = useState([]);
  const [soldPlayer, setSoldPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [auctionTeams, setAuctionTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(
  localStorage.getItem(`selectedTeam_${auctionId}`) || null
);

  // Socket event handlers
  const handleBidUpdated = (data) => {
    playBidSound();
    setBids((prev) => [...prev.slice(-20), data]);
    setAuction((prev) => ({
      ...prev,
      currentBid: data.bidAmount,
      currentLeader: data.leader,
      timerEndTime: data.timerEndTime,
    }));
  };

  const handlePlayerSold = (data) => {
    playPlayerSoldSound();
    setSoldPlayer(data);
    setTimeout(() => setSoldPlayer(null), 5000);
  };

  const handleNextPlayer = (data) => {
    setBids([]); // Clear previous bids for new player
    setAuction((prev) => ({
      ...prev,
      status: "live",
      currentPlayer: data.nextPlayer,
      currentBid: data.nextBid,
      currentLeader: null,
      timerEndTime: data.timerEndTime,
    }));
  };
  const handleAuctionPaused = () => {
    playPauseSound();
    setAuction((prev) => ({
      ...prev,
      status: "paused",
    }));
  };

  const handleAuctionResumed = (data) => {
    setAuction((prev) => ({
      ...prev,
      status: "live",
      timerEndTime: data.timerEndTime,
    }));
  };

  const handleAuctionCompleted = () => {
    setAuction((prev) => ({
      ...prev,
      status: "completed",
    }));
  };

  const handleTeamUpdated = (data) => {
  console.log("teamUpdated event:", data);

  const updatedTeamId = data.teamId?.toString();
  setAuctionTeams((prev) =>
    prev.map((team) => {
      if (team._id?.toString() === updatedTeamId) {
        return {
          ...team,
          balance: data.balance,
          categoryCounts: data.categoryCounts ?? team.categoryCounts,
          players: data.playersCount !== undefined
            ? new Array(data.playersCount).fill(null)
            : team.players
        };
      }
      return team;
    })
  );  
  setTeams((prev) =>
    prev.map((team) => {
      if (team._id?.toString() === updatedTeamId) {
        return { ...team, balance: data.balance };
      }
      return team;
    })
  );
};
  const handleBidError = (data) => {
    setError(data.message);
    setTimeout(() => setError(""), 3000);
  };

  const handleControlError = (data) => {
    setError(data.message);
    setTimeout(() => setError(""), 3000);
  };

  const handleExportCSV = async () => {

  try {

    const response = await exportAuctionCSV(auctionId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auction-${auctionId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    setError("Failed to export auction report");
  }
};

  // Setup socket listeners
  const handleAuctionState = (data) => {
    if (!data) return;
    setAuction(data);
  };

  useAuctionSocket({
    onBid: handleBidUpdated,
    onSold: handlePlayerSold,
    onNext: handleNextPlayer,
    onPause: handleAuctionPaused,
    onResume: handleAuctionResumed,
    onComplete: handleAuctionCompleted,
    onState: handleAuctionState,
    onBidErr: handleBidError,
    onControlErr: handleControlError,
    onTeamUpdate: handleTeamUpdated,
  });

  useEffect(() => {
    const fetchAuction = async () => {
  try {
    const response = await getAuctionById(auctionId);
    const auctionData = response.data;

    setAuction(auctionData);
    //with team balance
    if (auctionData.teams) {
  const formattedAuctionTeams = auctionData.teams.map((t) => ({
    _id: t.team._id,
    teamName: t.team.teamName,
    balance: t.team.balance,
    initialBalance: t.team.initialBalance,
    players: t.team.players || [],
    categoryCounts: t.team.categoryCounts || {
      batsman: 0,
      bowler: 0,
      allrounder: 0,
      wicketkeeper: 0
    }
  }));

  setAuctionTeams(formattedAuctionTeams);
}

    if (socket && auctionData._id) {
      joinAuction(auctionData._id);
    }
  } catch (err) {
    setError("Failed to load auction");
  } finally {
    setLoading(false);
  }
};
    fetchAuction();
  }, [auctionId, socket]);

  // Fetch teams for team owners
  useEffect(() => {
    if (role === "owner") {
      const fetchTeams = async () => {
        try {
          const response = await getMyTeams(auctionId);
          setTeams(response.data);
          if (response.data.length > 0 && !selectedTeam) {
            const defaultTeamId = response.data[0]._id?.toString();
            setSelectedTeam(defaultTeamId);
            localStorage.setItem(`selectedTeam_${auctionId}`, defaultTeamId);
          }
        } catch (err) {
          console.error("Failed to fetch teams", err);
        }
      };
      fetchTeams();
    }
  }, [role, selectedTeam, auctionId]);

  useEffect(() => {
  setSelectedTeam(localStorage.getItem(`selectedTeam_${auctionId}`) || null);
}, [auctionId]);

  const handleStartAuction = () => {
  startAuction(auctionId);
};

  const handlePauseAuction = () => {
    pauseAuction(auctionId);
  };

  const handleResumeAuction = () => {
    resumeAuction(auctionId);
  };

  const handleSkipPlayer = () => {
    skipPlayer(auctionId);
  };

  const handleForceSell = () => {
    forceSell(auctionId);
  };

  if (loading) return <Loader />;

  if (!auction && error) {
    return (
      <>
          <Navbar />
        <div className="auction-container">
          <div className="error-message">{error}</div>
          <button
            className="btn-primary"
            onClick={() => navigate("/organizer/dashboard")}
          >
            Back
          </button>
        </div>
      </>
    );
  }

  if (!auction) {
    return (
      <>
        <Navbar />
        <div className="auction-container">
          <div className="error-message">Auction not found</div>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Back Home
          </button>
        </div>
      </>
    );
  }

  const isOrganizer = role === "organizer";
  const selectedTeamId = localStorage.getItem(`selectedTeam_${auctionId}`);
  const currentLeaderId =
    auction.currentLeader && (auction.currentLeader._id || auction.currentLeader);
  const isCurrentLeader =
    selectedTeamId &&
    currentLeaderId &&
    currentLeaderId.toString() === selectedTeamId.toString();

    const selectedTeamData = teams.find(
  (t) => t._id?.toString() === selectedTeam?.toString()
);

const teamBalance =
  selectedTeamData?.balance ??
  selectedTeamData?.initialBalance ??
  0;
  return (
    <>
      <Navbar>
        <AuctionTeamsTable teams={auctionTeams} currentLeaderId={currentLeaderId} />
        </Navbar>
      <div className="auction-container">
        {soldPlayer && (
          <SoldBanner
            key={soldPlayer.playerName}
            playerName={soldPlayer.playerName}
            teamName={soldPlayer.teamName}
            soldPrice={soldPlayer.soldPrice}
          />
        )}

        {error && <div className="error-banner">{error}</div>}

        <div className="auction-header">
          <h1>Auction : {auction.auctionName}</h1>
          <div className="auction-status-badge">{auction.status}</div>
        </div>

        <div className="auction-main">
          <div className="auction-left">
            {auction.status === "waiting" && isOrganizer && (
              <button
                className="btn-large-primary"
                onClick={handleStartAuction}
              >
                Start Auction
              </button>
            )}
          
            {auction.currentPlayer && (
              <>
                <PlayerCard
                  player={auction.currentPlayer}
                  isCurrentPlayer={true}
                />


                {isOrganizer && auction.status !== "waiting" && (
                  <div className="organizer-controls">
                    {auction.status === "live" && (
                      <>
                        <button
                          className="btn-control"
                          onClick={handlePauseAuction}
                        >
                          ⏸ Pause
                        </button>
                        <button
                          className="btn-control"
                          onClick={handleSkipPlayer}
                        >
                          ⏭ Skip
                        </button>
                        <button
                          className="btn-control btn-danger"
                          onClick={handleForceSell}
                        >
                          💰 Force Sell
                        </button>
                      </>
                    )}
                    {auction.status === "paused" && (
                      <button
                        className="btn-control btn-success"
                        onClick={handleResumeAuction}
                      >
                        ▶ Resume
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {auction.status === "completed" && (
              <div className="auction-completed">
                <h2>✓ Auction Completed</h2>
                {role === "organizer" && (
                    <button className="btn-primary"
                    onClick={handleExportCSV}
                    style={{ marginRight: "10px" }}>
                   Download Auction Report
                    </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => navigate(role === "organizer" ? "/organizer/dashboard" : "/teams/dashboard")}
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>

          <div className="auction-right">
             {auction.status === "live" && (
                  <div className="auction-controls">
                    <Timer endTime={auction.timerEndTime} />
                  </div>
                )}
            {auction.status === "live" && !isOrganizer && (
              <>
                {role === "owner" && teams.length > 1 && (
                  <div className="team-selector">
                    <label htmlFor="team-select">Select Team:</label>
                    <select
                      id="team-select"
                      value={selectedTeam || ""}
                      onChange={(e) => {
                      const teamId = e.target.value;
                      setSelectedTeam(teamId);
                      localStorage.setItem(`selectedTeam_${auctionId}`, teamId);
                    }}
                    >
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.teamName} - ₹{team.balance}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {role === "owner" && selectedTeam && (
                   <div className="team-balance">
                    <h4>Your Balance</h4>
                    <p>{formatCurrency(teamBalance)}</p>
                    </div>
                )}
                <BidPanel
                  auctionId={auctionId}
                  currentBid={auction.currentBid}
                  basePrice={auction.currentPlayer?.basePrice || 0}
                  isHighestBidder={isCurrentLeader}
                />
              </>
              
            )}
            <BidHistory bids={bids} />
            
          </div>
        </div>
      </div>
    </>
  );
}
