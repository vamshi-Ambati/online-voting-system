import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiUrl from "../apiUrl";
import {
  FaTrash,
  FaUsers,
  FaUserTie,
  FaVoteYea,
  FaChartLine,
  FaSyncAlt,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userRole = userData.role || "voter";

  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalCandidates: 0,
    votesCast: 0,
    participationRate: 0,
  });
  const [activeView, setActiveView] = useState("voters");

  const fetchVoters = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getAllVoters`);
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const data = await response.json();
      const votersArray = Array.isArray(data.voters) ? data.voters : [];
      setVoters(votersArray);
      const votesCastCount = votersArray.filter((v) => v.hasVoted).length;
      const participationRate =
        votersArray.length > 0 ?
          ((votesCastCount / votersArray.length) * 100).toFixed(2)
        : 0;
      setStats((prev) => ({
        ...prev,
        totalVoters: votersArray.length,
        votesCast: votesCastCount,
        participationRate,
      }));
    } catch (err) {
      setError(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getCandidates`);
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const data = await response.json();
      const candidatesArray =
        Array.isArray(data.candidates) ? data.candidates : [];
      setCandidates(candidatesArray);
      setStats((prev) => ({
        ...prev,
        totalCandidates: candidatesArray.length,
      }));
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchVoters(), fetchCandidates()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchVoters(), fetchCandidates()]);
    setLoading(false);
  };

  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm(t("dashboard.deleteConfirm"))) return;
    try {
      const response = await fetch(`${apiUrl}/voter/delete/${voterId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert(t("dashboard.deleteSuccess"));
        setVoters((prev) => prev.filter((v) => v.voterId !== voterId));
        const votesCastCount = voters.filter(
          (v) => v.hasVoted && v.voterId !== voterId,
        ).length;
        const participationRate =
          voters.length > 1 ?
            ((votesCastCount / (voters.length - 1)) * 100).toFixed(2)
          : 0;
        setStats((prev) => ({
          ...prev,
          totalVoters: prev.totalVoters - 1,
          votesCast: votesCastCount,
          participationRate,
        }));
      } else {
        alert(data.message || t("dashboard.deleteFail"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("dashboard.deleteError"));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error?.message || String(error)}</p>
        <button onClick={refreshData}>
          <FaSyncAlt /> {t("dashboard.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="voting-dashboard">
      <div className="dashboard-container">
        {/* Stats */}
        <div className="stats-grid">
          <div
            className="stat-card clickable"
            onClick={() => setActiveView("voters")}
            title={t("dashboard.viewVoters")}
          >
            <FaUsers />
            <h3>{stats.totalVoters}</h3>
            <p>{t("dashboard.totalVoters")}</p>
          </div>
          <div
            className="stat-card clickable"
            onClick={() => setActiveView("candidates")}
            title={t("dashboard.viewCandidates")}
          >
            <FaUserTie />
            <h3>{stats.totalCandidates}</h3>
            <p>{t("dashboard.totalCandidates")}</p>
          </div>
          <div className="stat-card">
            <FaVoteYea />
            <h3>{stats.votesCast}</h3>
            <p>{t("dashboard.votesCast")}</p>
          </div>
          <div className="stat-card">
            <FaChartLine />
            <h3>{stats.participationRate}%</h3>
            <p>{t("dashboard.participationRate")}</p>
          </div>
        </div>

        {/* Panels */}
        <div className="dashboard-content single-panel">
          {activeView === "voters" && (
            <div className="data-panel full-width">
              <div className="panel-header">
                <h2>
                  <FaUsers /> {t("dashboard.recentVoters")}
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <FaSyncAlt /> {t("dashboard.refreshData")}
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("dashboard.colName")}</th>
                      <th>{t("dashboard.colEmail")}</th>
                      <th>{t("dashboard.colRegDate")}</th>
                      <th>{t("dashboard.colStatus")}</th>
                      {userRole === "admin" && (
                        <th>{t("dashboard.colAction")}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter) => (
                      <tr key={voter._id}>
                        <td>{`${voter.firstName} ${voter.lastName}`}</td>
                        <td>{voter.email}</td>
                        <td>
                          {voter.createdAt ?
                            new Date(voter.createdAt).toLocaleDateString()
                          : ""}
                        </td>
                        <td>
                          <span
                            className={`status ${voter.status?.toLowerCase() || ""}`}
                          >
                            {voter.status || ""}
                          </span>
                          <span
                            className={`voted-status ${voter.hasVoted ? "voted" : "not-voted"}`}
                          >
                            {voter.hasVoted ?
                              t("dashboard.voted")
                            : t("dashboard.notVoted")}
                          </span>
                        </td>
                        {userRole === "admin" && (
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteVoter(voter.voterId)}
                              title={t("dashboard.deleteVoter")}
                            >
                              {t("dashboard.deleteVoter")}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "candidates" && (
            <div className="data-panel full-width">
              <div className="panel-header">
                <h2>
                  <FaUserTie /> {t("dashboard.registeredCandidates")}
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <FaSyncAlt /> {t("dashboard.refreshData")}
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("dashboard.colName")}</th>
                      <th>{t("dashboard.colParty")}</th>
                      <th>{t("dashboard.colVotes")}</th>
                      <th>{t("dashboard.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate._id}>
                        <td>{candidate.name}</td>
                        <td>{candidate.party}</td>
                        <td>{candidate.votes}</td>
                        <td>
                          <span
                            className={`status ${candidate.status?.toLowerCase() || ""}`}
                          >
                            {candidate.status || ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
