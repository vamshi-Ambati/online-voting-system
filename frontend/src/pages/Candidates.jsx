import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiUsers, FiList, FiUpload, FiX } from "react-icons/fi";
import "../styles/candidates.css";
import apiUrl from "../apiUrl";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    photoUrl: null,
    partySymbolUrl: null,
    email: "",
    mobile: "",
    address: "",
    education: "",
    experience: "",
    agenda: "",
  });
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [loadingVote, setLoadingVote] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewSymbol, setPreviewSymbol] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData")) || {
    role: "voter",
  };

  // Fetch candidates
  const getCandidates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getCandidates`);
      const data = await response.json();
      setCandidates(data.candidates || []);
      setShowCandidates(true);
      setShowAddForm(false);
      setShowVoters(false);
    } catch {
      toast.error("Failed to load candidates.");
    }
  }, []);

  // Fetch voters
  const getVoters = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getAllVoters`);
      const data = await response.json();
      setVoters(data.voters || []);
      setShowVoters(true);
      setShowCandidates(false);
      setShowAddForm(false);
    } catch {
      toast.error("Failed to load voters.");
    }
  }, []);

  useEffect(() => {
    if (userData._id) {
      const votedId = localStorage.getItem(`votedCandidateId_${userData._id}`);
      if (votedId) setVotedCandidateId(votedId);
    }
    if (userData.role === "voter") getCandidates();
  }, [userData._id, userData.role, getCandidates]);

  // Preview image handler
  const handleImagePreview = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "photo") {
        setPreviewImage(reader.result);
        setNewCandidate((prev) => ({ ...prev, photoUrl: file }));
      } else {
        setPreviewSymbol(reader.result);
        setNewCandidate((prev) => ({ ...prev, partySymbolUrl: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Input change handler for text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  // Add candidate submission
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.photoUrl || !newCandidate.partySymbolUrl) {
      toast.error("Candidate photo and party symbol are required.");
      return;
    }

    const formData = new FormData();
    Object.entries(newCandidate).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(`${apiUrl}/api/candidates`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Candidate added successfully!");
        setNewCandidate({
          name: "",
          party: "",
          photoUrl: null,
          partySymbolUrl: null,
          email: "",
          mobile: "",
          address: "",
          education: "",
          experience: "",
          agenda: "",
        });
        setPreviewImage(null);
        setPreviewSymbol(null);
        getCandidates();
      } else {
        toast.error(data.message || "Failed to add candidate.");
      }
    } catch {
      toast.error("An error occurred while adding candidate.");
    }
  };

  // Vote button handler
  const handleVoteBtn = async (candidateId, votedFor) => {
    const candidate = candidates.find((c) => c._id === candidateId);
    if (!candidate) return;

    if (
      !window.confirm(
        `Are you sure you want to vote for "${candidate.name}" (${candidate.party})?`
      )
    )
      return;

    if (!userData || !userData._id) {
      toast.error("You must be logged in as a voter to vote.");
      return;
    }

    const votedCandidateIdForUser = localStorage.getItem(
      `votedCandidateId_${userData._id}`
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
          voterId: userData._id, // use _id here
          voter_Name:
            userData.firstName +
            " " +
            (userData.middleName || "") +
            " " +
            userData.lastName,
          votedFor,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `Vote cast successfully!`);
        setVotedCandidateId(candidateId);
        localStorage.setItem(`votedCandidateId_${userData._id}`, candidateId);
      } else {
        toast.error(data.message || "Failed to cast vote.");
      }
    } catch {
      toast.error("An error occurred while voting.");
    }
    setLoadingVote(false);
  };

  // Utility for fixed image URL handling (avoid double slash)
  const getImageUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    let cleanedUrl = url.replace(/\\/g, "/");
    if (!cleanedUrl.startsWith("/")) cleanedUrl = "/" + cleanedUrl;
    return `${apiUrl}${cleanedUrl}`.replace(/([^:]\/)\/+/g, "$1");
  };

  return (
    <div className="candidate-container">
      <h2>Election Candidates</h2>

      {/* Admin controls */}
      {userData.role === "admin" && (
        <div className="admin-controls">
          <button className="control-btn" onClick={() => setShowAddForm(true)}>
            <FiPlus /> Add Candidate
          </button>
          <button className="control-btn" onClick={getCandidates}>
            <FiList /> View Candidates
          </button>
          <button className="control-btn" onClick={getVoters}>
            <FiUsers /> View Voters
          </button>
        </div>
      )}

      {/* Add Candidate Form */}
      {userData.role === "admin" && showAddForm && (
        <div className="form-container">
          <div className="form-header">
            <h3>Add New Candidate</h3>
            <button className="close-btn" onClick={() => setShowAddForm(false)}>
              <FiX />
            </button>
          </div>
          <form onSubmit={handleAddCandidate}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newCandidate.name}
                  onChange={handleInputChange}
                  placeholder="Candidate's full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="party">Political Party*</label>
                <input
                  type="text"
                  id="party"
                  name="party"
                  value={newCandidate.party}
                  onChange={handleInputChange}
                  placeholder="Party name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="photoUrl">Candidate Photo*</label>
                <div className="file-upload-wrapper">
                  <label className="file-upload-label">
                    <FiUpload /> Choose File
                    <input
                      type="file"
                      id="photoUrl"
                      name="photoUrl"
                      accept="image/*"
                      onChange={(e) => handleImagePreview(e, "photo")}
                      hidden
                      required
                    />
                  </label>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                  <span className="file-name">
                    {newCandidate.photoUrl?.name || "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="partySymbolUrl">Party Symbol*</label>
                <div className="file-upload-wrapper">
                  <label className="file-upload-label">
                    <FiUpload /> Choose File
                    <input
                      type="file"
                      id="partySymbolUrl"
                      name="partySymbolUrl"
                      accept="image/*"
                      onChange={(e) => handleImagePreview(e, "symbol")}
                      hidden
                      required
                    />
                  </label>
                  {previewSymbol && (
                    <img
                      src={previewSymbol}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                  <span className="file-name">
                    {newCandidate.partySymbolUrl?.name || "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newCandidate.email}
                  onChange={handleInputChange}
                  placeholder="candidate@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={newCandidate.mobile}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  value={newCandidate.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="agenda">Agenda/Manifesto*</label>
                <input
                  id="agenda"
                  name="agenda"
                  value={newCandidate.agenda}
                  onChange={handleInputChange}
                  placeholder="Key agenda points"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education</label>
                <input
                  id="education"
                  name="education"
                  value={newCandidate.education}
                  onChange={handleInputChange}
                  placeholder="Educational qualifications"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <input
                  id="experience"
                  name="experience"
                  value={newCandidate.experience}
                  onChange={handleInputChange}
                  placeholder="Political and professional experience"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Candidate
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voters list (Admin only) */}
      {userData.role === "admin" && showVoters && (
        <div className="voters-list">
          <h3>Registered Voters</h3>
          {voters.length === 0 ? (
            <p className="no-data">No voters found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Voter Id</th>
                    <th>Voting Status</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((voter, index) => (
                    <tr key={voter._id}>
                      <td>{index + 1}</td>
                      <td>
                        {voter.firstName} {voter.middleName} {voter.lastName}
                      </td>
                      <td>{voter.email}</td>
                      <td>{voter.voterId}</td>
                      <td>
                        <span
                          className={`status ${
                            voter.hasVoted ? "voted" : "pending"
                          }`}
                        >
                          {voter.hasVoted ? "Voted" : "Not Voted"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Candidates display */}
      {(showCandidates || userData.role === "voter") && (
        <div className="candidates-list">
          <h3>
            {userData.role === "admin"
              ? "All Candidates"
              : "Vote for Your Candidate"}
          </h3>

          {candidates.length === 0 ? (
            <p className="no-data">No candidates available.</p>
          ) : userData.role === "voter" ? (
            <div className="voter-table-container">
              <table className="voter-candidates-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Candidate Name</th>
                    <th>Party Name</th>
                    <th>Party Symbol</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr key={candidate._id}>
                      <td>{index + 1}</td>
                      <td>{candidate.name}</td>
                      <td>{candidate.party}</td>
                      <td>
                        {candidate.partySymbolUrl && (
                          <img
                            src={getImageUrl(candidate.partySymbolUrl)}
                            alt={`${candidate.party} symbol`}
                            className="party-symbol-thumbnail"
                            loading="lazy"
                          />
                        )}
                      </td>
                      <td>
                        <button
                          className={`vote-btn ${
                            votedCandidateId === candidate._id ? "voted" : ""
                          }`}
                          onClick={() =>
                            handleVoteBtn(candidate._id, candidate.party)
                          }
                          disabled={!!votedCandidateId || loadingVote}
                        >
                          {votedCandidateId === candidate._id
                            ? "Voted"
                            : loadingVote
                            ? "Processing..."
                            : "Vote"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div className="candidate-card" key={candidate._id}>
                  <div className="candidate-image">
                    <img
                      src={getImageUrl(candidate.photoUrl)}
                      alt={candidate.name}
                      loading="lazy"
                    />
                    {candidate.partySymbolUrl && (
                      <div className="party-symbol">
                        <img
                          src={getImageUrl(candidate.partySymbolUrl)}
                          alt={`${candidate.party} symbol`}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                  <div className="candidate-info">
                    <h4>{candidate.name}</h4>
                    <div className="party">{candidate.party}</div>
                    <div className="agenda">
                      <strong>Agenda:</strong> {candidate.agenda}
                    </div>
                    <div className="experience">
                      <strong>Experience:</strong> {candidate.experience}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Candidates;
