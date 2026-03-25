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
import apiUrl from "../apiUrl";
import "../styles/results.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
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

const chartModes = { PIE: "pie", HORIZONTAL: "horizontal", LINE: "line" };
const timePeriods = { HOURLY: "hourly", DAILY: "daily" };

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
};

const ElectionResults = () => {
  const { t } = useTranslation();

  const [results, setResults] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [chartMode, setChartMode] = useState(chartModes.HORIZONTAL);
  const [timePeriod, setTimePeriod] = useState(timePeriods.DAILY);
  const [loading, setLoading] = useState({ results: true, historical: true });
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [turnout, setTurnout] = useState(0);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [partyColors, setPartyColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, results: true }));
        setError("");
        const res = await fetch(`${apiUrl}/api/results`);
        if (!res.ok) throw new Error(t("results.errorFetch"));
        const data = await res.json();
        if (!Array.isArray(data.results))
          throw new Error(t("results.errorFormat"));
        const sortedResults = data.results.sort((a, b) => b.votes - a.votes);
        const winningCandidateId = sortedResults[0]?.id;
        const updatedResults = sortedResults.map((candidate) => ({
          ...candidate,
          status:
            candidate.votes === 0 ? t("results.statusConceded")
            : candidate.id === winningCandidateId ? t("results.statusWinner")
            : t("results.statusTrailing"),
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
  }, [t]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading((prev) => ({ ...prev, historical: true }));
        const res = await fetch(`${apiUrl}/api/results/historical`);
        if (!res.ok) throw new Error("Failed to fetch historical data");
        const data = await res.json();
        setHistoricalData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Historical data fetch error:", err);
        setHistoricalData([]);
      } finally {
        setLoading((prev) => ({ ...prev, historical: false }));
      }
    };
    fetchHistoricalData();
  }, []);

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

  const chartLabels = results.map((r) => r.party);
  const chartData = results.map((r) => r.votes);
  const chartColors = results.map((r) => partyColors[r.party]);

  const pieData = {
    labels: chartLabels,
    datasets: [
      { data: chartData, backgroundColor: chartColors, borderWidth: 1 },
    ],
  };

  const lineData = {
    labels: historicalData.map((h) =>
      new Date(h.timestamp).toLocaleTimeString(),
    ),
    datasets: results.map((candidate) => ({
      label: candidate.candidate,
      data: historicalData.map(
        (h) => h.candidates.find((c) => c.id === candidate.id)?.votes || 0,
      ),
      borderColor: partyColors[candidate.party],
      backgroundColor: partyColors[candidate.party] + "40",
      tension: 0.1,
      fill: true,
    })),
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: t("results.chartTrendTitle") },
    },
    scales: { y: { beginAtZero: true } },
  };

  const downloadCSV = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const header = "Rank,Candidate,Party,Votes,Percentage,Status\n";
    const rows = results
      .map(
        (r, i) =>
          `${i + 1},"${r.candidate}","${r.party}",${r.votes},${r.percentage}%,${r.status}`,
      )
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `election_results_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    const reportData = {
      election: electionInfo,
      results,
      summary: {
        totalVotes,
        winner: winner ? winner.candidate : "",
        winningMargin:
          results.length > 1 && winner && results[1].percentage !== undefined ?
            (winner.percentage - results[1].percentage).toFixed(1)
          : "",
      },
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `election_report_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printResults = () => window.print();

  const shareResults = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${electionInfo.title} Results`,
          text: `View the latest results for ${electionInfo.title}`,
          url: window.location.href,
        });
      } else {
        alert(t("results.shareUnsupported"));
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert(t("results.shareError"));
    }
  };

  const viewCandidateDetails = (candidate) => setSelectedCandidate(candidate);
  const closeCandidateDetails = () => setSelectedCandidate(null);

  const handlePublishResults = async () => {
    if (window.confirm(t("results.publishConfirm"))) {
      setPublishingLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/results/publish`, {
          method: "POST",
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(t("results.publishSuccess"));
        } else {
          toast.error(data.message || t("results.publishError"));
        }
      } catch (err) {
        console.error("Publish error:", err);
        toast.error(t("results.publishError"));
      } finally {
        setPublishingLoading(false);
      }
    }
  };

  return (
    <div className="election-container">
      {/* Header */}
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
              <span className="election-type">{electionInfo.electionType}</span>
              <span className="election-region">{electionInfo.region}</span>
            </div>
            <div className="election-stats">
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">
                    {t("results.electionDate")}
                  </span>
                  <span className="stat-value">
                    {new Date(electionInfo.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">{t("results.totalVotes")}</span>
                  <span className="stat-value">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">
                    {t("results.voterTurnout")}
                  </span>
                  <span className="stat-value">{turnout}%</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <span className="stat-label">
                    {t("results.registeredVoters")}
                  </span>
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
                <span className="winner-label">
                  {t("results.projectedWinner")}
                </span>
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
                    {winner.percentage !== undefined ?
                      winner.percentage + "%"
                    : ""}
                  </span>
                  <span className="winner-votes">
                    {winner.votes !== undefined ?
                      winner.votes.toLocaleString() + " " + t("results.votes")
                    : ""}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => viewCandidateDetails(winner)}
                >
                  {t("results.viewDetails")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          <div className="action-buttons">
            <button className="action-btn" onClick={downloadCSV}>
              <FiDownload /> {t("results.downloadCSV")}
            </button>
            <button className="action-btn" onClick={generateReport}>
              <FiBarChart2 /> {t("results.fullReport")}
            </button>
            <button className="action-btn" onClick={printResults}>
              <FiPrinter /> {t("results.print")}
            </button>
            <button className="action-btn" onClick={shareResults}>
              <FiShare2 /> {t("results.share")}
            </button>
            <button
              className="action-btn"
              onClick={handlePublishResults}
              disabled={publishingLoading}
            >
              {publishingLoading ?
                t("results.publishing")
              : t("results.publish")}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="election-results">
        {loading.results ?
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t("results.loading")}</p>
          </div>
        : error ?
          <div className="error-state">
            <p>
              {t("results.error")}: {error}
            </p>
            <button onClick={() => window.location.reload()}>
              {t("results.retry")}
            </button>
          </div>
        : results.length === 0 ?
          <div className="empty-state">
            <p>{t("results.empty")}</p>
          </div>
        : <>
            {/* Chart Mode Toggle */}
            <div className="chart-controls">
              <div className="chart-mode-toggle">
                <button
                  className={`chart-mode-btn${chartMode === chartModes.HORIZONTAL ? " active" : ""}`}
                  onClick={() => setChartMode(chartModes.HORIZONTAL)}
                >
                  <FiBarChart2 /> {t("results.chartHorizontal")}
                </button>
                <button
                  className={`chart-mode-btn${chartMode === chartModes.PIE ? " active" : ""}`}
                  onClick={() => setChartMode(chartModes.PIE)}
                >
                  <FiPieChart /> {t("results.chartPie")}
                </button>
                {historicalData.length > 0 && (
                  <button
                    className={`chart-mode-btn${chartMode === chartModes.LINE ? " active" : ""}`}
                    onClick={() => setChartMode(chartModes.LINE)}
                  >
                    <FiTrendingUp /> {t("results.chartTrend")}
                  </button>
                )}
              </div>
            </div>

            {/* Chart Section */}
            <div className="chart-section">
              <div className="chart-container">
                {chartMode === chartModes.PIE ?
                  <div className="pie-chart-wrapper">
                    <Pie data={pieData} />
                  </div>
                : chartMode === chartModes.LINE ?
                  <div className="line-chart-wrapper">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                : <div className="horizontal-chart">
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
                                backgroundColor: "#1e88e5",
                              }}
                            >
                              <div className="bar-content">
                                <span className="bar-votes">
                                  {result.votes !== undefined ?
                                    result.votes.toLocaleString()
                                  : ""}
                                </span>
                                <span className="bar-percentage">
                                  {result.percentage !== undefined ?
                                    result.percentage + "%"
                                  : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="row-status">
                            <span
                              className={`status-indicator ${result.status ? result.status.toLowerCase() : ""}`}
                            >
                              {result.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }
              </div>
            </div>
          </>
        }
      </main>
    </div>
  );
};

export default ElectionResults;
