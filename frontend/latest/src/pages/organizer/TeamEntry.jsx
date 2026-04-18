import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar.jsx';
import { createTeam, getAllUsers } from '../../api/auctionApi.js';
import './organizer.css';

export default function TeamEntry() {
  const navigate = useNavigate();
  const {auctionId} = useParams();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    ownerId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [loadingOwners, setLoadingOwners] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await getAllUsers('owner');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch owners', err);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.teamName || !formData.ownerId) {
        throw new Error('Please fill all fields');
      }

      await createTeam({
      teamName: formData.teamName,
      ownerId: formData.ownerId,
      auctionId: auctionId
      });
      setSuccess('Team created successfully!');
      setFormData({
        teamName: '',
        ownerId: ''
      });

      setTimeout(() => navigate('/organizer/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create team');
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
          <h1>Create New Team</h1>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="teamName">Team Name *</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              required
              placeholder="Enter team name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerId">Team Owner *</label>
            {loadingOwners ? (
              <p className="info-text">Loading owners...</p>
            ) : (
              <>
                <select
                  id="ownerId"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select an owner</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="info-text">No team owners available. Please register owners first.</p>
                )}
              </>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || users.length === 0}
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </>
  );
}
