import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import VisaPredictor from "./pages/VisaPredictor";

// Check if user is logged in
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Protected route - redirect to login if not logged in
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Auth page - login + register */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visa"
          element={
            <ProtectedRoute>
              <VisaPredictor />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;