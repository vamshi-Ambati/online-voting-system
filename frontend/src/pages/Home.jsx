import React, { useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot"; // <-- ADD THIS

const Home = () => {
  const [email, setEmail] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();

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
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Modern, Secure Online Voting</h1>
          <p>
            SecureVote provides a transparent, accessible, and verifiable voting
            platform for organizations and institutions.
          </p>
          <div className="hero-buttons">
            <button className="cta-button" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="secondary-button" onClick={handleViewDemo}>
              View Demo
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
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Why Choose SecureVote?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Verifiable Results</h3>
              <p>
                Verify your vote was counted correctly without compromising
                anonymity.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Mobile Accessibility</h3>
              <p>Vote from anywhere using our responsive mobile platform.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Real-time Analytics</h3>
              <p>
                Monitor election progress with live result tracking and
                analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Security Section */}
      {/* <section className="security">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2>Advanced Security Measures</h2>
              <p>
                Our platform utilizes cutting-edge technology to ensure the
                integrity of every election:
              </p>
              <ul>
                <li>
                  <i className="fas fa-user-shield"></i> Voter identity
                  protection
                </li>
                <li>
                  <i className="fas fa-clipboard-check"></i> Transparent audit
                  trails
                </li>
              </ul>
            </div>

            <div className="security-visual">
              <div className="encryption-animation">
                <div className="data-block">Vote Data</div>
                <div className="encryption-process">
                  <i className="fas fa-long-arrow-alt-right"></i>
                  <div className="lock-icon">🔒</div>
                  <i className="fas fa-long-arrow-alt-right"></i>
                </div>
                <div className="encrypted-block">Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      {/* Newsletter Section */}
      {/* <section className="newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>
            Subscribe to our newsletter for updates on new features and election
            best practices.
          </p>

          <form onSubmit={handleSubscribe} className="subscribe-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section> */}
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <i className="fas fa-vote-yea"></i>
                <span>SecureVote</span>
              </div>
              <p>
                Making democratic processes accessible, secure, and transparent
                for everyone.
              </p>
            </div>

            <div className="footer-section">
              <h3>Company</h3>
              <ul>
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#docs">Documentation</a>
                </li>
                <li>
                  <a href="#support">Support</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Legal</h3>
              <ul>
                <li>
                  <a href="#privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="#terms">Terms of Service</a>
                </li>
                <li>
                  <a href="#compliance">Compliance</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2023 SecureVote. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Floating Chatbot */}
      {/* <Chatbot /> */}
    </div>
  );
};

export default Home;
