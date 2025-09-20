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

const Dashboard = () => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userRole = userData.role || "voter"; // default to "voter"

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

  // ------------------- FETCH DATA -------------------
  const fetchVoters = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getAllVoters`);
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const data = await response.json();
      const votersArray = Array.isArray(data.voters) ? data.voters : [];
      setVoters(votersArray);

      const votesCastCount = votersArray.filter((v) => v.hasVoted).length;
      const participationRate =
        votersArray.length > 0
          ? ((votesCastCount / votersArray.length) * 100).toFixed(2)
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
      const candidatesArray = Array.isArray(data.candidates)
        ? data.candidates
        : [];
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

  // ------------------- DELETE VOTER -------------------
  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm("Are you sure you want to delete this voter?")) return;

    try {
      const response = await fetch(`${apiUrl}/voter/delete/${voterId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert("Voter deleted successfully");
        setVoters((prev) => prev.filter((v) => v.voterId !== voterId));

        // Update stats
        const votesCastCount = voters.filter(
          (v) => v.hasVoted && v.voterId !== voterId
        ).length;
        const participationRate =
          voters.length > 1
            ? ((votesCastCount / (voters.length - 1)) * 100).toFixed(2)
            : 0;

        setStats((prev) => ({
          ...prev,
          totalVoters: prev.totalVoters - 1,
          votesCast: votesCastCount,
          participationRate,
        }));
      } else {
        alert(data.message || "Failed to delete voter");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting voter");
    }
  };

  const chartData = candidates.map((candidate) => ({
    name: candidate.name,
    votes: candidate.votes || 0,
  }));

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error?.message || String(error)}</p>
        <button onClick={refreshData}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="voting-dashboard">
      <div className="dashboard-container">
        {/* Stats Section */}
        <div className="stats-grid">
          <div
            className="stat-card clickable"
            onClick={() => setActiveView("voters")}
            title="Click to view voters list"
          >
            <FaUsers />
            <h3>{stats.totalVoters}</h3>
            <p>Total Voters</p>
          </div>

          <div
            className="stat-card clickable"
            onClick={() => setActiveView("candidates")}
            title="Click to view candidates list"
          >
            <FaUserTie />
            <h3>{stats.totalCandidates}</h3>
            <p>Total Candidates</p>
          </div>

          <div className="stat-card">
            <FaVoteYea />
            <h3>{stats.votesCast}</h3>
            <p>Votes Casted</p>
          </div>

          <div className="stat-card">
            <FaChartLine />
            <h3>{stats.participationRate}%</h3>
            <p>Participation Rate</p>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="dashboard-content single-panel">
          {activeView === "voters" && (
            <div className="data-panel full-width">
              <div className="panel-header">
                <h2>
                  <FaUsers /> Recently Registered Voters
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <FaSyncAlt /> Refresh Data
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      {userRole === "admin" && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter) => (
                      <tr key={voter._id}>
                        <td>{`${voter.firstName} ${voter.lastName}`}</td>
                        <td>{voter.email}</td>
                        <td>
                          {voter.createdAt
                            ? new Date(voter.createdAt).toLocaleDateString()
                            : ""}
                        </td>
                        <td>
                          <span
                            className={`status ${
                              voter.status?.toLowerCase() || ""
                            }`}
                          >
                            {voter.status || ""}
                          </span>
                          <span
                            className={`voted-status ${
                              voter.hasVoted ? "voted" : "not-voted"
                            }`}
                          >
                            {voter.hasVoted ? "Voted" : "Not Voted"}
                          </span>
                        </td>
                        {userRole === "admin" && (
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteVoter(voter.voterId)}
                              title="Delete Voter"
                            >Delete voter
                              {/* <FaTrash /> */}
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
                  <FaUserTie /> Registered Candidates
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <FaSyncAlt /> Refresh Data
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Party</th>
                      <th>Votes</th>
                      <th>Status</th>
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
                            className={`status ${
                              candidate.status?.toLowerCase() || ""
                            }`}
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
