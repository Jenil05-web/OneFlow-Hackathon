import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import PrivateRoute from './components/PrivateRoute';

// --- 1. Import your new landing page ---
import LandingPage from './pages/LandingPages'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 2. This route now correctly points to your imported component --- */}
        <Route path="/" element={<LandingPage />} />
        
        {/* --- Your Other Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* --- Your Private Dashboard Route --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;