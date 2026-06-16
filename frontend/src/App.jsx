import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SQLi from "./pages/SQLi";
import XSS from "./pages/XSS";
import BufferOverflow from "./pages/BufferOverflow";
import FormatString from "./pages/FormatString";
import Reverse from "./pages/Reverse";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sqli" element={<SQLi />} />
        <Route path="/xss" element={<XSS />} />
        <Route path="/buffer" element={<BufferOverflow />} />
        <Route path="/format" element={<FormatString />} />
        <Route path="/reverse" element={<Reverse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
