import TeamCard from './TeamCard.jsx';
import './teamList.css';

export default function TeamList({ teams, isLoading }) {
  if (isLoading) {
    return <div className="team-list-loading">Loading teams...</div>;
  }

  if (!teams || teams.length === 0) {
    return <div className="team-list-empty">No teams created yet</div>;
  }

  return (
    <div className="team-list">
      {teams.map(team => (
        <TeamCard key={team._id} team={team} />
      ))}
    </div>
  );
}
