import { useEffect, useState } from 'react';
import './soldBanner.css';

export default function SoldBanner({ playerName, teamName, soldPrice }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!playerName) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [playerName]);

  if (!playerName || !visible) return null;

  return (
  <div className="sold-banner">
    <div className="sold-card">

      <div className="sold-badge">SOLD</div>

      <h2 className="sold-title">🎉 Player Sold</h2>

      <h1 className="player-name">{playerName}</h1>

      <p className="team-name">
        Sold to <span>{teamName}</span>
      </p>

      <div className="sold-price">
        ₹{soldPrice} <span>Cr</span>
      </div>

    </div>
  </div>
);
}
