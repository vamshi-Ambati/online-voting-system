// import React, { useEffect, useState } from "react";
// import "../styles/dashboard.css";

// const Dashboard = () => {
//   const [elections, setElections] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newElection, setNewElection] = useState({
//     name: "",
//     description: "",
//     imageUrl: "",
//   });

//   const user = JSON.parse(localStorage.getItem("voter")) || { role: "admin" };

//   useEffect(() => {
//     fetch("/api/elections")
//       .then((res) => res.json())
//       .then((data) => setElections(data.elections || []))
//       .catch(() => setElections([]));
//   }, []);

//   const handleAddElectionBtn = () => setShowAddForm(true);

//   const handleInputChange = (e) => {
//     setNewElection({
//       ...newElection,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleAddElection = async (e) => {
//     e.preventDefault();
//     // Add validation as needed
//     try {
//       const response = await fetch("/api/elections", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newElection),
//       });
//       if (response.ok) {
//         // Refresh elections list
//         const updated = await response.json();
//         setElections(updated.elections || []);
//         setShowAddForm(false);
//         setNewElection({ name: "", description: "", imageUrl: "" });
//       } else {
//         alert("Failed to add election.");
//       }
//     } catch {
//       alert("Error adding election.");
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <h1>Dashboard</h1>
//       {user.role === "admin" && (
//         <button className="add-btn" onClick={handleAddElectionBtn}>
//           Add Election
//         </button>
//       )}

//       {showAddForm && (
//         <form className="add-election-form" onSubmit={handleAddElection}>
//           <h3>Add New Election</h3>
//           <input
//             type="text"
//             name="name"
//             placeholder="Election Name"
//             value={newElection.name}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="text"
//             name="imageUrl"
//             placeholder="Image URL (optional)"
//             value={newElection.imageUrl}
//             onChange={handleInputChange}
//           />
//           <textarea
//             name="description"
//             placeholder="Description"
//             value={newElection.description}
//             onChange={handleInputChange}
//             required
//           />
//           <button type="submit" className="add-btn">
//             Add
//           </button>
//         </form>
//       )}

//       <div className="election-list">
//         {elections.length === 0 && <p>No elections available.</p>}
//         {elections.map((election) => (
//           <div className="election-card" key={election._id}>
//             <div className="election-image">
//               <img
//                 // src={election.imageUrl || "/images/default-election.png"}
//                 alt={election.name}
//               />
//             </div>
//             <div className="election-info">
//               <h2>{election.name}</h2>
//               <p className="election-desc">{election.description}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react'

const Dashboard = () => {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard