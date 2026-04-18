import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import { createPlayer } from '../../api/auctionApi.js';
import './organizer.css';

export default function PlayerEntry() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    playerName: '',
    category: 'batsman',
    basePrice: '',
    image: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('')
    setSuccess('')
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.playerName || !formData.basePrice) {
        throw new Error('Please fill all fields');
      }

      await createPlayer({...formData, basePrice: Number(formData.basePrice)});
      setSuccess('Player added successfully!');
      setFormData({
        playerName: '',
        category: 'batsman',
        basePrice: '',
        image: null
      });

      setTimeout(() => navigate('/organizer/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="organizer-page">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/organizer/dashboard')}>← Back</button>
          <h1>Add New Player</h1>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="playerName">Player Name *</label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              required
              placeholder="Enter player name"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="wicketkeeper">Wicket-keeper</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="basePrice">Base Price (₹) *</label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="1"
                placeholder="Enter base price"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Player Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="form-input"
            />
            {formData.image && (
              <p className="file-info">Selected: {formData.image.name}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </form>
      </div>
    </>
  );
}
