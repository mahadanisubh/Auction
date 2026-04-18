import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Loader from '../../components/common/Loader.jsx';
import { getAuctionById, getAllPlayers,getTeamsByAuction, updateAuctionPlayers, updateAuctionTeams } from '../../api/auctionApi.js';
import './organizer.css';

export default function AuctionSetup() {
  const navigate = useNavigate();
  const { auctionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [auction, setAuction] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [tab, setTab] = useState('players');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, playersRes, teamsRes] = await Promise.all([
          getAuctionById(auctionId),
          getAllPlayers(),
          getTeamsByAuction(auctionId)
        ]);
        
        setAuction(auctionRes.data);
        setAllPlayers(playersRes.data);
        setAllTeams(teamsRes.data);
        
        // Initialize selected IDs from auction data
        setSelectedPlayerIds((auctionRes.data.players || []).map(p => p.player._id || p.player));
        setSelectedTeamIds((auctionRes.data.teams || []).map(t => t.team._id || t.team));
      } catch (err) {
        console.error(err);
        setError('Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auctionId]);

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSavePlayersSelection = async () => {
    if (selectedPlayerIds.length === 0) {
      setError('Please select at least one player');
      return;
    }
    setSaving(true);
    try {
      await updateAuctionPlayers(auctionId, selectedPlayerIds);
      setError('');
      setSuccess('Players updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update players');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeamsSelection = async () => {
    if (selectedTeamIds.length === 0) {
      setError('Please select at least one team');
      return;
    }
    setSaving(true);
    try {
      await updateAuctionTeams(auctionId, selectedTeamIds);
      setSuccess('Teams updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teams');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error && !success) {
    return (
      <>
        <Navbar />
        <div className="organizer-page">
          <div className="error-message">{error}</div>
          <button className="btn-primary" onClick={() => navigate('/organizer/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="organizer-page">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/organizer/dashboard')}>← Back</button>
          <h1>Setup Auction: {auction?.auctionName}</h1>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="setup-tabs">
          <button 
            className={`tab-btn ${tab === 'players' ? 'active' : ''}`}
            onClick={() => {setTab('players'), setError('')} }
          >
            Players ({selectedPlayerIds.length})
          </button>
          <button 
            className={`tab-btn ${tab === 'teams' ? 'active' : ''}`}
            onClick={() => {setTab('teams'), setError('')}}
          >
            Teams ({selectedTeamIds.length})
          </button>
        </div>

        {tab === 'players' && (
          <div className="setup-content">
            <h2>Select Players for Auction</h2>
            <p className="info-text">Select players to include in this auction ({selectedPlayerIds.length} selected)</p>
            {allPlayers && allPlayers.length > 0 ? (
              <>
                <div className="selection-grid">
                  {allPlayers.map((player) => (
                    <div key={player._id} className="selection-card">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedPlayerIds.includes(player._id)}
                          onChange={() => handlePlayerToggle(player._id)}
                        />
                        <span className="checkmark"></span>
                        <div className="card-content">
                          <h4>{player.playerName}</h4>
                          <p><strong>Category:</strong> {player.category}</p>
                          <p><strong>Price:</strong> ₹{player.basePrice.toLocaleString()}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-primary"
                  onClick={handleSavePlayersSelection}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Player Selection'}
                </button>
              </>
            ) : (
              <div className="empty-state">
                <p>No players available. Create players first.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'teams' && (
          <div className="setup-content">
            <h2>Select Teams for Auction</h2>
            <p className="info-text">Select teams to participate in this auction ({selectedTeamIds.length} selected)</p>
            {allTeams && allTeams.length > 0 ? (
              <>
                <div className="selection-grid">
                  {allTeams.map((team) => (
                    <div key={team._id} className="selection-card">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedTeamIds.includes(team._id)}
                          onChange={() => handleTeamToggle(team._id)}
                        />
                        <span className="checkmark"></span>
                        <div className="card-content">
                          <h4>{team.teamName}</h4>
                          <p><strong>Owner:</strong> {team.ownerId?.name || 'Unknown'}</p>
                          <p><strong>Balance:</strong> ₹{team.balance.toLocaleString()}</p>
                          <p><strong>Players:</strong> {team.players?.length || 0}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-primary"
                  onClick={handleSaveTeamsSelection}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Team Selection'}
                </button>
              </>
            ) : (
              <div className="empty-state">
                <p>No teams available. Create teams first.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
