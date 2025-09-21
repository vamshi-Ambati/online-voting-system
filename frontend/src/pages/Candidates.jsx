import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiUsers, FiList, FiUpload, FiX } from "react-icons/fi";
import Webcam from "react-webcam";
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
    email: "",
    mobile: "",
    address: "",
    education: "",
    experience: "",
    agenda: "",
    photo: null,
    partySymbol: null,
  });
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [loadingVote, setLoadingVote] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewSymbol, setPreviewSymbol] = useState(null);

  // Face Verification state
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [candidateToVote, setCandidateToVote] = useState(null);
  const webcamRef = useRef(null);

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
      const votedId = localStorage.getItem(
        `votedCandidateId_${userData.voterId}`
      );
      if (votedId) setVotedCandidateId(votedId);
    }
    if (userData.role === "voter") getCandidates();
  }, [userData._id, userData.role, getCandidates]);

  // Preview file uploads
  const handleImagePreview = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "photo") {
        setPreviewImage(reader.result);
        setNewCandidate((prev) => ({ ...prev, photo: file }));
      } else {
        setPreviewSymbol(reader.result);
        setNewCandidate((prev) => ({ ...prev, partySymbol: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  // Add candidate
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.photo || !newCandidate.partySymbol) {
      toast.error("Candidate photo and party symbol are required.");
      return;
    }

    const formData = new FormData();
    Object.entries(newCandidate).forEach(([key, value]) => {
      if (value) formData.append(key, value);
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
          email: "",
          mobile: "",
          address: "",
          education: "",
          experience: "",
          agenda: "",
          photo: null,
          partySymbol: null,
        });
        setPreviewImage(null);
        setPreviewSymbol(null);
        getCandidates();
        setShowAddForm(false);
      } else {
        toast.error(data.message || "Failed to add candidate.");
      }
    } catch {
      toast.error("An error occurred while adding candidate.");
    }
  };

  // Face capture
  const handleFaceCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setVerificationMessage("");
    } else {
      toast.error("Failed to capture image. Please try again.");
    }
  };

  // Face verification + voting
  const verifyAndVote = async () => {
    if (!capturedImage) {
      setVerificationMessage("Please capture your face first.");
      return;
    }

    if (!userData || !userData._id) {
      toast.error("User data not found. Please log in again.");
      return;
    }

    setVerificationLoading(true);
    setVerificationMessage("Verifying face...");

    try {
      const response = await fetch(`${apiUrl}/api/verify-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: userData._id,
          image: capturedImage,
        }),
      });

      const data = await response.json();
      if (response.ok && data.match) {
        setVerificationMessage("Face verified successfully! Casting vote...");
        await handleVote(candidateToVote._id, candidateToVote.party);
        setShowFaceVerification(false);
      } else {
        setVerificationMessage(
          data.message || "Face verification failed. Please try again."
        );
        toast.error(data.message || "Face verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationMessage("An error occurred during verification.");
      toast.error("An error occurred during verification.");
    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle vote click
  const handleVoteBtn = (candidateId) => {
    const candidate = candidates.find((c) => c._id === candidateId);
    if (!candidate) return;

    if (!userData || !userData._id) {
      toast.error("You must be logged in as a voter to vote.");
      return;
    }

    const votedCandidateIdForUser = localStorage.getItem(
      `votedCandidateId_${userData.voterId}`
    );
    if (votedCandidateIdForUser) {
      toast.info("You have already voted.");
      return;
    }

    setCandidateToVote(candidate);
    setShowFaceVerification(true);
    setCapturedImage(null);
    setVerificationMessage("");
  };

  // Submit vote
  const handleVote = async (candidateId, votedFor) => {
    setLoadingVote(true);
    try {
      const response = await fetch(`${apiUrl}/api/votes/cast-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          voterId: userData.voterId,
          voter_Name: `${userData.firstName} ${userData.lastName}`,
          votedFor,
          voterEmail: userData.email, // Send voter email
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `Vote cast successfully!`);
        setVotedCandidateId(candidateId);
        localStorage.setItem(
          `votedCandidateId_${userData.voterId}`,
          candidateId
        );
      } else {
        toast.error(data.message || "Failed to cast vote.");
      }
    } catch {
      toast.error("An error occurred while voting.");
    }
    setLoadingVote(false);
  };

  return (
    <div className="candidate-container">
      <h2>Election Candidates</h2>

      {/* Admin Controls */}
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
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCandidate.name}
                  onChange={handleInputChange}
                  placeholder="Enter candidate name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Party</label>
                <input
                  type="text"
                  name="party"
                  value={newCandidate.party}
                  onChange={handleInputChange}
                  placeholder="Enter party name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newCandidate.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={newCandidate.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newCandidate.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  name="education"
                  value={newCandidate.education}
                  onChange={handleInputChange}
                  placeholder="Enter education details"
                />
              </div>
              <div className="form-group">
                <label>Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={newCandidate.experience}
                  onChange={handleInputChange}
                  placeholder="Enter political experience"
                />
              </div>
              <div className="form-group">
                <label>Agenda</label>
                <textarea
                  name="agenda"
                  value={newCandidate.agenda}
                  onChange={handleInputChange}
                  placeholder="Enter political agenda"
                ></textarea>
              </div>

              {/* Uploads */}
              <div className="form-group file-upload-wrapper">
                <label className="file-upload-label">
                  <FiUpload /> Upload Candidate Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagePreview(e, "photo")}
                    hidden
                  />
                </label>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>
              <div className="form-group file-upload-wrapper">
                <label className="file-upload-label">
                  <FiUpload /> Upload Party Symbol
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagePreview(e, "symbol")}
                    hidden
                  />
                </label>
                {previewSymbol && (
                  <img
                    src={previewSymbol}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
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

      {/* Voters list */}
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
                        {voter.firstName} {voter.lastName}
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

      {/* Face Verification Modal */}
      {showFaceVerification && (
        <div className="verification-modal-overlay">
          <div className="verification-modal-content">
            <div className="modal-header">
              <h3>Face Verification</h3>
              <button
                onClick={() => setShowFaceVerification(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>
            <p>
              Please position your face clearly in the frame and click
              'Capture'.
            </p>
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={300}
                height={225}
                videoConstraints={{ facingMode: "user" }}
              />
            </div>
            <button
              onClick={handleFaceCapture}
              className="capture-btn"
              disabled={verificationLoading}
            >
              {capturedImage ? "Recapture" : "Capture Photo"}
            </button>
            {capturedImage && (
              <div className="captured-image-preview">
                <h4>Captured Image</h4>
                <img src={capturedImage} alt="Captured" />
              </div>
            )}
            <div className="verification-status">
              <p>{verificationMessage}</p>
            </div>
            <button
              onClick={verifyAndVote}
              className="verify-vote-btn"
              disabled={!capturedImage || verificationLoading}
            >
              {verificationLoading ? "Processing..." : "Verify & Vote"}
            </button>
          </div>
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
                        {candidate.partySymbol && (
                          <img
                            src={candidate.partySymbol}
                            alt={`${candidate.party} symbol`}
                            className="party-symbol-thumbnail"
                          />
                        )}
                      </td>
                      <td>
                        {votedCandidateId === candidate._id ? (
                          <button className="voted-btn" disabled>
                            Voted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVoteBtn(candidate._id)}
                            disabled={loadingVote || votedCandidateId !== null}
                            className={`vote-btn ${
                              votedCandidateId !== null ? "disabled-btn" : ""
                            }`}
                          >
                            {loadingVote ? "Voting..." : "Vote"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate._id} className="candidate-card">
                  <div className="candidate-photo-wrapper">
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="candidate-photo"
                      />
                    ) : (
                      <div className="no-photo">No Photo</div>
                    )}
                    {candidate.partySymbol && (
                      <img
                        src={candidate.partySymbol}
                        alt={`${candidate.party} symbol`}
                        className="party-symbol"
                      />
                    )}
                  </div>
                  <h4>{candidate.name}</h4>
                  <p className="party-name">{candidate.party}</p>
                  <p>Experience: {candidate.experience}</p>
                  <p>Agenda: {candidate.agenda}</p>
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
