import './bidHistory.css';
import { formatCurrency } from '../../utils/formatCurrency';
const formatBidTime = (timestamp) => {
  const date = new Date(timestamp);
  if (!timestamp || isNaN(date)) return "N/A";

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function BidHistory({ bids }) {
  if (!bids || bids.length === 0) {
    return <div className="bid-history-empty">No bids placed yet</div>;
  }
  const visibleBids = bids.slice(-20)
  return (
    <div className="bid-history">
      <h3>Bid History</h3>
      <div className="bids-list">
        {visibleBids.map((bid, index) => (
          <div
            key={`${bid.teamName}-${bid.timestamp}`}
            className={`bid-item ${index === visibleBids.length - 1 ? 'latest-bid' : ''}`}
          >
            <span className="bid-team">{bid.teamName || 'Unknown'}</span>
            <span className="bid-amount">{formatCurrency(bid.bidAmount)}Cr</span>
            <span className="bid-time">{formatBidTime(bid.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
