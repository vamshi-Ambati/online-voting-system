import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVoteYea,
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaUserShield,
  FaVenusMars,
  FaCalendarAlt,
  FaMobileAlt,
  FaCamera,
  FaTimesCircle,
  FaIdCard,
  FaAsterisk,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";
import apiUrl from "../apiUrl";

export default function VotingRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    voterId: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "voter",
    gender: "",
    dob: "",
    aadhaar: "",
    mobile: "",
    pin: "",
  });

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [canVerifyEmail, setCanVerifyEmail] = useState(false);

  const [mobileVerificationSent, setMobileVerificationSent] = useState(false);
  const [mobileVerificationCode, setMobileVerificationCode] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isSendingMobileOTP, setIsSendingMobileOTP] = useState(false);
  const [isVerifyingMobileOTP, setIsVerifyingMobileOTP] = useState(false);
  const [canVerifyMobile, setCanVerifyMobile] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email") {
      setEmailVerified(false);
      setEmailVerificationSent(false);
      setVerificationCode("");
      setCanVerifyEmail(false);
    }

    if (name === "mobile") {
      setMobileVerified(false);
      setMobileVerificationSent(false);
      setMobileVerificationCode("");
      setCanVerifyMobile(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedPhoto(file);
  };

  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
  };

  const handleSendVerification = async () => {
    if (!formData.email) {
      toast.error("Enter a valid email to send verification");
      return;
    }
    try {
      setIsSendingVerification(true);
      const res = await fetch(`${apiUrl}/voter/send-email-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send verification email");
      toast.success("Verification email sent! Check your inbox.");
      setEmailVerificationSent(true);
      setCanVerifyEmail(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      toast.error("Enter verification code");
      return;
    }
    try {
      setIsVerifyingEmail(true);
      const res = await fetch(`${apiUrl}/voter/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      toast.success("Email verified!");
      setEmailVerified(true);
      setCanVerifyEmail(false);
    } catch (err) {
      toast.error(err.message);
      setEmailVerified(false);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendMobileOTP = async () => {
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    try {
      setIsSendingMobileOTP(true);
      const res = await fetch(`${apiUrl}/voter/send-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send mobile OTP");
      toast.success("OTP sent to your mobile number.");
      setMobileVerificationSent(true);
      setCanVerifyMobile(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingMobileOTP(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileVerificationCode.trim()) {
      toast.error("Enter the OTP");
      return;
    }
    try {
      setIsVerifyingMobileOTP(true);
      const res = await fetch(`${apiUrl}/voter/verify-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.mobile,
          otp: mobileVerificationCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      toast.success("Mobile number verified!");
      setMobileVerified(true);
      setCanVerifyMobile(false);
    } catch (err) {
      toast.error(err.message);
      setMobileVerified(false);
    } finally {
      setIsVerifyingMobileOTP(false);
    }
  };

  const validateForm = () => {
    if (!uploadedPhoto) return "A photo is required for face verification.";
    if (!formData.firstName.trim() || formData.firstName.length < 2)
      return "Enter a valid first name";
    if (!formData.lastName.trim() || formData.lastName.length < 2)
      return "Enter a valid last name";
    if (!formData.voterId.trim()) return "Voter ID is required";
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      return "Enter a valid email";
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
      return "Enter a valid 10-digit mobile number";
    if (!formData.password || formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (!formData.gender) return "Gender is required";
    if (!formData.dob) return "Date of birth is required";
    if (!formData.aadhaar.trim() || !/^\d{12}$/.test(formData.aadhaar))
      return "Enter a valid 12-digit Aadhaar number";
    if (formData.role === "admin" && formData.pin !== "vamshi")
      return "Incorrect or missing Admin PIN";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    if (!uploadedPhoto) {
      toast.error("Please upload a photo");
      return;
    }
    setIsLoading(true);

    const data = new FormData();
    for (const key in formData) {
      if (key !== "confirmPassword") {
        data.append(key, formData[key]);
      }
    }
    data.append("photo", uploadedPhoto);

    try {
      const response = await fetch(`${apiUrl}/voter/register`, {
        method: "POST",
        body: data,
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.message || "Registration failed");
      toast.success("Registration successful!");
      setRegisterSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-header">
            <div className="vote-icon">
              <FaVoteYea />
            </div>
            <h1 className="register-title">Secure Voting Portal</h1>
            <p className="register-subtitle">Create your voting account</p>
          </div>

          <div className="register-form">
            {registerSuccess ? (
              <div className="success-message">
                <div className="success-content">
                  <FaCheckCircle className="success-icon" />
                  <div>
                    <p className="success-text">
                      Registration successful! Redirecting to login...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Photo Upload */}
                <label className="form-label photo-upload-label-text">
                  Profile Photo* (For Face Verification)
                </label>
                <div className="photo-upload-container">
                  {!uploadedPhoto && (
                    <label
                      htmlFor="photo-upload-input"
                      className="photo-upload-placeholder"
                    >
                      <FaCamera className="upload-icon" />
                      <span className="upload-text">Upload Photo</span>
                      <input
                        type="file"
                        id="photo-upload-input"
                        className="photo-upload-input"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        required
                      />
                    </label>
                  )}
                  {uploadedPhoto && (
                    <div className="photo-preview-container">
                      <img
                        src={URL.createObjectURL(uploadedPhoto)}
                        alt="Uploaded Profile"
                        className="photo-preview-image"
                      />
                      <button
                        type="button"
                        className="photo-remove-button"
                        onClick={handleRemovePhoto}
                        aria-label="Remove uploaded photo"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  )}
                </div>

                {/* Name and Voter ID row */}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label className="form-label">First Name*</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field third-width">
                    <label className="form-label">Last Name*</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field third-width">
                    <label className="form-label">Voter ID*</label>
                    <div className="input-with-icon">
                      <FaIdCard className="input-icon" />
                      <input
                        type="text"
                        name="voterId"
                        value={formData.voterId}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Voter ID"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Gender, DOB, Aadhaar row */}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label className="form-label">Gender*</label>
                    <div className="input-with-icon">
                      <FaVenusMars className="input-icon" />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field third-width">
                    <label className="form-label">Date of Birth*</label>
                    <div className="input-with-icon">
                      <FaCalendarAlt className="input-icon" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field third-width">
                    <label className="form-label">Aadhaar Number*</label>
                    <div className="input-with-icon">
                      <FaAsterisk className="input-icon" />
                      <input
                        type="text"
                        name="aadhaar"
                        value={formData.aadhaar}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="12-digit Aadhaar number"
                        maxLength="12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile number and OTP */}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label className="form-label">Mobile Number*</label>
                    <div className="input-with-icon">
                      <FaMobileAlt className="input-icon" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>

                  <div
                    className="form-field third-width"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <label className="form-label">Mobile OTP*</label>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={mobileVerificationCode}
                      onChange={(e) =>
                        setMobileVerificationCode(e.target.value)
                      }
                      disabled={mobileVerified || !canVerifyMobile}
                      className="form-input"
                      required
                    />
                  </div>

                  <div
                    className="form-field third-width"
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleSendMobileOTP}
                      disabled={isSendingMobileOTP || mobileVerified}
                      className="small-button"
                      style={{ flex: "1" }}
                    >
                      {isSendingMobileOTP
                        ? "Sending..."
                        : mobileVerificationSent
                        ? "Resend"
                        : "Send OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyMobileOTP}
                      disabled={
                        isVerifyingMobileOTP ||
                        mobileVerified ||
                        !canVerifyMobile
                      }
                      className="small-button verify-button"
                      style={{ flex: "1" }}
                    >
                      {isVerifyingMobileOTP ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>

                {/* Email and Verification */}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label className="form-label">Email*</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field third-width">
                    <label className="form-label">Email Verification*</label>
                    <input
                      type="text"
                      placeholder="Verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={emailVerified || !canVerifyEmail}
                      className="form-input"
                      required
                    />
                  </div>

                  <div
                    className="form-field third-width"
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={isSendingVerification || emailVerified}
                      className="small-button"
                      style={{ flex: 1 }}
                    >
                      {isSendingVerification
                        ? "Sending..."
                        : emailVerificationSent
                        ? "Resend"
                        : "Send code"}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={
                        isVerifyingEmail || emailVerified || !canVerifyEmail
                      }
                      className="small-button verify-button"
                      style={{ flex: 1 }}
                    >
                      {isVerifyingEmail ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label className="form-label">Password*</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Create password"
                        required
                      />
                      <span
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                  <div className="form-field third-width">
                    <label className="form-label">Confirm Password*</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Confirm your password"
                        required
                      />
                      <span
                        className="password-toggle-icon"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account type */}
                <div className="form-field">
                  <label className="form-label">Account Type*</label>
                  <div className="register-role-selection">
                    <div
                      className={`role-option ${
                        formData.role === "voter" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        id="voter"
                        name="role"
                        value="voter"
                        checked={formData.role === "voter"}
                        onChange={handleInputChange}
                        className="role-radio"
                      />
                      <label htmlFor="voter" className="role-label">
                        <FaUser className="role-icon" />
                        <span>Voter</span>
                      </label>
                    </div>
                    <div
                      className={`role-option ${
                        formData.role === "admin" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        id="admin"
                        name="role"
                        value="admin"
                        checked={formData.role === "admin"}
                        onChange={handleInputChange}
                        className="role-radio"
                      />
                      <label htmlFor="admin" className="role-label">
                        <FaUserShield className="role-icon" />
                        <span>Administrator</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Admin PIN for admin role */}
                {formData.role === "admin" && (
                  <div className="form-row">
                    <div className="form-field third-width">
                      <label className="form-label">Admin PIN*</label>
                      <div className="input-with-icon">
                        <FaLock className="input-icon" />
                        <input
                          type={showPin ? "text" : "password"}
                          name="pin"
                          value={formData.pin}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter admin PIN"
                          required
                        />
                        <span
                          className="password-toggle-icon"
                          onClick={() => setShowPin(!showPin)}
                          style={{ cursor: "pointer" }}
                        >
                          {showPin ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="register-submit-button"
                >
                  {isLoading ? (
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      Registering...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}
            <div className="form-footer">
              <p className="footer-text">
                Already have an account?{" "}
                <button
                  className="register-link"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </p>
              <p className="privacy-text">
                By registering, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
