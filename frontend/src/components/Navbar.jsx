import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../components/Navbar.css";
import voteImage from "/images/vote2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token"); // Check if token exists

  const handleLogout = () => {
    // Remove token and user info from localStorage
    const voter = JSON.parse(localStorage.getItem("voter"));
    if (voter && voter.id) {
      localStorage.removeItem(`votedCandidateId_${voter.id}`);
    }
    localStorage.removeItem("voter");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="logo-name">
        <NavLink to="/">
          <img src={voteImage} alt="Vote Logo" className="logo-img" />
        </NavLink>
        <NavLink to="/">ONLINE VOTING SYSTEM</NavLink>
        {/* <NavLink>eVote</NavLink> */}
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
