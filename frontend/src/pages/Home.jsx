import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    navigate("/candidates");
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Welcome to <span className="brand">eVote</span>
          </h1>
          <p>
            Secure, transparent, and accessible online voting for everyone.
            <br />
            <span className="highlight">
              Your vote matters. Make it count with confidence.
            </span>
          </p>
          <button className="cta-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://img.freepik.com/free-vector/election-concept-illustration_114360-5865.jpg?w=826&t=st=1719936000~exp=1719936600~hmac=7a7f1b5d9c2e9a7e7f7b7c5e7a1c5d6e"
            alt="Voting Illustration"
          />
        </div>
      </section>

      <section className="features" id="features">
        <h2>
          Why Choose <span className="brand">eVote</span>?
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🔒 Secure</h3>
            <p>
              End-to-end encryption and robust authentication protect your vote.
            </p>
          </div>
          <div className="feature-card">
            <h3>🌐 Accessible</h3>
            <p>Vote from anywhere, on any device, at your convenience.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Transparent</h3>
            <p>
              Track your vote and see real-time results with full transparency.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} <span className="brand">eVote</span>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
