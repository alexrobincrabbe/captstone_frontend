import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import GamePage from "./GamePage";
import MemoryBrowser from "./MemoryBrowser";
import "./styles.css";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/memories" element={<MemoryBrowser />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  </React.StrictMode>
);
