import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import { FaUserCircle } from "react-icons/fa";
import apiUrl from "../apiUrl"; // Adjust the import based on your project structure
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dob: "",
    gender: "",
    mobile: "",
  });

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  // Convert DD/MM/YYYY back to YYYY-MM-DD for date input
  const reverseFormatDate = (formattedDate) => {
    if (!formattedDate) return "";

    const parts = formattedDate.split("/");
    if (parts.length !== 3) return formattedDate;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          throw new Error("No user data found. Please log in.");
        }

        const userData = JSON.parse(storedUser);
        if (!userData) {
          throw new Error("Invalid user data format.");
        }

        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          middleName: userData.middleName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          dob: userData.dob ? reverseFormatDate(formatDate(userData.dob)) : "",
          gender: userData.gender || "",
          mobile: userData.mobile || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get user data from storage
      const authToken =
        localStorage.getItem("authToken")
      const userData = JSON.parse(
        localStorage.getItem("userData") 
      );

      if (!userData?._id) {
        throw new Error("Session expired. Please log in again.");
      }

      if (!authToken) {
        throw new Error("Authentication token missing");
      }

      // Prepare update data
      const updateData = {
        userId: userData._id,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        mobile: formData.mobile,
      };
      const storage = localStorage.getItem("authToken")
        ? localStorage
        : sessionStorage;
      // Make API request
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      if (!result.success) {
        throw new Error(result.message || "Update failed");
      }

      // Update local storage

      storage.setItem("userData", JSON.stringify(result.user));

      // Update state
      setUser(result.user);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      toast.error(err.message || "An error occurred");

      if (err.message.includes("session") || err.message.includes("expired")) {
        // Clear invalid session data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");

        // Redirect to login
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Add your password change logic here
    alert("Password change functionality would be implemented here");
    setShowChangePassword(false);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">No user data available</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          <div className="profile-avatar">
            <FaUserCircle className="blue-avatar" />
          </div>
          {!editMode && !showChangePassword && (
            <div className="profile-actions">
              <button className="edit-button" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
              <button
                className="change-password-button"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </button>
            </div>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    firstName: user.firstName || "",
                    middleName: user.middleName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    dob: user.dob
                      ? reverseFormatDate(formatDate(user.dob))
                      : "",
                    gender: user.gender || "",
                    mobile: user.mobile || "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : showChangePassword ? (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <h3 className="section-title">Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                Update Password
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h3 className="section-title">Personal Information</h3>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">
                  {user.firstName}{" "}
                  {user.middleName ? user.middleName + " " : ""}
                  {user.lastName}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{formatDate(user.dob)}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">
                  {user.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "Not specified"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Mobile Number:</span>
                <span className="detail-value">
                  {user.mobile || "Not specified"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "Not specified"}
                </span>
              </div>

              {/* Only show Voter ID if user is not admin */}
              {user.role !== "admin" && (
                <div className="detail-item">
                  <span className="detail-label">Voter ID:</span>
                  <span className="detail-value">
                    {user.voterId || "Not specified"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
