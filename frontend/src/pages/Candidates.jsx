import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiUsers, FiList, FiUpload, FiX } from "react-icons/fi";
import Webcam from "react-webcam";
import "../styles/candidates.css";
import apiUrl from "../apiUrl";
import { useTranslation } from "react-i18next";

const Candidates = () => {
  const { t } = useTranslation();

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
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [candidateToVote, setCandidateToVote] = useState(null);
  const webcamRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("userData")) || {
    role: "voter",
  };

  const getCandidates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getCandidates`);
      const data = await response.json();
      setCandidates(data.candidates || []);
      setShowCandidates(true);
      setShowAddForm(false);
      setShowVoters(false);
    } catch {
      toast.error(t("candidates.errorLoadCandidates"));
    }
  }, [t]);

  const getVoters = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getAllVoters`);
      const data = await response.json();
      setVoters(data.voters || []);
      setShowVoters(true);
      setShowCandidates(false);
      setShowAddForm(false);
    } catch {
      toast.error(t("candidates.errorLoadVoters"));
    }
  }, [t]);

  useEffect(() => {
    if (userData._id) {
      const votedId = localStorage.getItem(
        `votedCandidateId_${userData.voterId}`,
      );
      if (votedId) setVotedCandidateId(votedId);
    }
    if (userData.role === "voter") getCandidates();
  }, [userData._id, userData.role, getCandidates]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.photo || !newCandidate.partySymbol) {
      toast.error(t("candidates.photoRequired"));
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
        toast.success(data.message || t("candidates.addSuccess"));
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
        toast.error(data.message || t("candidates.addFail"));
      }
    } catch {
      toast.error(t("candidates.addError"));
    }
  };

  const handleFaceCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setVerificationMessage("");
    } else {
      toast.error(t("candidates.captureError"));
    }
  };

  const verifyAndVote = async () => {
    if (!capturedImage) {
      setVerificationMessage(t("candidates.captureFirst"));
      return;
    }
    if (!userData || !userData._id) {
      toast.error(t("candidates.loginRequired"));
      return;
    }
    setVerificationLoading(true);
    setVerificationMessage(t("candidates.verifying"));
    try {
      const response = await fetch(`${apiUrl}/api/verify-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: userData._id, image: capturedImage }),
      });
      const data = await response.json();
      if (response.ok && data.match) {
        setVerificationMessage(t("candidates.verifySuccess"));
        await handleVote(candidateToVote._id, candidateToVote.party);
        setShowFaceVerification(false);
      } else {
        setVerificationMessage(data.message || t("candidates.verifyFail"));
        toast.error(data.message || t("candidates.verifyFail"));
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationMessage(t("candidates.verifyError"));
      toast.error(t("candidates.verifyError"));
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVoteBtn = (candidateId) => {
    const candidate = candidates.find((c) => c._id === candidateId);
    if (!candidate) return;
    if (!userData || !userData._id) {
      toast.error(t("candidates.loginRequired"));
      return;
    }
    const votedCandidateIdForUser = localStorage.getItem(
      `votedCandidateId_${userData.voterId}`,
    );
    if (votedCandidateIdForUser) {
      toast.info(t("candidates.alreadyVoted"));
      return;
    }
    setCandidateToVote(candidate);
    setShowFaceVerification(true);
    setCapturedImage(null);
    setVerificationMessage("");
  };

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
          voterEmail: userData.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || t("candidates.voteSuccess"));
        setVotedCandidateId(candidateId);
        localStorage.setItem(
          `votedCandidateId_${userData.voterId}`,
          candidateId,
        );
      } else {
        toast.error(data.message || t("candidates.voteFail"));
      }
    } catch {
      toast.error(t("candidates.voteError"));
    }
    setLoadingVote(false);
  };

  return (
    <div className="candidate-container">
      <h2>{t("candidates.title")}</h2>

      {/* Admin Controls */}
      {userData.role === "admin" && (
        <div className="admin-controls">
          <button className="control-btn" onClick={() => setShowAddForm(true)}>
            <FiPlus /> {t("candidates.addCandidate")}
          </button>
          <button className="control-btn" onClick={getCandidates}>
            <FiList /> {t("candidates.viewCandidates")}
          </button>
          <button className="control-btn" onClick={getVoters}>
            <FiUsers /> {t("candidates.viewVoters")}
          </button>
        </div>
      )}

      {/* Add Candidate Form */}
      {userData.role === "admin" && showAddForm && (
        <div className="form-container">
          <div className="form-header">
            <h3>{t("candidates.addNewCandidate")}</h3>
            <button className="close-btn" onClick={() => setShowAddForm(false)}>
              <FiX />
            </button>
          </div>
          <form onSubmit={handleAddCandidate}>
            <div className="form-grid">
              <div className="form-group">
                <label>{t("candidates.formName")}</label>
                <input
                  type="text"
                  name="name"
                  value={newCandidate.name}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formNamePh")}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formParty")}</label>
                <input
                  type="text"
                  name="party"
                  value={newCandidate.party}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formPartyPh")}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formEmail")}</label>
                <input
                  type="email"
                  name="email"
                  value={newCandidate.email}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formEmailPh")}
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formMobile")}</label>
                <input
                  type="text"
                  name="mobile"
                  value={newCandidate.mobile}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formMobilePh")}
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formAddress")}</label>
                <textarea
                  name="address"
                  value={newCandidate.address}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formAddressPh")}
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formEducation")}</label>
                <input
                  type="text"
                  name="education"
                  value={newCandidate.education}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formEducationPh")}
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formExperience")}</label>
                <input
                  type="text"
                  name="experience"
                  value={newCandidate.experience}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formExperiencePh")}
                />
              </div>
              <div className="form-group">
                <label>{t("candidates.formAgenda")}</label>
                <textarea
                  name="agenda"
                  value={newCandidate.agenda}
                  onChange={handleInputChange}
                  placeholder={t("candidates.formAgendaPh")}
                />
              </div>
              <div className="form-group file-upload-wrapper">
                <label className="file-upload-label">
                  <FiUpload /> {t("candidates.uploadPhoto")}
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
                  <FiUpload /> {t("candidates.uploadSymbol")}
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
                {t("candidates.addCandidate")}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                {t("candidates.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voters List */}
      {userData.role === "admin" && showVoters && (
        <div className="voters-list">
          <h3>{t("candidates.registeredVoters")}</h3>
          {voters.length === 0 ?
            <p className="no-data">{t("candidates.noVoters")}</p>
          : <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t("candidates.colSno")}</th>
                    <th>{t("candidates.colName")}</th>
                    <th>{t("candidates.colEmail")}</th>
                    <th>{t("candidates.colVoterId")}</th>
                    <th>{t("candidates.colVotingStatus")}</th>
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
                          className={`status ${voter.hasVoted ? "voted" : "pending"}`}
                        >
                          {voter.hasVoted ?
                            t("candidates.voted")
                          : t("candidates.notVoted")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}

      {/* Face Verification Modal */}
      {showFaceVerification && (
        <div className="verification-modal-overlay">
          <div className="verification-modal-content">
            <div className="modal-header">
              <h3>{t("candidates.faceVerification")}</h3>
              <button
                onClick={() => setShowFaceVerification(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>
            <p>{t("candidates.faceInstruction")}</p>
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
              {capturedImage ?
                t("candidates.recapture")
              : t("candidates.capturePhoto")}
            </button>
            {capturedImage && (
              <div className="captured-image-preview">
                <h4>{t("candidates.capturedImage")}</h4>
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
              {verificationLoading ?
                t("candidates.processing")
              : t("candidates.verifyVote")}
            </button>
          </div>
        </div>
      )}

      {/* Candidates Display */}
      {(showCandidates || userData.role === "voter") && (
        <div className="candidates-list">
          <h3>
            {userData.role === "admin" ?
              t("candidates.allCandidates")
            : t("candidates.voteForCandidate")}
          </h3>
          {candidates.length === 0 ?
            <p className="no-data">{t("candidates.noCandidates")}</p>
          : userData.role === "voter" ?
            <div className="voter-table-container">
              <table className="voter-candidates-table">
                <thead>
                  <tr>
                    <th>{t("candidates.colSno")}</th>
                    <th>{t("candidates.colCandidateName")}</th>
                    <th>{t("candidates.colPartyName")}</th>
                    <th>{t("candidates.colPartySymbol")}</th>
                    <th>{t("candidates.colAction")}</th>
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
                        {votedCandidateId === candidate._id ?
                          <button className="voted-btn" disabled>
                            {t("candidates.voted")}
                          </button>
                        : <button
                            onClick={() => handleVoteBtn(candidate._id)}
                            disabled={loadingVote || votedCandidateId !== null}
                            className={`vote-btn ${votedCandidateId !== null ? "disabled-btn" : ""}`}
                          >
                            {loadingVote ?
                              t("candidates.voting")
                            : t("candidates.vote")}
                          </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          : <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate._id} className="candidate-card">
                  <div className="candidate-photo-wrapper">
                    {candidate.photo ?
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="candidate-photo"
                      />
                    : <div className="no-photo">{t("candidates.noPhoto")}</div>}
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
                  <p>
                    {t("candidates.experience")}: {candidate.experience}
                  </p>
                  <p>
                    {t("candidates.agenda")}: {candidate.agenda}
                  </p>
                </div>
              ))}
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default Candidates;
