import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import PrivateRoute from './components/PrivateRoute';
import { Helmet } from 'react-helmet';

// --- IMPORT YOUR NEW LANDING PAGE ---
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      {/* <Navbar /> You might want to remove this if it's the internal app navbar */}
      <Routes>
        {/* --- THIS IS THE ROUTE THAT SHOWS YOUR LANDING PAGE FIRST --- */}
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

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>OneFlow - Project Management System</title>
        <meta name="description" content="Plan, Execute, and Bill. All in OneFlow. The modular Project Management system that connects your tasks to your revenue." />
      </Helmet>
      {/* ...rest of your existing code... */}
    </>
  );
};
