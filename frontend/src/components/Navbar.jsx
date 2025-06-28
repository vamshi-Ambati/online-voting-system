import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../components/Navbar.css";
import voteImage from "/images/vote2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token"); // Check if token exists

  const handleLogout = () => {
    // Remove token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("voter");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="logo-name">
        <NavLink to="/">
          <img src={voteImage} alt="Vote Logo" className="logo-img" />
        </NavLink>
        <NavLink to="/">ONLINE VOTING SYSTEM</NavLink>
      </div>
      <div className="nav">
        <nav>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/results">Results</NavLink>
            </li>
            <li>
              <NavLink to="/candidates">Candidates</NavLink>
            </li>
            <li>
              {isLoggedIn ? (
                <button className="button" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <NavLink to="/login">
                  <button className="button">Login</button>
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
      {/* Static Hamburger menu icon (no functionality) */}
      <div className="hamburger">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default Navbar;
