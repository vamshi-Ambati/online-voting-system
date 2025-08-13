// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Home.css";

// const Home = () => {
//   const navigate = useNavigate();

//   const handleGetStarted = (e) => {
//     e.preventDefault();
//     navigate("/candidates");
//   };

//   // Stats data
//   const stats = [
//     { value: "10,000+", label: "Verified Voters" },
//     { value: "99.9%", label: "Uptime" },
//     { value: "100%", label: "Audit Accuracy" },
//     { value: "24/7", label: "Support" },
//   ];

//   // Testimonials data
//   const testimonials = [
//     {
//       quote:
//         "eVote made our student council elections smoother than ever before.",
//       author: "University of Tech",
//       role: "Student Affairs",
//     },
//     {
//       quote:
//         "The transparency features gave our members confidence in the voting process.",
//       author: "National Labor Union",
//       role: "Election Committee",
//     },
//     {
//       quote:
//         "Implementing eVote saved us 60% in election administration costs.",
//       author: "City Municipal Office",
//       role: "Elections Department",
//     },
//   ];

//   return (
//     <div className="home-container">
//       {/* Hero Section */}
//       <section className="hero">
//         <div className="hero-content">
//           <div className="hero-text">
//             <h1>
//               Modern Voting Solutions for{" "}
//               <span className="brand-gradient">Democracy 2.0</span>
//             </h1>
//             <p className="hero-subtitle">
//               Secure, transparent, and accessible online voting platform powered
//               by blockchain technology.
//               <br />
//               <span className="highlight">
//                 Your vote matters. Make it count with confidence.
//               </span>
//             </p>
//             <div className="hero-cta">
//               <button className="cta-btn-primary" onClick={handleGetStarted}>
//                 Get Started
//               </button>
//               <button className="cta-btn-secondary">
//                 Watch Demo <i className="fas fa-play-circle"></i>
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="hero-image">
//           <img
//             src="https://img.freepik.com/free-vector/online-voting-concept-illustration_114360-8410.jpg"
//             alt="Voting Illustration"
//             className="hero-img"
//           />
//           <div className="floating-badge">
//             <div className="badge-content">
//               <span className="badge-icon">
//                 <i className="fas fa-shield-alt"></i>
//               </span>
//               <span>ISO 27001 Certified</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Trust Badges */}
//       <section className="trust-badges">
//         <p>Trusted by organizations worldwide</p>
//         <div className="badges-container">
//           <img
//             src="https://via.placeholder.com/120x40?text=UNICEF"
//             alt="UNICEF"
//           />
//           <img src="https://via.placeholder.com/120x40?text=IEEE" alt="IEEE" />
//           <img
//             src="https://via.placeholder.com/120x40?text=Greenpeace"
//             alt="Greenpeace"
//           />
//           <img src="https://via.placeholder.com/120x40?text=OSCE" alt="OSCE" />
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="stats-section">
//         <div className="stats-grid">
//           {stats.map((stat, index) => (
//             <div className="stat-card" key={index}>
//               <h3>{stat.value}</h3>
//               <p>{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="features" id="features">
//         <div className="section-header">
//           <h2>
//             Why Organizations Choose{" "}
//             <span className="brand-gradient">eVote</span>
//           </h2>
//           <p className="section-subtitle">
//             Enterprise-grade voting solutions with military-grade security
//           </p>
//         </div>
//         <div className="features-grid">
//           <div className="feature-card">
//             <div className="feature-icon security">
//               <i className="fas fa-fingerprint"></i>
//             </div>
//             <h3>Military-Grade Security</h3>
//             <p>
//               End-to-end encryption, multi-factor authentication, and blockchain
//               verification protect every vote with the highest security
//               standards.
//             </p>
//             <a href="#security" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon accessibility">
//               <i className="fas fa-universal-access"></i>
//             </div>
//             <h3>Universal Accessibility</h3>
//             <p>
//               WCAG 2.1 compliant interface with screen reader support, multiple
//               language options, and mobile responsiveness for all voters.
//             </p>
//             <a href="#accessibility" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon transparency">
//               <i className="fas fa-search-dollar"></i>
//             </div>
//             <h3>Complete Transparency</h3>
//             <p>
//               Real-time auditing, voter-verifiable paper trails, and open-source
//               algorithms ensure full transparency in the electoral process.
//             </p>
//             <a href="#transparency" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon analytics">
//               <i className="fas fa-chart-bar"></i>
//             </div>
//             <h3>Advanced Analytics</h3>
//             <p>
//               Comprehensive election analytics dashboard with demographic
//               breakdowns, turnout statistics, and real-time result
//               visualizations.
//             </p>
//             <a href="#analytics" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon compliance">
//               <i className="fas fa-balance-scale"></i>
//             </div>
//             <h3>Regulatory Compliance</h3>
//             <p>
//               Pre-configured compliance templates for GDPR, HIPAA, and election
//               laws in 50+ countries with customizable rule engines.
//             </p>
//             <a href="#compliance" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon support">
//               <i className="fas fa-headset"></i>
//             </div>
//             <h3>Dedicated Support</h3>
//             <p>
//               24/7 election support with dedicated account managers,
//               multi-lingual voter assistance, and on-call technical experts.
//             </p>
//             <a href="#support" className="feature-link">
//               Learn more <i className="fas fa-arrow-right"></i>
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="testimonials">
//         <div className="section-header">
//           <h2>Trusted by Organizations Worldwide</h2>
//           <p className="section-subtitle">Don't just take our word for it</p>
//         </div>
//         <div className="testimonials-grid">
//           {testimonials.map((testimonial, index) => (
//             <div className="testimonial-card" key={index}>
//               <div className="testimonial-quote">
//                 <i className="fas fa-quote-left"></i>
//                 <p>{testimonial.quote}</p>
//               </div>
//               <div className="testimonial-author">
//                 <h4>{testimonial.author}</h4>
//                 <p>{testimonial.role}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="cta-section">
//         <div className="cta-content">
//           <h2>Ready to Transform Your Voting Process?</h2>
//           <p>Schedule a demo with our election specialists today</p>
//           <div className="cta-buttons">
//             <button className="cta-btn-primary" onClick={handleGetStarted}>
//               Request Demo
//             </button>
//             <button className="cta-btn-outline">
//               Download Whitepaper <i className="fas fa-download"></i>
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="footer">
//         <div className="footer-content">
//           <div className="footer-brand">
//             <h3 className="brand-gradient">eVote</h3>
//             <p>Democracy powered by technology</p>
//             <div className="social-links">
//               <a href="#twitter">
//                 <i className="fab fa-twitter"></i>
//               </a>
//               <a href="#linkedin">
//                 <i className="fab fa-linkedin"></i>
//               </a>
//               <a href="#github">
//                 <i className="fab fa-github"></i>
//               </a>
//               <a href="#youtube">
//                 <i className="fab fa-youtube"></i>
//               </a>
//             </div>
//           </div>
//           <div className="footer-links">
//             <div className="links-column">
//               <h4>Platform</h4>
//               <a href="#features">Features</a>
//               <a href="#security">Security</a>
//               <a href="#pricing">Pricing</a>
//               <a href="#integrations">Integrations</a>
//             </div>
//             <div className="links-column">
//               <h4>Resources</h4>
//               <a href="#documentation">Documentation</a>
//               <a href="#whitepapers">Whitepapers</a>
//               <a href="#blog">Blog</a>
//               <a href="#webinars">Webinars</a>
//             </div>
//             <div className="links-column">
//               <h4>Company</h4>
//               <a href="#about">About Us</a>
//               <a href="#careers">Careers</a>
//               <a href="#press">Press</a>
//               <a href="#contact">Contact</a>
//             </div>
//           </div>
//         </div>
//         <div className="footer-bottom">
//           <p>
//             &copy; {new Date().getFullYear()}{" "}
//             <span className="brand-gradient">eVote Systems Inc.</span>. All
//             rights reserved.
//           </p>
//           <div className="legal-links">
//             <a href="#privacy">Privacy Policy</a>
//             <a href="#terms">Terms of Service</a>
//             <a href="#cookies">Cookie Policy</a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;
import React from 'react'

const Home = () => {
  return (
    <div>Home</div>
  )
}

export default Home