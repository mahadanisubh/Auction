import "./auctionTeamsTable.css";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function AuctionTeamsTable({ teams = [], currentLeaderId }) {

  if (!teams.length) {
    return (
      <div className="teams-table-container">
        <p>No teams in this auction</p>
      </div>
    );
  }

  return (
    <div className="teams-table-container">

      <h3 className="teams-table-title">Auction Teams</h3>

      <table className="teams-table">

        <thead>
          <tr>
            <th>Team</th>
            <th>WK</th>
            <th>BAT</th>
            <th>BOWL</th>
            <th>AR</th>
            <th>Balance(Cr)</th>
          </tr>
        </thead>

        <tbody>

          {teams.map((team) => {

            const isLeader =
              currentLeaderId &&
              team._id?.toString() === currentLeaderId?.toString();

            return (
              <tr
                key={team._id}
                className={isLeader ? "leader-row" : ""}
              >

                <td className="team-name">
                  {team.teamName}
                  {isLeader && <span className="leader-dot"></span>}
                </td>

                <td>{team.categoryCounts?.wicketkeeper || 0}</td>
                <td>{team.categoryCounts?.batsman || 0}</td>
                <td>{team.categoryCounts?.bowler || 0}</td>
                <td>{team.categoryCounts?.allrounder || 0}</td>

                <td className="team-balance">
                  {formatCurrency(team.balance || 0)}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}