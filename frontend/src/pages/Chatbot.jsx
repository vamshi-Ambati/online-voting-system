import React, { useState } from "react";
import "../styles/chatbot.css";
import { FaRobot } from "react-icons/fa"; // Robot icon

const qaData = [
  {
    question: "What is SecureVote?",
    answer:
      "SecureVote is an online voting system designed for secure, transparent, and accessible elections.",
  },
  {
    question: "How do I register as a voter?",
    answer:
      "Click on the Get Started button on the home page and fill in your personal details. You will verify your phone number using OTP and email using a code.",
  },
  {
    question: "Is facial verification mandatory?",
    answer:
      "Yes. Before voting, your live image is matched with the stored photo using face recognition to ensure authenticity.",
  },
  {
    question: "Can I vote using my mobile?",
    answer:
      "Yes. SecureVote is fully responsive and works on any mobile device.",
  },
  {
    question: "Is my vote secure?",
    answer:
      "Absolutely. Your vote is encrypted end-to-end, stored securely, and can be cast only once.",
  },
  {
    question: "What happens after I cast my vote?",
    answer:
      "You receive a confirmation email instantly, powered by RabbitMQ messaging queue.",
  },
  {
    question: "Can the admin see who I voted for?",
    answer:
      "No. Votes are anonymized and encrypted. The admin can only see final counts.",
  },
  {
    question: "How are results calculated?",
    answer:
      "Results are automatically computed once the admin publishes the election. All users are notified via email.",
  },
  {
    question: "What technologies does SecureVote use?",
    answer:
      "The system uses React.js for the frontend, Node.js + Express backend, MongoDB, Cloudinary, face-api.js, and RabbitMQ.",
  },
  {
    question: "How are voter photos stored?",
    answer:
      "All photos are uploaded to Cloudinary, a secure cloud storage service.",
  },
  {
    question: "Can I change my registered details?",
    answer:
      "You can update basic personal information, but your voter ID and registered photo cannot be changed once verified.",
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! How can I help you today? 👇 Choose a question below.",
    },
  ]);

  const [open, setOpen] = useState(false);

  // Toggle chatbot open/close
  const toggleChat = () => setOpen(!open);

  // Handle clicking a question
  const handleQuestionClick = (q) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: q.question },
      { sender: "bot", text: q.answer },
      { sender: "bot", text: "You can ask another question 👇" }, // prompt again
    ]);
  };

  // Reset chat to initial state
  const resetChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hi! How can I help you today? 👇 Choose a question below.",
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="chatbot-button" onClick={toggleChat}>
        <FaRobot size={28} />
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>SecureVote Assistant</h4>
            <div className="chatbot-header-buttons">
              <button className="reset-btn" onClick={resetChat}>
                🔄 Reset
              </button>
              <button className="close-btn" onClick={toggleChat}>
                ×
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}

            {/* Question Buttons */}
            <div className="question-buttons">
              {qaData.map((q, index) => (
                <button
                  key={index}
                  className="question-btn"
                  onClick={() => handleQuestionClick(q)}
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
