import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import "../styles/candidates.css";
import apiUrl from "../apiUrl";
import voteImage from "/images/vote2.png";

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
  const [loadingVote, setLoadingVote] = useState(false);

  // Get voter from localStorage (always fresh)
  const voter = JSON.parse(localStorage.getItem("voter")) || {
    role: "candidate",
  };

  useEffect(() => {
    if (voter.role === "candidate" || voter.role === "admin") {
      getCandidates();
      setShowCandidates(true);
      setShowAddForm(false);

      // Check if this user has already voted (per user)
      if (voter.id) {
        const votedId = localStorage.getItem(`votedCandidateId_${voter.id}`);
        if (votedId) {
          setVotedCandidateId(votedId);
        }
      }
    }
    // eslint-disable-next-line
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

  // Handle voting with confirmation
  const handleVoteBtn = async (candidateId, votedFor) => {
    // Show confirmation dialog
    const candidate = candidates.find((c) => c._id === candidateId);
    const confirmMsg = `Are you sure you want to vote for "${candidate?.name}" (${candidate?.party})? You cannot change your vote later.`;
    if (!window.confirm(confirmMsg)) {
      return; // If user cancels, do nothing
    }

    const voter = JSON.parse(localStorage.getItem("voter"));
    if (!voter || !voter.id) {
      toast.error("You must be logged in as a voter to vote.");
      return;
    }

    // Check per-user votedCandidateId
    const votedCandidateIdForUser = localStorage.getItem(
      `votedCandidateId_${voter.id}`
    );
    if (votedCandidateIdForUser) {
      toast.info("You have already voted.");
      return;
    }

    setLoadingVote(true);
    try {
      const response = await fetch(`${apiUrl}/api/votes/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          voterId: voter.id,
          voter_Name: voter.username,
          votedFor, // <-- send votedFor instead of party
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `Vote cast successfully!`, {
          autoClose: 1000, // Show for 1 second
        });
        setVotedCandidateId(candidateId);
        // Store votedCandidateId per user
        localStorage.setItem(`votedCandidateId_${voter.id}`, candidateId);
      } else {
        toast.error(data.message || "Failed to cast vote.");
      }
    } catch (error) {
      console.error("Voting error:", error);
      toast.error("An error occurred while voting.");
    }
    setLoadingVote(false);
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
          {/* Description field is optional */}
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

      {/* Candidate list for candidate login (voters) */}
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
                className={`vote-btn${
                  votedCandidateId === candidate._id ? " voted-btn" : ""
                }`}
                onClick={() => handleVoteBtn(candidate._id, candidate.party)}
                disabled={!!votedCandidateId || loadingVote}
              >
                {votedCandidateId === candidate._id
                  ? "Voted"
                  : loadingVote
                  ? "Voting..."
                  : "Vote"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
