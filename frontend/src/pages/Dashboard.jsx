import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/dashboard.css";
import apiUrl from "../apiUrl";

// Helper to get only time as "09:00 AM"
function formatOnlyTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// Helper to get only date as "03-Jul-2025"
function formatOnlyDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Helper to get only time as "09:00 AM" or "05:00 PM"
function formatTime(hour, minute = 0) {
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// Helper to mask voter ID: show only first and last character, rest as *
function maskVoterId(voterId) {
  if (!voterId || voterId.length < 2) return voterId || "-";
  const first = voterId[0];
  const last = voterId[voterId.length - 1];
  const masked = "*".repeat(voterId.length - 2);
  return `${first}${masked}${last}`;
}

const PAGE_SIZE = 5;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalVoters: 0,
    totalVotes: 0,
    candidates: [],
    voters: [],
    electionStatus: "Started",
    electionStart: "",
    electionEnd: "",
    timezone: "IST",
    recentVoters: [],
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "voters" or "candidates"
  const [votersPage, setVotersPage] = useState(0);
  const [sidebarPage, setSidebarPage] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/dashboard`);
        if (!res.ok) throw new Error("Failed to fetch dashboard");
        const data = await res.json();

        setStats({
          totalCandidates: data.totalCandidates || 0,
          totalVoters: data.totalVoters || 0,
          totalVotes: data.totalVotes || 0,
          candidates: data.candidates || [],
          voters: data.voters || [],
          electionStatus: data.electionStatus || "Not Started",
          electionStart: formatTime(9, 0), // "09:00 AM"
          electionEnd: formatTime(17, 0), // "05:00 PM"
          timezone: "IST",
          recentVoters: data.recentVoters || [],
        });
      } catch (err) {
        setStats((stats) => ({
          ...stats,
          electionStatus: "Error loading data",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const participationPercent = stats.totalVoters
    ? ((stats.totalVotes / stats.totalVoters) * 100).toFixed(1)
    : 0;

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
    setVotersPage(0); // Reset to first page when opening modal
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setVotersPage(0);
  };

  // Pagination for sidebar
  const totalSidebarPages = Math.ceil(stats.recentVoters.length / PAGE_SIZE);
  const paginatedRecentVoters = stats.recentVoters.slice(
    sidebarPage * PAGE_SIZE,
    sidebarPage * PAGE_SIZE + PAGE_SIZE
  );

  // Pagination for voters modal
  const totalVotersPages = Math.ceil(stats.voters.length / PAGE_SIZE);
  const paginatedVoters = stats.voters.slice(
    votersPage * PAGE_SIZE,
    votersPage * PAGE_SIZE + PAGE_SIZE
  );

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-root">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Election Dashboard</h1>
          <span
            className={`status-badge status-${(
              stats.electionStatus || "unknown"
            ).toLowerCase()}`}
          >
            {stats.electionStatus}
          </span>
        </header>
        <div className="dashboard-desc">
          Welcome to our online voting system admin panel. Monitor election
          stats and manage your process efficiently.
        </div>
        <section className="dashboard-cards">
          <div
            className="dashboard-card candidates-card"
            style={{ cursor: "pointer" }}
            onClick={() => openModal("candidates")}
            title="Click to view all candidates"
          >
            <div className="card-icon" role="img" aria-label="Candidates">
              👤
            </div>
            <div className="card-content">
              <div className="card-label">Total Candidates</div>
              <div className="card-value">{stats.totalCandidates}</div>
            </div>
          </div>
          <div
            className="dashboard-card voters-card"
            style={{ cursor: "pointer" }}
            onClick={() => openModal("voters")}
            title="Click to view all registered voters"
          >
            <div className="card-icon" role="img" aria-label="Voters">
              🗳️
            </div>
            <div className="card-content">
              <div className="card-label">Registered Voters</div>
              <div className="card-value">{stats.totalVoters}</div>
            </div>
          </div>
        </section>
        <section className="dashboard-participation">
          <div className="participation-label">
            Participation: <strong>{participationPercent}%</strong> (
            {stats.totalVotes} of {stats.totalVoters} voters)
          </div>
          <div className="participation-bar-bg">
            <div
              className="participation-bar"
              style={{ width: `${participationPercent}%` }}
            />
          </div>
        </section>
        <section className="dashboard-info">
          <div>
            <strong>Start:</strong> {stats.electionStart}
          </div>
          <div>
            <strong>End:</strong> {stats.electionEnd}
          </div>
          <div>
            <strong>Timezone:</strong> {stats.timezone}
          </div>
        </section>
      </main>
      <aside className="dashboard-right">
        <div
          className="right-title"
          style={{
            marginTop: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Recently Registered Voters</span>
          <span>
            <button
              className="sidebar-nav-btn"
              onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
              disabled={sidebarPage === 0}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <button
              className="sidebar-nav-btn"
              onClick={() =>
                setSidebarPage((p) => Math.min(totalSidebarPages - 1, p + 1))
              }
              disabled={sidebarPage >= totalSidebarPages - 1}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </span>
        </div>
        <ul className="activity-list">
          {paginatedRecentVoters.length === 0 && <li>No recent voters</li>}
          {paginatedRecentVoters.map((voter, idx) => (
            <li key={voter.voterid || idx}>
              <span className="activity-time">
                {formatOnlyTime(voter.createdAt)}
                <br />
                <span className="activity-date">
                  {formatOnlyDate(voter.createdAt)}
                </span>
              </span>
              <span className="activity-text">
                <span className="username">{voter.username}</span> has
                successfully registered on eVote platform
              </span>
            </li>
          ))}
        </ul>
        {totalSidebarPages > 1 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              color: "#1976d2",
              fontSize: "0.98em",
            }}
          >
            Page {sidebarPage + 1} of {totalSidebarPages}
          </div>
        )}
      </aside>

      {/* Modal for voters/candidates */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h2>
              {modalType === "voters" ? "Registered Voters" : "Candidates"}
            </h2>
            {modalType === "voters" && (
              <>
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Voter ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVoters.length === 0 ? (
                      <tr>
                        <td colSpan={4}>No voters found.</td>
                      </tr>
                    ) : (
                      paginatedVoters.map((voter, idx) => (
                        <tr key={voter.voterid || idx}>
                          <td>{votersPage * PAGE_SIZE + idx + 1}</td>
                          <td className="username">{voter.username}</td>
                          <td>{voter.email || "-"}</td>
                          <td>
                            {maskVoterId(voter.voteId || voter.voterid || "-")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {totalVotersPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
                    <button
                      className="sidebar-nav-btn"
                      onClick={() => setVotersPage((p) => Math.max(0, p - 1))}
                      disabled={votersPage === 0}
                      aria-label="Previous"
                    >
                      <FaChevronLeft />
                    </button>
                    <span style={{ color: "#1976d2" }}>
                      Page {votersPage + 1} of {totalVotersPages}
                    </span>
                    <button
                      className="sidebar-nav-btn"
                      onClick={() =>
                        setVotersPage((p) =>
                          Math.min(totalVotersPages - 1, p + 1)
                        )
                      }
                      disabled={votersPage >= totalVotersPages - 1}
                      aria-label="Next"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
            {modalType === "candidates" && (
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Party</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.candidates.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No candidates found.</td>
                    </tr>
                  ) : (
                    stats.candidates.map((candidate, idx) => (
                      <tr key={candidate.candidateid || idx}>
                        <td>{idx + 1}</td>
                        <td className="username">{candidate.name}</td>
                        <td>{candidate.party || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
