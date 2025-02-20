import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpinWheel } from "./components/SpinWheel";
import { AdminDashboard } from "./components/AdminDashboard";
import { WheelTest } from "./components/WheelTest";
import { Navbar } from "./components/Navbar";

const About = () => (
  <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
    <h1>About Pizza Fortune Wheel</h1>
    <p>A fun and interactive way to win exciting pizza prizes!</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<SpinWheel />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/test" element={<WheelTest />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
