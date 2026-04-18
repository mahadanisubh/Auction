import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import PlayerCard from '../../components/auction/PlayerCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getTeamById } from '../../api/auctionApi.js';
import './teams.css';

export default function TeamPlayers() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await getTeamById(teamId);
        setTeam(response.data);
      } catch (err) {
        console.error('Failed to fetch team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  if (loading) return <Loader />;

  if (!team) {
    return (
      <>
        <Navbar />
        <div className="teams-container">
          <div className="error-message">Team not found</div>
          <button className="btn-primary" onClick={() => navigate('/teams/dashboard')}>
            Back to Teams
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="teams-container">
        <div className="team-header-section">
          <button className="btn-back" onClick={() => navigate('/teams/dashboard')}>
             Back to Teams
          </button>
          <h1>{team.teamName}</h1>
        </div>

        <div className="team-summary">
          <div className="summary-card">
            <span className="summary-label">Total Budget</span>
            <span className="summary-value">{formatCurrency(team.initialBalance)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Remaining Budget</span>
            <span className="summary-value" style={{ color: team.balance > 0 ? '#27ae60' : '#e74c3c' }}>
              {formatCurrency(team.balance)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Players Bought</span>
            <span className="summary-value">{team.players.length}</span>
          </div>
        </div>

        <div className="players-section">
          <h2>Team Players</h2>
          {team.players.length === 0 ? (
            <div className="empty-state">
              <p>No players bought yet</p>
              <p className="info-text">Players will appear here once they are bought in the auction</p>
            </div>
          ) : (
            <div className="players-grid">
              {team.players.map(playerData => (
                <div key={playerData.player._id}>
                  <PlayerCard player={playerData.player} />
                  <div className="player-price">
                    Bought for: {formatCurrency(playerData.price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="category-summary">
          <h2>Squad Composition</h2>
          <div className="category-grid">
            {Object.entries(team.categoryCounts || {}).map(([category, count]) => (
              <div key={category} className="category-cell">
                <span className="category-label">{category}</span>
                <span className="category-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
