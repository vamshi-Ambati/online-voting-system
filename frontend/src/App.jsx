import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Candidates from "./pages/Candidates";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
// import Error from "./pages/ErrorPage";
// import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import Logout from "./pages/Logout";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <>
    
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/candidates" element={<Candidates />} />
          {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;
