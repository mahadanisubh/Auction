import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useAuction } from '../../hooks/useAuction.js';
import { getAuctionById } from '../../api/auctionApi.js';
import './auction.css';

export default function AuctionWaiting() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuction();
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await getAuctionById(auctionId);
        setAuction(response.data);
        if (response.data.status === "live") {
        navigate(`/auction/room/${auctionId}`);
      }
      } catch (err) {
        console.error(err);
        setError('Failed to load auction');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
    const interval = setInterval(fetchAuction, 3000);
    return() => clearInterval(interval);
  }, [auctionId, navigate]);

  if (loading) return <Loader />;

  if (!auction) {
    return (
      <>
        <Navbar />
        <div className="auction-container">
          <div className="error-message">{error || 'Auction not found'}</div>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="auction-container">
        <div className="waiting-screen">
          <div className="waiting-content">
            <h1>{auction.auctionName}</h1>
            <p className="waiting-message">Waiting for auction to start...</p>
            
            <div className="waiting-info">
              <div className="info-item">
                <span className="label">Total Players:</span>
                <span className="value">{auction.players?.length || 0}</span>
              </div>
              <div className="info-item">
                <span className="label">Teams:</span>
                <span className="value">{auction.teams?.length || 0}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`value status-${auction.status}`}>{auction.status.toUpperCase()}</span>
              </div>
            </div>

            {role === 'organizer' && (
              <button 
                className="btn-large-primary"
                onClick={() => navigate(`/auction/room/${auctionId}`)}
              >
                Start Auction
              </button>
            )}

            {role !== 'organizer' && (
              <div className="waiting-note">
                <p>The organizer will start the auction soon. Please wait...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
