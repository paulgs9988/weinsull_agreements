// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const Home = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (role === "1") {
      navigate("/new-agreement");
    } else if (role === "2") {
      navigate("/financier-interaction");
    } else if (role === "3") {
      navigate("/client-interaction");
    }
  };

  return (
    <div>
      <h1>Welcome to Weinsull Agreements</h1>
      <p>Please select your role from the dropdown menu:</p>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select role</option>
        <option value="1">
          I am a financier looking to launch an agreement
        </option>
        <option value="2">
          I am a financier looking to check the status of/interact with an
          existing agreement
        </option>
        <option value="3">
          I am a client looking to check the status of/make a payment to an
          existing agreement
        </option>
      </select>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default Home;
