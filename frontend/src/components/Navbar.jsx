import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../components/Navbar.css";
import voteImage from "/images/vote2.png";
import { FaUserCircle, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Sync login state on route change
  useEffect(() => {
    const syncAuthState = () => {
      const authToken = localStorage.getItem("authToken");
      const voter =
        authToken ? JSON.parse(localStorage.getItem("userData")) : null;
      setIsLoggedIn(!!authToken);
      setUserData(voter);
      setUserRole(voter?.role || null);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    setMenuOpen(false);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    const voter = JSON.parse(localStorage.getItem("userData"));
    if (voter?.id) {
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

  // Shared admin nav links
  const AdminLinks = () => (
    <>
      <li>
        <NavLink to="/results" onClick={handleNavClick}>
          {t("nav.results")}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard" onClick={handleNavClick}>
          {t("nav.dashboard")}
        </NavLink>
      </li>
      <li>
        <NavLink to="/candidates" onClick={handleNavClick}>
          {t("nav.candidates")}
        </NavLink>
      </li>
    </>
  );

  // Shared voter nav links
  const VoterLinks = () => (
    <>
      <li>
        <NavLink to="/candidates" onClick={handleNavClick}>
          {t("nav.candidates")}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard" onClick={handleNavClick}>
          {t("nav.dashboard")}
        </NavLink>
      </li>
    </>
  );

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
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
                {t("nav.home")}
              </NavLink>
            </li>

            {isLoggedIn &&
              (userRole === "admin" ? <AdminLinks /> : <VoterLinks />)}
          </ul>
        </nav>

        {/* User Actions + Language Switcher */}
        <div
          className="user-actions"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          {/* Language switcher — visible on desktop */}
          <div className="desktop-lang-switcher">
            <LanguageSwitcher />
          </div>

          {isLoggedIn ?
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
                    <FaUserCircle /> {t("nav.myProfile")}
                  </NavLink>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          : <NavLink to="/login" className="login-btn">
              {t("nav.login")}
            </NavLink>
          }
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav${menuOpen ? " open" : ""}`}>
          <nav>
            <ul>
              <li>
                <NavLink to="/" onClick={handleNavClick}>
                  {t("nav.home")}
                </NavLink>
              </li>

              {isLoggedIn && (
                <>
                  {userRole === "admin" ?
                    <AdminLinks />
                  : <VoterLinks />}
                  <li>
                    <NavLink to="/profile" onClick={handleNavClick}>
                      {t("nav.myProfile")}
                    </NavLink>
                  </li>
                  <li>
                    <button
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      {t("nav.logout")}
                    </button>
                  </li>
                </>
              )}

              {!isLoggedIn && (
                <li>
                  <NavLink to="/login" onClick={handleNavClick}>
                    {t("nav.login")}
                  </NavLink>
                </li>
              )}

              {/* Language switcher inside mobile menu */}
              <li style={{ marginTop: "12px", paddingLeft: "8px" }}>
                <LanguageSwitcher />
              </li>
            </ul>
          </nav>
        </div>

        {/* Hamburger */}
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

        {/* Mobile overlay */}
        {menuOpen && (
          <div className="nav-overlay" onClick={handleNavClick}></div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
