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
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";
import apiUrl from "../apiUrl";

export default function VotingRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "voter",
    gender: "",
    dob: "",
    mobile: "",
    pin: "",
  });

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [generatedVoterId, setGeneratedVoterId] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [canVerifyEmail, setCanVerifyEmail] = useState(false);

  // New state for mobile OTP verification
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
      setErrors((prev) => ({ ...prev, otp: "" }));
      setCanVerifyEmail(false);
    }

    // Reset mobile verification state when mobile number changes
    if (name === "mobile") {
      setMobileVerified(false);
      setMobileVerificationSent(false);
      setMobileVerificationCode("");
      setErrors((prev) => ({ ...prev, mobileOtp: "" }));
      setCanVerifyMobile(false);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedPhoto(file);
      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: "" }));
      }
    }
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
      setErrors((prev) => ({ ...prev, otp: "" }));
      setCanVerifyEmail(false);
    } catch (err) {
      toast.error(err.message);
      setEmailVerified(false);
      setErrors((prev) => ({ ...prev, otp: "Verification failed" }));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // New handler for sending mobile OTP
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

  // New handler for verifying mobile OTP
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
      setErrors((prev) => ({ ...prev, mobileOtp: "" }));
      setCanVerifyMobile(false);
    } catch (err) {
      toast.error(err.message);
      setMobileVerified(false);
      setErrors((prev) => ({ ...prev, mobileOtp: "OTP verification failed" }));
    } finally {
      setIsVerifyingMobileOTP(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!uploadedPhoto) {
      newErrors.photo = "A photo is required for face verification.";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!emailVerified) {
      newErrors.otp = "Please verify your email address.";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (!mobileVerified) {
      newErrors.mobileOtp = "Please verify your mobile number.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }
    if (formData.role === "admin") {
      if (!formData.pin) {
        newErrors.pin = "Admin PIN is required";
      } else if (formData.pin !== "vamshi") {
        newErrors.pin = "Incorrect PIN";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
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
      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed");
      }

      setRegisterSuccess(true);
      if (formData.role === "voter") {
        setGeneratedVoterId(responseData.voterId);
      } else {
        toast.success("Admin registration complete!");
      }

      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.message.includes("Email already registered")) {
        toast.error("This email is already in use");
        setErrors({ email: "Email already registered" });
      } else if (error.message.includes("Mobile number already registered")) {
        toast.error("This mobile number is already in use");
        setErrors({ mobile: "Mobile number already registered" });
      } else if (error.message.includes("unique Voter ID")) {
        toast.error("Please try registering again");
      } else {
        toast.error(error.message || "Registration failed");
      }
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
                      Registration successful!{" "}
                      {formData.role === "voter" && "Your voter ID is:"}
                    </p>
                    {formData.role === "voter" && (
                      <div className="voter-id-display">{generatedVoterId}</div>
                    )}
                    <p className="success-note">
                      {formData.role === "voter"
                        ? "Please save this ID. You'll need it to login."
                        : "Your account will be verified by an administrator before you can login."}
                    </p>
                    <p className="redirect-text">
                      Redirecting to login page in 5 seconds...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="form-label photo-upload-label-text">
                  Profile Photo* (For Face Verification)
                </label>
                <div className="photo-upload-container">
                  {!uploadedPhoto && (
                    <>
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
                    </>
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
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  )}
                </div>
                {errors.photo && (
                  <div className="error-message photo-error">
                    {errors.photo}
                  </div>
                )}
                <div className="form-row">
                  <div className="form-field third-width">
                    <label htmlFor="firstName" className="form-label">
                      First Name*
                    </label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`form-input ${
                          errors.firstName ? "error" : ""
                        }`}
                        placeholder="First name"
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <div className="error-message">{errors.firstName}</div>
                    )}
                  </div>
                  <div className="form-field third-width">
                    <label htmlFor="middleName" className="form-label">
                      Middle Name
                    </label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Middle name (optional)"
                      />
                    </div>
                  </div>
                  <div className="form-field third-width">
                    <label htmlFor="lastName" className="form-label">
                      Last Name*
                    </label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`form-input ${
                          errors.lastName ? "error" : ""
                        }`}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    {errors.lastName && (
                      <div className="error-message">{errors.lastName}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field third-width">
                    <label htmlFor="gender" className="form-label">
                      Gender*
                    </label>
                    <div className="input-with-icon">
                      <FaVenusMars className="input-icon" />
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`form-input ${errors.gender ? "error" : ""}`}
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
                    {errors.gender && (
                      <div className="error-message">{errors.gender}</div>
                    )}
                  </div>
                  <div className="form-field third-width">
                    <label htmlFor="dob" className="form-label">
                      Date of Birth*
                    </label>
                    <div className="input-with-icon">
                      <FaCalendarAlt className="input-icon" />
                      <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className={`form-input ${errors.dob ? "error" : ""}`}
                        required
                      />
                    </div>
                    {errors.dob && (
                      <div className="error-message">{errors.dob}</div>
                    )}
                  </div>
                  <div className="form-field third-width">
                    <label htmlFor="mobile" className="form-label">
                      Mobile Number*
                    </label>
                    <div className="input-with-icon">
                      <FaMobileAlt className="input-icon" />
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className={`form-input ${errors.mobile ? "error" : ""}`}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        required
                      />
                    </div>
                    {errors.mobile && (
                      <div className="error-message">{errors.mobile}</div>
                    )}
                  </div>
                </div>

                {/* New Mobile OTP Verification Section */}
                <div className="form-row">
                  <div className="form-field full-width email-verification-group">
                    <label className="form-label">Mobile Verification*</label>
                    <div className="email-verification-controls">
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={mobileVerificationCode}
                        onChange={(e) =>
                          setMobileVerificationCode(e.target.value)
                        }
                        disabled={mobileVerified || !canVerifyMobile}
                        className={`form-input ${
                          errors.mobileOtp ? "error" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendMobileOTP}
                        disabled={isSendingMobileOTP || mobileVerified}
                        className="small-button"
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
                      >
                        {isVerifyingMobileOTP ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                    {errors.mobileOtp && (
                      <div className="error-message">{errors.mobileOtp}</div>
                    )}
                    {mobileVerified && (
                      <div
                        className="success-message"
                        style={{ marginTop: "5px" }}
                      >
                        Mobile number verified successfully!
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field third-width">
                    <label htmlFor="email" className="form-label">
                      Email*
                    </label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="error-message">{errors.email}</div>
                    )}
                  </div>

                  <div className="form-field third-width">
                    <label htmlFor="password" className="form-label">
                      Password*
                    </label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`form-input ${
                          errors.password ? "error" : ""
                        }`}
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
                    {errors.password && (
                      <div className="error-message">{errors.password}</div>
                    )}
                  </div>
                  <div className="form-field third-width">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password*
                    </label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input ${
                          errors.confirmPassword ? "error" : ""
                        }`}
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
                    {errors.confirmPassword && (
                      <div className="error-message">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email verification logic is now a separate row below the email input */}
                <div className="form-row">
                  <div className="form-field full-width email-verification-group">
                    <label className="form-label">Email Verification*</label>
                    <div className="email-verification-controls">
                      <input
                        type="text"
                        placeholder="Verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={emailVerified || !canVerifyEmail}
                        className={`form-input ${errors.otp ? "error" : ""}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={isSendingVerification || emailVerified}
                        className="small-button"
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
                      >
                        {isVerifyingEmail ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                    {errors.otp && (
                      <div className="error-message">{errors.otp}</div>
                    )}
                    {emailVerified && (
                      <div
                        className="success-message"
                        style={{ marginTop: "5px" }}
                      >
                        Email verified successfully!
                      </div>
                    )}
                  </div>
                </div>

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
                {formData.role === "admin" && (
                  <div className="form-row">
                    <div className="form-field third-width">
                      <label htmlFor="pin" className="form-label">
                        Admin PIN*
                      </label>
                      <div className="input-with-icon">
                        <FaLock className="input-icon" />
                        <input
                          type={showPin ? "text" : "password"}
                          id="pin"
                          name="pin"
                          value={formData.pin}
                          onChange={handleInputChange}
                          className={`form-input ${errors.pin ? "error" : ""}`}
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
                      {errors.pin && (
                        <div className="error-message">{errors.pin}</div>
                      )}
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
