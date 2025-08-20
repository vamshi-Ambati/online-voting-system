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

const Dashboard = () => {
  const [userRole] = useState("voter"); // or "admin"

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

  // Show registered voters view by default
  const [activeView, setActiveView] = useState("voters");

  const fetchVoters = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates/getAllVoters`);
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const data = await response.json();
      const votersArray = Array.isArray(data.voters) ? data.voters : [];
      setVoters(votersArray);
      setStats((prev) => ({ ...prev, totalVoters: votersArray.length }));
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
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error?.message || String(error)}</p>
        <button onClick={refreshData}>Retry</button>
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
            <i className="fas fa-users"></i>
            <h3>{stats.totalVoters}</h3>
            <p>Total Voters</p>
          </div>

          <div
            className="stat-card clickable"
            onClick={() => setActiveView("candidates")}
            title="Click to view candidates list"
          >
            <i className="fas fa-user-tie"></i>
            <h3>{stats.totalCandidates}</h3>
            <p>Total Candidates</p>
          </div>

          <div className="stat-card">
            <i className="fas fa-vote-yea"></i>
            <h3>{stats.votesCast}</h3>
            <p>Votes Casted</p>
          </div>

          <div className="stat-card">
            <i className="fas fa-chart-line"></i>
            <h3>{stats.participationRate}%</h3>
            <p>Participation Rate</p>
          </div>
        </div>

        {/* Conditionally Render Panels */}
        <div className="dashboard-content single-panel">
          {activeView === "voters" && (
            <div className="data-panel full-width">
              <div className="panel-header">
                <h2>
                  <i className="fas fa-users"></i> Recently Registered Voters
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <i className="fas fa-sync-alt"></i> Refresh Data
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
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter) => (
                      <tr key={voter._id}>
                        <td>
                          {`${voter.firstName} ${voter.middleName} ${voter.lastName}`
                            .replace(/\s+/g, " ")
                            .trim()}
                        </td>
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
                  <i className="fas fa-user-tie"></i> Registered Candidates
                </h2>
                <button className="refresh-btn" onClick={refreshData}>
                  <i className="fas fa-sync-alt"></i> Refresh Data
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

        {/* Voting Results Chart - only for admin */}
        {userRole === "admin" && (
          <div className="chart-panel">
            <h2>
              <i className="fas fa-chart-bar"></i> Voting Results
            </h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#2a5298" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <footer className="dashboard-footer">
        <p>© 2025 Online Voting System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
