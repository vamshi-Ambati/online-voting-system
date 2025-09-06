import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../components/Navbar.css";
import voteImage from "/images/vote2.png";
import { FaUserCircle, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  // Effect to handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Effect to sync login state
  useEffect(() => {
    const syncAuthState = () => {
      const authToken = localStorage.getItem("authToken");
      const voter = authToken
        ? JSON.parse(localStorage.getItem("userData"))
        : null;

      setIsLoggedIn(!!authToken);
      setUserData(voter);
      setUserRole(voter?.role || null);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    setMenuOpen(false);

    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, [location]);

  const handleLogout = () => {
    const voter = JSON.parse(localStorage.getItem("userData"));
    if (voter && voter.id) {
      localStorage.removeItem(`votedCandidateId_${voter.id}`);
    }
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="logo-name">
          <NavLink to="/" onClick={handleNavClick} className="logo-link">
            <img src={voteImage} alt="Vote Logo" className="logo-img" />
            <span className="logo-text"> SecureVote</span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            <li>
              <NavLink to="/" onClick={handleNavClick}>
                Home
              </NavLink>
            </li>

            {isLoggedIn && (
              <>
                {userRole === "admin" ? (
                  <>
                    <li>
                      <NavLink to="/results" onClick={handleNavClick}>
                        Results
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard" onClick={handleNavClick}>
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/candidates" onClick={handleNavClick}>
                        Candidates
                      </NavLink>
                    </li>
                    {/* <li>
                      <NavLink to="/polls" onClick={handleNavClick}>
                        Polls
                      </NavLink>
                    </li> */}
                  </>
                ) : (
                  <>
                    <li>
                      <NavLink to="/candidates" onClick={handleNavClick}>
                        Candidates
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard" onClick={handleNavClick}>
                        Dashboard
                      </NavLink>
                    </li>
                    {/* <li>
                      <NavLink to="/polls" onClick={handleNavClick}>
                        Polls
                      </NavLink>
                    </li> */}
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          {isLoggedIn ? (
            <div className="user-dropdown-container">
              <button
                className="user-profile-btn"
                onClick={toggleDropdown}
                aria-label="User profile"
              >
                <FaUserCircle className="user-icon" />
                <span className="user-name">{userData?.name || "User"}</span>
                <FaChevronDown
                  className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <NavLink
                    to="/profile"
                    className="dropdown-item"
                    onClick={handleNavClick}
                  >
                    <FaUserCircle /> My Profile
                  </NavLink>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="login-btn">
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav${menuOpen ? " open" : ""}`}>
          <nav>
            <ul>
              <li>
                <NavLink to="/" onClick={handleNavClick}>
                  Home
                </NavLink>
              </li>
              {isLoggedIn && (
                <>
                  {userRole === "admin" ? (
                    <>
                      <li>
                        <NavLink to="/results" onClick={handleNavClick}>
                          Results
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/dashboard" onClick={handleNavClick}>
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/candidates" onClick={handleNavClick}>
                          Candidates
                        </NavLink>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <NavLink to="/candidates" onClick={handleNavClick}>
                          Candidates
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/dashboard" onClick={handleNavClick}>
                          Dashboard
                        </NavLink>
                      </li>
                    </>
                  )}
                  <li>
                    <NavLink to="/profile" onClick={handleNavClick}>
                      My Profile
                    </NavLink>
                  </li>
                  <li>
                    <button
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
              {!isLoggedIn && (
                <li>
                  <NavLink to="/login" onClick={handleNavClick}>
                    Login
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Hamburger menu icon */}
        <div
          className={`hamburger${menuOpen ? " active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          tabIndex={0}
          role="button"
        >
          <span />
          <span />
          <span />
        </div>

        {/* Overlay for mobile menu */}
        {menuOpen && (
          <div className="nav-overlay" onClick={handleNavClick}></div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
