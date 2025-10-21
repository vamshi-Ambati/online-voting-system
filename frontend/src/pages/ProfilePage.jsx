import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import { FaUserCircle } from "react-icons/fa";
import apiUrl from "../apiUrl";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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

  /* ---------- Format & Reverse Date ---------- */
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid date";
    }
  };

  const reverseFormatDate = (formattedDate) => {
    if (!formattedDate) return "";
    const parts = formattedDate.split("/");
    if (parts.length !== 3) return formattedDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  /* ---------- Load User Data ---------- */
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) throw new Error("No user data found. Please log in.");

        const userData = JSON.parse(storedUser);
        if (!userData) throw new Error("Invalid user data format.");

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  /* ---------- Handle Input Changes ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- Handle File Upload ---------- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  /* ---------- Submit Profile Update ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem("authToken");
      const userData = JSON.parse(localStorage.getItem("userData"));

      if (!authToken || !userData?._id)
        throw new Error("Session expired. Please log in again.");

      const form = new FormData();
      form.append("userId", userData._id);
      form.append("firstName", formData.firstName);
      form.append("middleName", formData.middleName);
      form.append("lastName", formData.lastName);
      form.append("email", formData.email);
      form.append("dob", formData.dob);
      form.append("gender", formData.gender);
      form.append("mobile", formData.mobile);

      if (selectedFile) form.append("photo", selectedFile);

      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Update failed");

      toast.success("Profile updated successfully!");
      localStorage.setItem("userData", JSON.stringify(result.user));
      setUser(result.user);
      setEditMode(false);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Error updating profile");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    toast.info("Password change feature coming soon.");
    setShowChangePassword(false);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">No user data available</div>;

  /* ---------- JSX ---------- */
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          {/* ✅ Passport-style image display */}
          {previewImage ? (
            <img src={previewImage} alt="Preview" className="profile-photo" />
          ) : user.photo?.url ? (
            <img
              src={user.photo.url}
              alt="User Avatar"
              className="profile-photo"
            />
          ) : (
            <FaUserCircle className="profile-avatar blue-avatar" />
          )}

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

        {/* ---------- Edit Profile ---------- */}
        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <h3 className="section-title">Personal Information</h3>

            {/* Photo Upload */}
            <div className="form-group">
              <label>Profile Photo (Passport Style)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

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
                  setPreviewImage(null);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : showChangePassword ? (
          /* ---------- Change Password ---------- */
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
          /* ---------- Profile Info Display ---------- */
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
