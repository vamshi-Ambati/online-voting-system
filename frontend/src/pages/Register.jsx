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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [generatedVoterId, setGeneratedVoterId] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
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

    try {
      const response = await fetch(`${apiUrl}/voter/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          confirmPassword: undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // // Store user data in localStorage
      // const userData = {
      //   id: data.id,
      //   firstName: formData.firstName,
      //   middleName: formData.middleName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   role: formData.role,
      //   gender: formData.gender,
      //   dob: formData.dob,
      //   mobile: formData.mobile,
      //   voterId: data.voterId || null,
      // };
      // localStorage.setItem("userData", JSON.stringify(userData));

      setRegisterSuccess(true);
      if (formData.role === "voter") {
        setGeneratedVoterId(data.voterId);
        // toast.success(
        //   `Registration successful! Your Voter ID: ${data.voterId}`
        // );
      } else {
        toast.success("Admin registration complete!");
      }

      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.message.includes("Email already registered")) {
        toast.error("This email is already in use");
        setErrors({ email: "Email already registered" });
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
                      />
                    </div>
                    {errors.mobile && (
                      <div className="error-message">{errors.mobile}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field third-width">
                    <label htmlFor="email" className="form-label">
                      Email Address*
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
                        placeholder="Your email address"
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
