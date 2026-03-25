import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
// import Chatbot from './Chatbot';

const Home = () => {
  const [email, setEmail] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleViewDemo = () => {
    setShowVideo(true);
  };

  const closeVideo = () => {
    setShowVideo(false);
  };

  return (
    <div className="voting-app">
      <div style={{ position: "fixed", top: 16, right: 24, zIndex: 1000 }}>
        {/* <LanguageSwitcher /> */}
      </div>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.subtitle")}</p>
          <div className="hero-buttons">
            <button className="cta-button" onClick={handleGetStarted}>
              {t("hero.getStarted")}
            </button>
            <button className="secondary-button" onClick={handleViewDemo}>
              {t("hero.viewDemo")}
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="voting-illustration">
            <div className="voting-card">
              <div className="vote-checkmark">✓</div>
            </div>
            <div className="shield-icon">🛡️</div>
            <div className="lock-icon">🔒</div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal">
          <div className="video-content">
            <button className="close-button" onClick={closeVideo}>
              &times;
            </button>
            <video width="800" controls autoPlay>
              <source src="/demo.mp4" type="video/mp4" />
              {t("video.unsupported")}
            </video>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>{t("features.heading")}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>{t("features.verifiable")}</h3>
              <p>{t("features.verifiableDesc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>{t("features.mobile")}</h3>
              <p>{t("features.mobileDesc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>{t("features.analytics")}</h3>
              <p>{t("features.analyticsDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <i className="fas fa-vote-yea"></i>
                <span>SecureVote</span>
              </div>
              <p>{t("footer.tagline")}</p>
            </div>

            <div className="footer-section">
              <h3>{t("footer.company")}</h3>
              <ul>
                <li>
                  <a href="#about">{t("footer.about")}</a>
                </li>
                <li>
                  <a href="#careers">{t("footer.careers")}</a>
                </li>
                <li>
                  <a href="#contact">{t("footer.contact")}</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>{t("footer.resources")}</h3>
              <ul>
                <li>
                  <a href="#blog">{t("footer.blog")}</a>
                </li>
                <li>
                  <a href="#docs">{t("footer.docs")}</a>
                </li>
                <li>
                  <a href="#support">{t("footer.support")}</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>{t("footer.legal")}</h3>
              <ul>
                <li>
                  <a href="#privacy">{t("footer.privacy")}</a>
                </li>
                <li>
                  <a href="#terms">{t("footer.terms")}</a>
                </li>
                <li>
                  <a href="#compliance">{t("footer.compliance")}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>{t("footer.rights")}</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
