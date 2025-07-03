import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../components/Navbar.css";
import voteImage from "/images/vote2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    const voter = JSON.parse(localStorage.getItem("voter"));
    if (voter && voter.id) {
      localStorage.removeItem(`votedCandidateId_${voter.id}`);
    }
    localStorage.removeItem("voter");
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  return (
    <div className="container">
      <div className="logo-name">
        <NavLink to="/" onClick={handleNavClick}>
          <img src={voteImage} alt="Vote Logo" className="logo-img" />
        </NavLink>
        <NavLink to="/" onClick={handleNavClick}>
          ONLINE VOTING SYSTEM
        </NavLink>
      </div>

      {/* Navigation Menu */}
      <div className={`nav${menuOpen ? " open" : ""}`}>
        <nav>
          <ul>
            <li>
              <NavLink to="/" onClick={handleNavClick}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" onClick={handleNavClick}>Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/results" onClick={handleNavClick}>Results</NavLink>
            </li>
            <li>
              <NavLink to="/candidates" onClick={handleNavClick}>Candidates</NavLink>
            </li>
            <li>
              {isLoggedIn ? (
                <button className="button" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <NavLink to="/login" onClick={handleNavClick}>
                  <button className="button">Login</button>
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Hamburger menu icon */}
      <div
        className={`hamburger${menuOpen ? " active" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        tabIndex={0}
        role="button"
      >
        <span />
        <span />
        <span />
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && <div className="nav-overlay" onClick={handleNavClick}></div>}
    </div>
  );
};

export default Navbar;
