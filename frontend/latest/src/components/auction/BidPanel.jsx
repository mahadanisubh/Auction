import { useState } from 'react';
import { placeBid } from '../../sockets/socket.js';
import './bidPanel.css';

export default function BidPanel({ 
  auctionId, 
  currentBid = 0, 
  basePrice = 0, 
  isHighestBidder = false 
}) {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validBasePrice = basePrice || 0;
  const validCurrentBid = currentBid || 0;
  const increment = validBasePrice > 0 ? Math.ceil(validBasePrice * 0.1) : 0;
  const minBid = validCurrentBid + increment;

  const handleBidChange = (e) => {
    const value = e.target.value;
    setBidAmount(value);
    setError('');
  };

  const handleSubmitBid = async () => {
    if(loading) return;
    if (!bidAmount || isNaN(bidAmount)) {
      setError('Please enter a valid bid amount');
      return;
    }

    const bid = Number(bidAmount);
    if (bid < minBid) {
      setError(`Minimum bid should be ₹${minBid}`);
      return;
    }

    setLoading(true);
    try {
      placeBid(auctionId, bid);
      setBidAmount('');
    } catch (err) {
      console.error(err);
      setError('Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bid-panel">
      <div className="bid-info">
        <div className="bid-item">
          <span className="bid-label">Current Bid:</span>
          <span className="bid-value">₹{currentBid} Cr</span>
        </div>
        <div className="bid-item">
          <span className="bid-label">Minimum Bid:</span>
          <span className="bid-value">₹{minBid} Cr</span>
        </div>
        {isHighestBidder && (
          <div className="bid-status">
            ✓ You are the highest bidder
          </div>
        )}
      </div>

      <div className="bid-input-section">
        <input
          type="number"
          value={bidAmount}
          onChange={handleBidChange}
          placeholder={`Enter bid (min: ₹${minBid})`}
          className="bid-input"
          disabled={isHighestBidder}
        />
        {error && <span className="bid-error">{error}</span>}
      </div>

      <div className="quick-bids">
        <button 
          className="quick-bid-btn" 
          onClick={() => setBidAmount(minBid)}
          disabled={isHighestBidder}
        >
          ₹{minBid} Cr
        </button>
        <button 
          className="quick-bid-btn" 
          onClick={() => setBidAmount(minBid + 10)}
          disabled={isHighestBidder}
        >
          ₹{minBid + 10} Cr
        </button>
        <button 
          className="quick-bid-btn" 
          onClick={() => setBidAmount(minBid + 20)}
          disabled={isHighestBidder}
        >
          ₹{minBid + 20} Cr
        </button>
      </div>

      <button 
        className="btn-place-bid"
        onClick={handleSubmitBid}
        disabled={isHighestBidder || loading}
      >
        {loading ? 'Placing...' : 'Place Bid'}
      </button>
    </div>
  );
}
