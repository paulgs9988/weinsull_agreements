// src/AppRouter.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import NewAgreement from "./components/NewAgreement";
import FinancierInteraction from "./components/FinancierInteraction";
import ClientInteraction from "./components/ClientInteraction";

const AppRouter = () => {
  return (
    <Router>
      <nav>
        <ul>{/* Add your navigation links here */}</ul>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-agreement" element={<NewAgreement />} />
        <Route
          path="/financier-interaction"
          element={<FinancierInteraction />}
        />
        <Route path="/client-interaction" element={<ClientInteraction />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
