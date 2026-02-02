import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "@/react-app/pages/Login";
import AuthCallback from "@/react-app/pages/AuthCallback";
import Dashboard from "@/react-app/pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}
