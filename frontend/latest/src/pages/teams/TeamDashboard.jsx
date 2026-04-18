import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import TeamList from '../../components/team/TeamList.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useAuction } from '../../hooks/useAuction.js';
import { getMyTeams, getAllAuctions } from '../../api/auctionApi.js';
import './teams.css';


export default function TeamDashboard() {
  const navigate = useNavigate();
  const { token } = useAuction();
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, auctionsRes] = await Promise.all([
          getMyTeams(),
          getAllAuctions()
        ]);
        setTeams(teamsRes.data);
        // Only show live or waiting auctions
        setAuctions(auctionsRes.data.filter(a => a.status === 'live' || a.status === 'waiting'));
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleJoinAuction = (auctionId) => {
    if (teams.length === 0) {
    alert("You must have a team to join an auction");
    return;
}
    navigate(`/auction/waiting/${auctionId}`);
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loader />
      ) : (
        <div className="teams-container">
          {/* My Teams Section */}
          <div className='dashboard-layout'>
          <div className="section">
            <div className="section-header">
              <h1>My Teams</h1>
              <p className="section-subtitle">View and manage your teams</p>
            </div>
            
            <TeamList teams={teams} isLoading={loading} />

            {teams.length === 0 && (
              <div className="info-box">
                <p>You don't have any teams yet. Ask your auction organizer to create a team for you.</p>
              </div>
            )}
          </div>
          
          {/* Available Auctions Section */}
            <div className="section-header">
              <h2>Available Auctions</h2>
              <p className="section-subtitle">Join an auction and start bidding</p>
              <br />
              <br />
           

            {auctions.length > 0 ? (
              <div className="auctions-grid">
                {auctions.map(auction => (
                  <div key={auction._id} className="auction-card">
                    <div className="auction-card-header">
                      <h3>{auction.auctionName}</h3>
                      <span className={`status-badge status-${auction.status}`}>
                        {auction.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="auction-details">
                      <p><strong>Players:</strong> {auction.players?.length || 0}</p>
                      <p><strong>Teams:</strong> {auction.teams?.length || 0}</p>
                      <p> <strong>Status:</strong> {auction.status}</p>
                    </div>

                    <button 
                      className="btn-join"
                      onClick={() => handleJoinAuction(auction._id)}
                    >
                      {auction.status === 'live' ? 'Join Auction' : 'Click here to see the auction'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="info-box">
                <p>No auctions available at the moment. Check back later!</p>
              </div>
            )}
          </div>
       
         </div>
          </div>   
      )}
    </>
  );
}
