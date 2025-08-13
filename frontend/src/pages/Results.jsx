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
import "../styles/results.css"
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
  title: "2024 Mayoral Election",
  subtitle: "Official Results - Final Count",
  date: "2024-11-05",
  status: "CERTIFIED",
  totalVoters: 107000,
  turnout: 78.5,
  precincts: "All 45 precincts reporting",
  lastUpdated: "2024-11-06 08:30 AM EST",
  electionType: "Municipal",
  region: "Metro City",
  electionOfficer: "Jane Smith",
  contactEmail: "elections@metro.city.gov",
};

const chartModes = {
  BAR: "bar",
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
  const [expandedView, setExpandedView] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch results from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, results: true }));
        setError("");

        // Fetch main results
        const resultsResponse = await fetch(`${apiUrl}/api/results`);
        if (!resultsResponse.ok) throw new Error("Failed to fetch results");
        let resultsData = await resultsResponse.json();
        resultsData = resultsData.sort((a, b) => b.votes - a.votes);
        setResults(resultsData);

        // Fetch historical data
        const historicalResponse = await fetch(
          `${apiUrl}/api/results/historical`
        );
        if (historicalResponse.ok) {
          const historicalData = await historicalResponse.json();
          setHistoricalData(historicalData);
        }

        // Fetch regional data
        const regionalResponse = await fetch(`${apiUrl}/api/results/regional`);
        if (regionalResponse.ok) {
          const regionalData = await regionalResponse.json();
          setRegionalData(regionalData);
        }
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading((prev) => ({
          ...prev,
          results: false,
          historical: false,
          regional: false,
        }));
      }
    };
    fetchData();
  }, []);

  const winner = results.length > 0 ? results[0] : null;
  const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const maxVotes =
    results.length > 0 ? Math.max(...results.map((r) => r.votes || 0)) : 0;

  // Prepare data for charts
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

  const lineData = {
    labels: historicalData.map((h) =>
      new Date(h.timestamp).toLocaleTimeString()
    ),
    datasets: results.map((candidate) => ({
      label: candidate.candidate,
      data: historicalData.map(
        (h) => h.candidates.find((c) => c.id === candidate.id)?.votes || 0
      ),
      borderColor: candidate.color,
      backgroundColor: candidate.color + "40",
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
      backgroundColor: candidate.color + "80",
      borderColor: candidate.color,
      borderWidth: 1,
    })),
  };

  const barOptions = {
    indexAxis: chartMode === chartModes.HORIZONTAL ? "y" : "x",
    responsive: true,
    plugins: {
      legend: { display: chartMode !== chartModes.HORIZONTAL },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
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
      // Fallback for browsers that don't support Web Share API
      alert("Share functionality is not supported in your browser");
    }
  };

  const toggleExpandedView = () => {
    setExpandedView(!expandedView);
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
                  <span className="stat-value">{electionInfo.turnout}%</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">Registered Voters</span>
                  <span className="stat-value">
                    {electionInfo.totalVoters.toLocaleString()}
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
                  src={getPartyImgUrl(winner.partyImg)}
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
          </div>
        </div>
      </header>

      {/* Main Content Toggle */}
      <div className="content-toggle">
        <button onClick={toggleExpandedView} className="toggle-btn">
          {expandedView ? (
            <>
              <FaChevronUp /> Show Simplified View
            </>
          ) : (
            <>
              <FaChevronDown /> Show Detailed Analysis
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
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
                    chartMode === chartModes.BAR ? " active" : ""
                  }`}
                  onClick={() => setChartMode(chartModes.BAR)}
                >
                  <FiBarChart2 /> Vertical
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
                ) : chartMode === chartModes.BAR ? (
                  <div className="bar-chart-wrapper">
                    <Bar data={barData} options={barOptions} />
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
                            <img
                              src={getPartyImgUrl(result.partyImg)}
                              alt={result.party}
                              className="party-logo"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
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
                                backgroundColor: result.color,
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

            {/* Expanded Analysis View */}
            {expandedView && (
              <div className="analysis-section">
                <div className="analysis-tabs">
                  <div className="tab-header">
                    <h3>Detailed Analysis</h3>
                  </div>

                  {/* Regional Breakdown */}
                  {regionalData.length > 0 && (
                    <div className="analysis-tab">
                      <h4>Regional Breakdown</h4>
                      <div className="regional-chart">
                        <Bar data={regionalBarData} options={regionalOptions} />
                      </div>
                      <div className="regional-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Region</th>
                              {results.map((candidate) => (
                                <th key={candidate.id}>
                                  {candidate.candidate}
                                </th>
                              ))}
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {regionalData.map((region) => (
                              <tr key={region.region}>
                                <td>{region.region}</td>
                                {results.map((candidate) => (
                                  <td key={candidate.id}>
                                    {region.candidates
                                      .find((c) => c.id === candidate.id)
                                      ?.votes.toLocaleString() || "0"}
                                  </td>
                                ))}
                                <td>{region.totalVotes.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Historical Trends */}
                  {historicalData.length > 0 && (
                    <div className="analysis-tab">
                      <h4>Vote Progression</h4>
                      <div className="time-period-toggle">
                        <button
                          className={`time-period-btn${
                            timePeriod === timePeriods.HOURLY ? " active" : ""
                          }`}
                          onClick={() => setTimePeriod(timePeriods.HOURLY)}
                        >
                          Hourly
                        </button>
                        <button
                          className={`time-period-btn${
                            timePeriod === timePeriods.DAILY ? " active" : ""
                          }`}
                          onClick={() => setTimePeriod(timePeriods.DAILY)}
                        >
                          Daily
                        </button>
                      </div>
                      <div className="trend-chart">
                        <Line data={lineData} options={lineOptions} />
                      </div>
                    </div>
                  )}

                  {/* Demographic Breakdown (placeholder) */}
                  <div className="analysis-tab">
                    <h4>Demographic Analysis</h4>
                    <div className="demographic-placeholder">
                      <p>
                        Detailed demographic breakdown will be available after
                        full data processing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
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
              Results are unofficial until certified by the Election Commission.
              Contact {electionInfo.electionOfficer} at{" "}
              {electionInfo.contactEmail} for questions.
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

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="candidate-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeCandidateDetails}>
              &times;
            </button>
            <div className="modal-header">
              <img
                src={getPartyImgUrl(selectedCandidate.partyImg)}
                alt={selectedCandidate.party}
                className="modal-party-logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h3>{selectedCandidate.candidate}</h3>
              <p className="candidate-party">{selectedCandidate.party}</p>
            </div>
            <div className="modal-body">
              <div className="candidate-stats">
                <div className="stat-box">
                  <span className="stat-label">Total Votes</span>
                  <span className="stat-value">
                    {selectedCandidate.votes.toLocaleString()}
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Vote Percentage</span>
                  <span className="stat-value">
                    {selectedCandidate.percentage}%
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Rank</span>
                  <span className="stat-value">
                    #
                    {results.findIndex((r) => r.id === selectedCandidate.id) +
                      1}
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Status</span>
                  <span
                    className={`stat-value status-${selectedCandidate.status.toLowerCase()}`}
                  >
                    {selectedCandidate.status}
                  </span>
                </div>
              </div>

              {regionalData.length > 0 && (
                <div className="regional-performance">
                  <h4>Regional Performance</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Votes</th>
                        <th>% of Region</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionalData.map((region) => {
                        const candidateData = region.candidates.find(
                          (c) => c.id === selectedCandidate.id
                        );
                        const regionVotes = candidateData?.votes || 0;
                        const regionPercentage =
                          region.totalVotes > 0
                            ? ((regionVotes / region.totalVotes) * 100).toFixed(
                                1
                              )
                            : 0;
                        const totalPercentage = (
                          (regionVotes / totalVotes) *
                          100
                        ).toFixed(1);

                        return (
                          <tr key={region.region}>
                            <td>{region.region}</td>
                            <td>{regionVotes.toLocaleString()}</td>
                            <td>{regionPercentage}%</td>
                            <td>{totalPercentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionResults;
