// Footer.jsx
import React from "react";
import {
  FaShieldAlt,
  FaQuestionCircle,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
// Ensure you install react-icons: npm install react-icons

const currentYear = new Date().getFullYear();
const systemName = "VoteSecure";

const Footer = () => {
  return (
    <footer className="footer-voting-system">
      <div className="footer-content-wrapper">
        {/* Section 1: About & Mission */}
        <div className="footer-section about">
          <h3>{systemName}</h3>
          <p>
            Committed to **secure, transparent, and accessible** democratic
            processes. Your vote is protected using state-of-the-art encryption
            technology.
          </p>
          <div className="security-seal">
            <FaShieldAlt className="shield-icon" />
            <span>100% Verified & Audited</span>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/faq">
                <FaQuestionCircle className="link-icon" /> FAQ & Help Center
              </a>
            </li>
            <li>
              <a href="/voter-guide">Voter Guide</a>
            </li>
            <li>
              <a href="/results-archive">Past Results</a>
            </li>
          </ul>
        </div>

        {/* Section 3: Legal & Compliance */}
        <div className="footer-section legal">
          <h4>Legal & Compliance</h4>
          <ul>
            <li>
              <a href="/privacy-policy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms-of-service">Terms of Service</a>
            </li>
            <li>
              <a href="/accessibility-statement">
                <FaGlobe className="link-icon" /> Accessibility
              </a>
            </li>
          </ul>
        </div>

        {/* Section 4: Contact Information */}
        <div className="footer-section contact">
          <h4>Contact Support</h4>
          <p>
            <FaEnvelope className="contact-icon" />
            <a href="mailto:support@votesecure.org">support@votesecure.org</a>
          </p>
          <p>
            <strong>Emergency Hotline:</strong>
            <a href="tel:1800-VOTE-NOW">1-800-VOTE-NOW</a>
          </p>
          <p className="oversight">Oversight by: **National Election Body**</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <p>
          &copy; {currentYear} {systemName}. All rights reserved. |
          <a href="/system-status" className="status-link">
            System Status: Operational ✅
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
