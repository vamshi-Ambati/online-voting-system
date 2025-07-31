import React, { useState, useEffect } from "react";
import "../styles/results.css";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import apiUrl from "../apiUrl";

// Register chart elements
Chart.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const electionInfo = {
  title: "2024 Mayoral Election",
  subtitle: "Official Results - Final Count",
  date: "2024-11-05",
  status: "CERTIFIED",
  totalVoters: 107000,
  turnout: 78.5,
  precincts: "All 45 precincts reporting",
  lastUpdated: "2024-11-06 08:30 AM EST",
};

const chartModes = {
  BAR: "bar",
  PIE: "pie",
  HORIZONTAL: "horizontal",
};

// Utility to get the full party image URL
const getPartyImgUrl = (partyImg) => {
  if (!partyImg) return ""; // fallback if missing
  if (/^https?:\/\//.test(partyImg)) return partyImg;
  return `${apiUrl}${partyImg}`;
};

const ElectionResults = () => {
  const [results, setResults] = useState([]);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [chartMode, setChartMode] = useState(chartModes.HORIZONTAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch results from backend
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${apiUrl}/api/results`);
        if (!response.ok) throw new Error("Failed to fetch results");
        let data = await response.json();
        // Sort by votes descending (just in case)
        data = data.sort((a, b) => b.votes - a.votes);
        setResults(data);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const winner = results.length > 0 ? results[0] : null;
  const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const maxVotes = results.length > 0 ? Math.max(...results.map((r) => r.votes || 0)) : 0;

  // Prepare data for Pie and Bar charts
  const chartLabels = results.map((r) => r.candidate);
  const chartData = results.map((r) => r.votes);
  const chartColors = results.map((r) => r.color);

  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Votes",
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    indexAxis: chartMode === chartModes.HORIZONTAL ? "y" : "x",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const downloadCSV = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const header = "Rank,Candidate,Party,Votes,Percentage,Status\n";
    const rows = results
      .map(
        (r, index) =>
          `${index + 1},"${r.candidate}","${r.party}",${r.votes},${r.percentage}%,${r.status}`
      )
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `election_results_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    const reportData = {
      election: electionInfo,
      results: results,
      summary: {
        totalVotes,
        winner: winner ? winner.candidate : "",
        winningMargin:
          results.length > 1 && winner && results[1].percentage !== undefined
            ? (winner.percentage - results[1].percentage).toFixed(1)
            : "",
      },
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `election_report_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="election-container">
      {/* Header Section */}
      <header className="election-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="election-title">{electionInfo.title}</h1>
            <p className="election-subtitle">{electionInfo.subtitle}</p>
            <div className="election-meta">
              <span className={`status-badge ${electionInfo.status.toLowerCase()}`}>
                {electionInfo.status}
              </span>
              <span className="precincts-info">{electionInfo.precincts}</span>
            </div>
            <div className="election-stats">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div className="stat-content">
                  <span className="stat-label">Election Date</span>
                  <span className="stat-value">
                    {new Date(electionInfo.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🗳️</span>
                <div className="stat-content">
                  <span className="stat-label">Total Votes</span>
                  <span className="stat-value">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-content">
                  <span className="stat-label">Voter Turnout</span>
                  <span className="stat-value">{electionInfo.turnout}%</span>
                </div>
              </div>
            </div>
          </div>
          {/* Winner Card */}
          {winner && (
            <div className="winner-card">
              <div className="winner-header">
                <span className="winner-icon">🏆</span>
                <span className="winner-label">Projected Winner</span>
              </div>
              {/* Party Symbol */}
              <img
                src={getPartyImgUrl(winner.partyImg)}
                alt={winner.party}
                className="party-logo"
                style={{
                  width: 48,
                  height: 48,
                  margin: "0.5em 0 0.3em 0",
                  border: "2px solid #e5e7eb",
                  background: "#f4f6fa",
                  objectFit: "contain"
                }}
                onError={e => { e.target.style.display = "none"; }}
              />
              <h3 className="winner-name">{winner.candidate}</h3>
              <p className="winner-party">{winner.party}</p>
              <div className="winner-stats">
                <span className="winner-percentage">
                  {winner.percentage !== undefined ? winner.percentage + "%" : ""}
                </span>
                <span className="winner-votes">
                  {winner.votes !== undefined ? winner.votes.toLocaleString() + " votes" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="header-actions">
          <div className="action-buttons">
            <button className="action-btn secondary" onClick={downloadCSV}>
              ⬇️ Download CSV
            </button>
            <button className="action-btn primary" onClick={generateReport}>
              📄 Generate Report
            </button>
          </div>
        </div>
      </header>

      {/* Chart Mode Toggle */}
      <div className="chart-mode-toggle" style={{ textAlign: "center", margin: "1.5em 0" }}>
        <button
          className={`chart-mode-btn${chartMode === chartModes.HORIZONTAL ? " active" : ""}`}
          onClick={() => setChartMode(chartModes.HORIZONTAL)}
        >
          Horizontal Bar
        </button>
        <button
          className={`chart-mode-btn${chartMode === chartModes.BAR ? " active" : ""}`}
          onClick={() => setChartMode(chartModes.BAR)}
        >
          Vertical Bar
        </button>
        <button
          className={`chart-mode-btn${chartMode === chartModes.PIE ? " active" : ""}`}
          onClick={() => setChartMode(chartModes.PIE)}
        >
          Pie Chart
        </button>
      </div>

      {/* Results Section - Chart View */}
      <main className="election-results">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2em" }}>
            Loading candidates...
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: "2em" }}>
            Error: {error}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2em" }}>
            No candidates found.
          </div>
        ) : (
          <div className="chart-section">
            <div className="chart-header">
              <h2>Vote Distribution</h2>
              <p>
                {chartMode === chartModes.PIE
                  ? "Pie chart of votes"
                  : "Hover over bars for detailed information"}
              </p>
            </div>
            {/* Chart Rendering */}
            {chartMode === chartModes.PIE ? (
              <div className="pie-chart-wrapper" style={{ maxWidth: 420, margin: "0 auto" }}>
                <Pie data={pieData} />
              </div>
            ) : chartMode === chartModes.BAR ? (
              <div className="bar-chart-wrapper" style={{ maxWidth: 600, margin: "0 auto" }}>
                <Bar data={barData} options={barOptions} />
              </div>
            ) : (
              <div className="horizontal-chart">
                {results.map((result, index) => {
                  const barWidth = maxVotes > 0 ? (result.votes / maxVotes) * 100 : 0;
                  const isHovered = hoveredCandidate === result.id;
                  return (
                    <div
                      className={`chart-row ${isHovered ? "hovered" : ""}`}
                      key={result.id}
                      onMouseEnter={() => setHoveredCandidate(result.id)}
                      onMouseLeave={() => setHoveredCandidate(null)}
                    >
                      <div className="row-rank">#{index + 1}</div>
                      <div className="row-candidate">
                        <img
                          src={getPartyImgUrl(result.partyImg)}
                          alt={result.party}
                          className="party-logo"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="candidate-info">
                          <span className="candidate-name">{result.candidate}</span>
                          <span className="candidate-party">{result.party}</span>
                        </div>
                      </div>
                      <div className="row-chart">
                        <div
                          className="chart-bar"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: result.color,
                          }}
                        >
                          <div className="bar-content">
                            <span className="bar-votes">
                              {result.votes !== undefined ? result.votes.toLocaleString() : ""}
                            </span>
                            <span className="bar-percentage">
                              {result.percentage !== undefined ? result.percentage + "%" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="row-status">
                        <span className={`status-indicator ${result.status ? result.status.toLowerCase() : ""}`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="election-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p className="last-updated">
              Last updated: {electionInfo.lastUpdated}
            </p>
            <p className="disclaimer">
              Results are unofficial until certified by the Election Commission
            </p>
          </div>
          <div className="footer-legend">
            <h4>Party Colors</h4>
            <div className="legend-items">
              {results.map((result) => (
                <div className="legend-item" key={result.id}>
                  <span
                    className="legend-color"
                    style={{ backgroundColor: result.color }}
                  ></span>
                  <span className="legend-label">{result.party}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElectionResults;
