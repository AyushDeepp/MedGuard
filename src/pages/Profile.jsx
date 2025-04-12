import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    sex: '',
    phone: '',
    address: '',
    medicalConditions: '',
    allergies: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        sex: user.sex || '',
        phone: user.phone || '',
        address: user.address || '',
        medicalConditions: user.medicalConditions || '',
        allergies: user.allergies || '',
        password: '',
        confirmPassword: '',
      });

      // Fetch user's reports
      const fetchReports = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/reports/user', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setReports(response.data);
        } catch (error) {
          console.error('Error fetching reports:', error);
        }
      };

      fetchReports();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    // Validate passwords if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Prepare data for update (exclude confirmPassword)
    const updateData = { ...formData };
    delete updateData.confirmPassword;
    
    // Don't send empty password
    if (!updateData.password) {
      delete updateData.password;
    }

    const result = await updateProfile(updateData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
      // Clear password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="profile-container">
      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <h1>User Profile</h1>
          {!isEditing && (
            <motion.button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Profile
            </motion.button>
          )}
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sex">Sex</label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medicalConditions">Medical Conditions</label>
              <textarea
                id="medicalConditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-buttons">
              <motion.button 
                type="submit"
                className="save-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
              
              <motion.button 
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to current user data
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      age: user.age || '',
                      sex: user.sex || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      medicalConditions: user.medicalConditions || '',
                      allergies: user.allergies || '',
                      password: '',
                      confirmPassword: '',
                    });
                  }
                  setMessage({ type: '', text: '' });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-section">
              <h2>Personal Information</h2>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.name || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{user?.age || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sex:</span>
                <span className="detail-value">{user?.sex || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h2>Contact Information</h2>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{user?.address || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h2>Medical Information</h2>
              <div className="detail-row">
                <span className="detail-label">Medical Conditions:</span>
                <span className="detail-value">{user?.medicalConditions || 'None'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Allergies:</span>
                <span className="detail-value">{user?.allergies || 'None'}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;