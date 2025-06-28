import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import "../styles/candidates.css";
import apiUrl from "../apiUrl";
import voteImage from "/images/vote2.png"; // Ensure this path is correct

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    description: "",
    photoUrl: "",
  });
  const [votedCandidateId, setVotedCandidateId] = useState(null);

  // Get voter from localStorage
  const voter = JSON.parse(localStorage.getItem("voter")) || {
    role: "candidate",
  };

  useEffect(() => {
    if (voter.role === "candidate") {
      getCandidates();
      setShowCandidates(true);
      setShowAddForm(false);
    }
  }, []);

  // Fetch all candidates
  const getCandidates = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates`);
      const data = await response.json();
      setCandidates(data.candidates || []);
      setShowCandidates(true);
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to load candidates.");
    }
  };

  // Show add form, hide list
  const addCandidateBtn = () => {
    setShowAddForm(true);
    setShowCandidates(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setNewCandidate({
      ...newCandidate,
      [e.target.name]: e.target.value,
    });
  };

  // Handle new candidate form submission
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCandidate),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Candidate added!");
        setNewCandidate({
          name: "",
          party: "",
          description: "",
          photoUrl: "",
        });
        setShowAddForm(false);
        getCandidates();
      } else {
        toast.error(data.message || "Failed to add candidate.");
      }
    } catch (error) {
      toast.error("An error occurred while adding candidate.");
    }
  };

  // Complete voting functionality
  const handleVoteBtn = async (candidateId) => {
    if (!voter || !voter._id) {
      toast.error("You must be logged in as a voter to vote.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          voterId: voter._id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Vote cast successfully!");
        setVotedCandidateId(candidateId);
      } else {
        toast.error(data.message || "Failed to cast vote.");
      }
    } catch (error) {
      console.error("Voting error:", error);
      toast.error("An error occurred while voting.");
    }
  };

  return (
    <div className="candidate-container">
      <h2>Meet the Candidates</h2>

      {/* Admin controls */}
      {voter.role === "admin" && (
        <div className="admin-buttons">
          <button className="add-btn" onClick={addCandidateBtn}>
             Add Candidate
          </button>
          <button className="get-btn" onClick={getCandidates}>
            Get Candidates
          </button>
        </div>
      )}

      {/* Add Candidate Form (admin only) */}
      {voter.role === "admin" && showAddForm && (
        <form className="add-candidate-form" onSubmit={handleAddCandidate}>
          <h3>Add New Candidate</h3>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Candidate Name"
              value={newCandidate.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="party"
              placeholder="Party"
              value={newCandidate.party}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="photoUrl"
              placeholder="Photo URL (optional)"
              value={newCandidate.photoUrl}
              onChange={handleInputChange}
            />
          </div>
          {/* Description field is optional and can be added back if needed */}
          {/* <div className="form-row">
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={newCandidate.description}
              onChange={handleInputChange}
              rows={2}
            />
          </div> */}
          <div className="add-candidate-btn-wrapper">
            <button type="submit" className="add-candidate-btn">
              <FiPlus className="add-icon" /> Add
            </button>
          </div>
        </form>
      )}

      {/* Candidate list for admin */}
      {voter.role === "admin" && showCandidates && (
        <div className="candidate-list">
          {candidates.length === 0 && <p>No candidates found.</p>}
          {candidates.map((candidate) => (
            <div className="candidate-card" key={candidate._id}>
              <div className="candidate-name">{candidate.name}</div>
              <div className="candidate-party">{candidate.party}</div>
              <div className="candidate-photo">
                <img
                  src={candidate.photoUrl || voteImage}
                  alt={candidate.name}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate list for candidate login */}
      {voter.role === "candidate" && showCandidates && (
        <div className="candidate-list">
          {candidates.length === 0 && <p>No candidates found.</p>}
          {candidates.map((candidate) => (
            <div className="candidate-card" key={candidate._id}>
              <div className="candidate-name">{candidate.name}</div>
              <div className="candidate-party">{candidate.party}</div>
              <div className="candidate-photo">
                <img
                  src={candidate.photoUrl || voteImage}
                  alt={candidate.name}
                />
              </div>
              <button
                className="vote-btn"
                onClick={() => handleVoteBtn(candidate._id)}
                disabled={votedCandidateId !== null}
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
