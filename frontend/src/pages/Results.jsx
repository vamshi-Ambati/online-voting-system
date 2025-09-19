import React, { useState, useEffect } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import {
  FiDownload,
  FiPrinter,
  FiShare2,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import apiUrl from "../apiUrl";
import "../styles/results.css";

// Register chart elements
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const electionInfo = {
  title: "2025 BIHER Election",
  subtitle: "Official Results - Final Count",
  date: "2025-11-05",
  status: "CERTIFIED",
  totalVoters: 107000,
  turnout: 78.5,
  lastUpdated: "2025-11-06 08:30 AM EST",
  electionType: "Educational",
  region: "Chennai, India",
  electionOfficer: "Vamshi Ambati",
  contactEmail: "elections@metro.city.gov",
};

const chartModes = {
  PIE: "pie",
  HORIZONTAL: "horizontal",
  LINE: "line",
};

const timePeriods = {
  HOURLY: "hourly",
  DAILY: "daily",
  BY_REGION: "by_region",
};

// Utility to get the full party image URL
const getPartyImgUrl = (partyImg) => {
  if (!partyImg) return "";
  if (/^https?:\/\//.test(partyImg)) return partyImg;
  return `${apiUrl}${partyImg}`;
};

// Utility to generate a unique random color
const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ElectionResults = () => {
  const [results, setResults] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [chartMode, setChartMode] = useState(chartModes.HORIZONTAL);
  const [timePeriod, setTimePeriod] = useState(timePeriods.DAILY);
  const [loading, setLoading] = useState({
    results: true,
    historical: true,
    regional: true,
  });
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [turnout, setTurnout] = useState(0);

  // State to store unique colors for each party
  const [partyColors, setPartyColors] = useState({});

  // Fetch results from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, results: true }));
        setError("");

        const res = await fetch(`${apiUrl}/api/results`);
        if (!res.ok) throw new Error("Failed to fetch results");

        const data = await res.json();

        if (!Array.isArray(data.results)) {
          throw new Error("Invalid results format from backend");
        }

        const sortedResults = data.results.sort((a, b) => b.votes - a.votes);
        const winningCandidateId = sortedResults[0]?.id;

        const updatedResults = sortedResults.map((candidate) => ({
          ...candidate,
          status:
            candidate.votes === 0
              ? "Conceded"
              : candidate.id === winningCandidateId
              ? "Winner"
              : "Trailing",
        }));

        setResults(updatedResults);
        setTotalVoters(data.totalVoters);
        setTurnout(data.turnout);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading((prev) => ({ ...prev, results: false }));
      }
    };

    fetchData();
  }, []);

  // Effect to assign a unique color to each party
  useEffect(() => {
    const newPartyColors = { ...partyColors };
    results.forEach((result) => {
      if (!newPartyColors[result.party]) {
        newPartyColors[result.party] = generateRandomColor();
      }
    });
    setPartyColors(newPartyColors);
  }, [results]);

  const winner = results.length > 0 ? results[0] : null;
  const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const maxVotes =
    results.length > 0 ? Math.max(...results.map((r) => r.votes || 0)) : 0;

  // Prepare data for charts using the assigned party colors
  const chartLabels = results.map((r) => r.party);
  const chartData = results.map((r) => r.votes);
  const chartColors = results.map((r) => partyColors[r.party]);

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

  const lineData = {
    labels: historicalData.map((h) =>
      new Date(h.timestamp).toLocaleTimeString()
    ),
    datasets: results.map((candidate) => ({
      label: candidate.candidate,
      data: historicalData.map(
        (h) => h.candidates.find((c) => c.id === candidate.id)?.votes || 0
      ),
      borderColor: partyColors[candidate.party],
      backgroundColor: partyColors[candidate.party] + "40",
      tension: 0.1,
      fill: true,
    })),
  };

  const regionalBarData = {
    labels: regionalData.map((r) => r.region),
    datasets: results.map((candidate) => ({
      label: candidate.candidate,
      data: regionalData.map(
        (r) => r.candidates.find((c) => c.id === candidate.id)?.votes || 0
      ),
      backgroundColor: partyColors[candidate.party] + "80",
      borderColor: partyColors[candidate.party],
      borderWidth: 1,
    })),
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Vote Progression Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const regionalOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Votes by Region",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  const downloadCSV = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const header = "Rank,Candidate,Party,Votes,Percentage,Status\n";
    const rows = results
      .map(
        (r, index) =>
          `${index + 1},"${r.candidate}","${r.party}",${r.votes},${
            r.percentage
          }%,${r.status}`
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
    link.download = `election_report_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printResults = () => {
    window.print();
  };

  const shareResults = async () => {
    try {
      await navigator.share({
        title: `${electionInfo.title} Results`,
        text: `View the latest results for ${electionInfo.title}`,
        url: window.location.href,
      });
    } catch (err) {
      alert("Share functionality is not supported in your browser");
    }
  };

  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeCandidateDetails = () => {
    setSelectedCandidate(null);
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
              <span
                className={`status-badge ${electionInfo.status.toLowerCase()}`}
              >
                {electionInfo.status}
              </span>
              <span className="precincts-info">{electionInfo.precincts}</span>
              <span className="election-type">{electionInfo.electionType}</span>
              <span className="election-region">{electionInfo.region}</span>
            </div>
            <div className="election-stats">
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">Election Date</span>
                  <span className="stat-value">
                    {new Date(electionInfo.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">Total Votes</span>
                  <span className="stat-value">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">Voter Turnout</span>
                  <span className="stat-value">{turnout}%</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">Registered Voters</span>
                  <span className="stat-value">
                    {totalVoters.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Card */}
          {winner && (
            <div className="winner-card">
              <div className="winner-header">
                <span className="winner-label">Projected Winner</span>
              </div>
              <div className="winner-content">
                <img
                  src={winner.partyImg}
                  alt={winner.party}
                  className="party-logo"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <h3 className="winner-name">{winner.candidate}</h3>
                <p className="winner-party">{winner.party}</p>
                <div className="winner-stats">
                  <span className="winner-percentage">
                    {winner.percentage !== undefined
                      ? winner.percentage + "%"
                      : ""}
                  </span>
                  <span className="winner-votes">
                    {winner.votes !== undefined
                      ? winner.votes.toLocaleString() + " votes"
                      : ""}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => viewCandidateDetails(winner)}
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          <div className="action-buttons">
            <button className="action-btn" onClick={downloadCSV}>
              <FiDownload /> Download CSV
            </button>
            <button className="action-btn" onClick={generateReport}>
              <FiBarChart2 /> Full Report
            </button>
            <button className="action-btn" onClick={printResults}>
              <FiPrinter /> Print
            </button>
            <button className="action-btn" onClick={shareResults}>
              <FiShare2 /> Share
            </button>
            <button className="action-btn">Publish</button>
          </div>
        </div>
      </header>

      {/* Main Content (no toggle) */}
      <main className="election-results">
        {loading.results ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading election results...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p>No candidates found for this election.</p>
          </div>
        ) : (
          <>
            {/* Chart Mode Toggle */}
            <div className="chart-controls">
              <div className="chart-mode-toggle">
                <button
                  className={`chart-mode-btn${
                    chartMode === chartModes.HORIZONTAL ? " active" : ""
                  }`}
                  onClick={() => setChartMode(chartModes.HORIZONTAL)}
                >
                  <FiBarChart2 /> Horizontal
                </button>
                <button
                  className={`chart-mode-btn${
                    chartMode === chartModes.PIE ? " active" : ""
                  }`}
                  onClick={() => setChartMode(chartModes.PIE)}
                >
                  <FiPieChart /> Pie Chart
                </button>
                {historicalData.length > 0 && (
                  <button
                    className={`chart-mode-btn${
                      chartMode === chartModes.LINE ? " active" : ""
                    }`}
                    onClick={() => setChartMode(chartModes.LINE)}
                  >
                    <FiTrendingUp /> Trend
                  </button>
                )}
              </div>
            </div>

            {/* Main Chart View */}
            <div className="chart-section">
              <div className="chart-container">
                {chartMode === chartModes.PIE ? (
                  <div className="pie-chart-wrapper">
                    <Pie data={pieData} />
                  </div>
                ) : chartMode === chartModes.LINE ? (
                  <div className="line-chart-wrapper">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                ) : (
                  <div className="horizontal-chart">
                    {results.map((result, index) => {
                      const barWidth =
                        maxVotes > 0 ? (result.votes / maxVotes) * 100 : 0;
                      const isHovered = hoveredCandidate === result.id;
                      // const partyColor = partyColors[result.party];
                      return (
                        <div
                          className={`chart-row ${isHovered ? "hovered" : ""}`}
                          key={result.id}
                          onMouseEnter={() => setHoveredCandidate(result.id)}
                          onMouseLeave={() => setHoveredCandidate(null)}
                          onClick={() => viewCandidateDetails(result)}
                        >
                          <div className="row-rank">#{index + 1}</div>
                          <div className="row-candidate">
                            {/* <img
                              src={result.partyImg}
                              alt={result.party}
                              height={32}
                              width={32}
                              className="party-logo"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            /> */}
                            <div className="candidate-info">
                              <span className="candidate-name">
                                {result.candidate}
                              </span>
                              <span className="candidate-party">
                                {result.party}
                              </span>
                            </div>
                          </div>
                          <div className="row-chart">
                            <div
                              className="chart-bar"
                              style={{
                                width: `${barWidth}%`,
                                // backgroundColor: partyColor,
                                backgroundColor: "#1e88e5",
                              }}
                            >
                              <div className="bar-content">
                                <span className="bar-votes">
                                  {result.votes !== undefined
                                    ? result.votes.toLocaleString()
                                    : ""}
                                </span>
                                <span className="bar-percentage">
                                  {result.percentage !== undefined
                                    ? result.percentage + "%"
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="row-status">
                            <span
                              className={`status-indicator ${
                                result.status ? result.status.toLowerCase() : ""
                              }`}
                            >
                              {result.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ElectionResults;
