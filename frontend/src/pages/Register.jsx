import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";
import apiUrl from "../apiUrl";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate"); // Default role

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/voter/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json();

      if (response.ok) {
        // Show Vote ID in a toast (or use alert if you prefer)
        if (data.voter && data.voter.voteId) {
          toast.info(`Your Vote ID is: ${data.voter.voteId}`, {
            autoClose: 30000, // Show for 30 seconds
            position: "top-center",
          });
        }
        toast.success(`Registration successful!`,{
          autoClose: 1000, // Show for 1 second
        });

        // Optionally, you can delay navigation so user sees the toast
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data?.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred while registering.");
    }
  };

  return (
    <div className="register">
      <div className="register-container">
        <h1>Register</h1>
        <form onSubmit={handleRegister}>
          {/* Username Input with Icon */}
          <div className="input-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {/* Email Input with Icon */}
          <div className="input-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password Input with Icon */}
          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Role Selection */}
          <div className="input-group">
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="role-select"
            >
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="register-btn">
            <FaSignInAlt />
            Register
          </button>
        </form>
        <div className="register-links">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
