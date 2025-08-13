import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVoteYea,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaUserShield,
  FaSignInAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Login.css";
import apiUrl from "../apiUrl";

export default function VotingLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    credential: "",
    password: "",
    rememberMe: false,
    role: "voter",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

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

    if (!formData.credential.trim()) {
      newErrors.credential =
        formData.role === "admin"
          ? "Email is required"
          : "Voter ID is required";
    } else if (
      formData.role === "admin" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.credential)
    ) {
      newErrors.credential = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    const requestBody = {
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === "admin") {
      requestBody.email = formData.credential;
    } else {
      requestBody.voterId = formData.credential;
    }

    const response = await fetch(`${apiUrl}/voter/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store authentication data
    const storage = formData.rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", data.token);

    // Store complete user data including mobile, gender, and dob
    storage.setItem(
      "userData",
      JSON.stringify({
        _id: data.user.id, // Changed from 'id' to '_id' for consistency
        firstName: data.user.firstName,
        middleName: data.user.middleName || "", // Handle potential undefined
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
        gender: data.user.gender || "", // Handle potential undefined
        dob: data.user.dob || "", // Handle potential undefined
        mobile: data.user.mobile || "", // Handle potential undefined
        voterId: data.user.voterId || "", // Handle potential undefined
      })
    );

    setLoginSuccess(true);
    // toast.success("Login successful!");

    setTimeout(() => {
      navigate(formData.role === "admin" ? "/dashboard" : "/dashboard");
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error.message || "An error occurred during login");

    if (error.message.includes("credentials")) {
      setErrors({
        credential: "Invalid credentials",
        password: "Invalid credentials",
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="vote-icon">
              <FaVoteYea />
            </div>
            <h1 className="login-title">Secure Voting Portal</h1>
            <p className="login-subtitle">Your voice matters - Login to vote</p>
          </div>

          <div className="login-form">
            {loginSuccess && (
              <div className="success-message">
                <div className="success-content">
                  <FaCheckCircle className="success-icon" />
                  <span className="success-text">
                    Login successful! Redirecting...
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Login As</label>
                <div className="login-role-selection">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="voter"
                      checked={formData.role === "voter"}
                      onChange={handleInputChange}
                      className="role-radio"
                    />
                    <div className="role-label">
                      <FaUser className="role-icon" />
                      <span>Voter</span>
                    </div>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={handleInputChange}
                      className="role-radio"
                    />
                    <div className="role-label">
                      <FaUserShield className="role-icon" />
                      <span>Admin</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="credential" className="form-label">
                  {formData.role === "admin" ? "Email Address" : "Voter ID"}
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type={formData.role === "admin" ? "email" : "text"}
                    id="credential"
                    name="credential"
                    value={formData.credential}
                    onChange={handleInputChange}
                    className={`form-input ${errors.credential ? "error" : ""}`}
                    placeholder={
                      formData.role === "admin"
                        ? "Enter admin email"
                        : "Enter your Voter ID"
                    }
                  />
                </div>
                {errors.credential && (
                  <div className="error-message">{errors.credential}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Enter your password"
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

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="remember-checkbox"
                  />
                  <span className="remember-text">Remember me</span>
                </label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-submit-button"
              >
                {isLoading ? (
                  <div className="loading-content">
                    <div className="loading-spinner"></div>
                    Logging in...
                  </div>
                ) : (
                  <>
                    <FaSignInAlt className="login-button-icon" />
                    Login as {formData.role === "admin" ? "Admin" : "Voter"}
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                Don't have an account?{" "}
                <button
                  className="register-link"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </p>
              <p className="privacy-text">
                By logging in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
