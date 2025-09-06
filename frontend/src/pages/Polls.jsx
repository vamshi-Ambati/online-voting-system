import React, { useEffect, useState } from "react";
import apiUrl from "../apiUrl";
import "../styles/polls.css";

const Polls = () => {
  // Get userData from localStorage and parse JSON
  const storedUserData = localStorage.getItem("userData");
  const userData = storedUserData ? JSON.parse(storedUserData) : null;

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newElectionName, setNewElectionName] = useState("");
  const [newElectionStartDate, setNewElectionStartDate] = useState("");
  const [newElectionEndDate, setNewElectionEndDate] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Fetch elections with error handling
  const fetchElections = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/elections`);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch elections: ${res.status} ${res.statusText}`
        );
      }
      const data = await res.json();
      setElections(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  // Add new election with error handling
  const handleAddElection = async () => {
    setAddLoading(true);
    setAddError("");

    if (!newElectionName || !newElectionStartDate || !newElectionEndDate) {
      setAddError("All fields are required");
      setAddLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/elections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth header if needed
        },
        body: JSON.stringify({
          name: newElectionName,
          startDate: newElectionStartDate,
          endDate: newElectionEndDate,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to add election: ${response.status} ${response.statusText}`
        );
      }

      setNewElectionName("");
      setNewElectionStartDate("");
      setNewElectionEndDate("");
      fetchElections(); // Refresh list
    } catch (err) {
      setAddError(err.message || "Error adding election");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading elections...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="polls-container">
      <h2 className="elections-count">
        Total Available Elections: {elections.length}
      </h2>
      <ul className="elections-list">
        {elections.map((election) => (
          <li key={election._id} className="election-item">
            <strong>{election.name}</strong> — Starts:{" "}
            {new Date(election.startDate).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {userData?.role === "admin" && (
        <div className="add-election-form">
          <h3>Add New Election</h3>
          <input
            type="text"
            placeholder="Election Name"
            value={newElectionName}
            onChange={(e) => setNewElectionName(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={newElectionStartDate}
            onChange={(e) => setNewElectionStartDate(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={newElectionEndDate}
            onChange={(e) => setNewElectionEndDate(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleAddElection}
            disabled={addLoading}
            className="add-button"
          >
            {addLoading ? "Adding..." : "Add Election"}
          </button>
          {addError && <div className="error">{addError}</div>}
        </div>
      )}
    </div>
  );
};

export default Polls;
