import { getCategoryBadgeColor } from '../../utils/formatCurrency.js';
import './playerCard.css';

export default function PlayerCard({ player, isCurrentPlayer = false }) {
  return (
    <div className={`player-card ${isCurrentPlayer ? 'current' : ''}`}>
      <div className="player-image-container">
        {player.image && (
          <img src={player.image} alt={player.playerName} className="player-image" />
        )}
        <div className="player-overlay">
          <span className="category-badge" style={{ backgroundColor: getCategoryBadgeColor(player.category) }}>
            {player.category}
          </span>
        </div>
      </div>
      
      <div className="player-info">
        <h3 className="player-name">{player.playerName}</h3>
        <p className="base-price">Base Price: ₹{player.basePrice} Cr</p>
        {isCurrentPlayer && <p className="current-label">🔴 Currently Bidding</p>}
      </div>
    </div>
  );
}
