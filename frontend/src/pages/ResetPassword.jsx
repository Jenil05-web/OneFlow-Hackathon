import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetEmail) {
      navigate('/forgot-password');
    } else {
      setEmail(resetEmail);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email,
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      setSuccess(response.data.message);
      localStorage.removeItem('resetEmail');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Password reset failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setSuccess(response.data.message || 'OTP resent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .reset-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .background-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          pointer-events: none;
          animation: pulse 6s ease-in-out infinite;
        }

        .blob-1 {
          top: -10rem;
          right: -10rem;
          width: 24rem;
          height: 24rem;
          background: #67e8f9;
          animation-delay: 0s;
        }

        .blob-2 {
          bottom: -10rem;
          left: -10rem;
          width: 24rem;
          height: 24rem;
          background: #5eead4;
          animation-delay: 2s;
        }

        .blob-3 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24rem;
          height: 24rem;
          background: #22d3ee;
          animation-delay: 4s;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
        }

        .form-wrapper {
          max-width: 28rem;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0.375rem;
          background: linear-gradient(90deg, #06b6d4 0%, #5eead4 50%, #06b6d4 100%);
        }

        .header-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-circle {
          display: inline-block;
          width: 6rem;
          height: 6rem;
          background: linear-gradient(135deg, #06b6d4, #14b8a6);
          border-radius: 50%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .form-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .form-subtitle {
          color: #4b5563;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .email-display {
          font-weight: 600;
          color: #0891b2;
          font-size: 1.125rem;
        }

        .alert {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .alert-error {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          color: #991b1b;
        }

        .alert-success {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          color: #166534;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          font-size: 1rem;
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:hover {
          border-color: #67e8f9;
        }

        .form-input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        .otp-input {
          text-align: center;
          font-size: 2.25rem;
          letter-spacing: 0.6em;
          font-weight: 700;
          padding: 1.25rem 1.5rem;
        }

        .password-input {
          padding-right: 3.5rem;
        }

        .toggle-password-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0891b2;
          background: #ecfeff;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-password-btn:hover {
          background: #cffafe;
          color: #0e7490;
        }

        .submit-btn {
          width: 100%;
          margin-top: 2rem;
          background: linear-gradient(90deg, #06b6d4, #14b8a6);
          color: white;
          padding: 1.25rem;
          border-radius: 1rem;
          font-weight: 700;
          font-size: 1.125rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #0891b2, #0f766e);
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .resend-section {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 2px solid #f3f4f6;
          text-align: center;
        }

        .resend-text {
          color: #4b5563;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .resend-btn {
          display: inline-block;
          padding: 0.75rem 2rem;
          color: #0891b2;
          font-weight: 700;
          font-size: 1rem;
          background: #ecfeff;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resend-btn:hover:not(:disabled) {
          background: #cffafe;
          color: #0e7490;
        }

        .resend-btn:disabled {
          color: #67e8f9;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 640px) {
          .form-card {
            padding: 2rem;
          }

          .form-title {
            font-size: 1.875rem;
          }

          .logo-circle {
            width: 5rem;
            height: 5rem;
          }

          .otp-input {
            font-size: 1.875rem;
          }
        }
      `}</style>

      <div className="reset-container">
        <div className="background-blob blob-1"></div>
        <div className="background-blob blob-2"></div>
        <div className="background-blob blob-3"></div>

        <div className="form-wrapper">
          <div className="form-card">
            <div className="accent-bar"></div>
            
            <div className="header-section">
              <div className="logo-circle"></div>
              
              <h1 className="form-title">Reset Password</h1>
              <p className="form-subtitle">
                Enter the verification code sent to
              </p>
              <p className="email-display">{email}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  required
                  maxLength="6"
                  className="form-input otp-input"
                  placeholder="______"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  New Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="form-input password-input"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password-btn"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm New Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input password-input"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="toggle-password-btn"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <span className="btn-content">
                    <div className="spinner"></div>
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="resend-section">
              <p className="resend-text">Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="resend-btn"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>

          <div className="footer-text">
            Secured with encryption
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;