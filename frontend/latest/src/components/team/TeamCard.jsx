import { formatCurrency } from '../../utils/formatCurrency.js';
import { useNavigate } from 'react-router-dom';
import './teamCard.css';

export default function TeamCard({ team }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/teams/${team._id}/players`);
  };
  return (
    <div className="team-card" onClick={handleClick}>
      <div className="team-header">
        <h3 className="team-name">{team.teamName}</h3>
        <span className="team-players-count">{team.players.length} players</span>
      </div>
      <div className="team-stats">
        <div className="stat">
          <span className="stat-label">Budget</span>
          <span className="stat-value">{formatCurrency(team.balance)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Initial</span>
          <span className="stat-value">{formatCurrency(team.initialBalance)}</span>
        </div>
      </div>
      <div className="team-categories">
        {Object.entries(team.categoryCounts || {}).map(([category, count]) => (
          <div key={category} className="category-item">
            <span className="category-name">{category}</span>
            <span className="category-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
