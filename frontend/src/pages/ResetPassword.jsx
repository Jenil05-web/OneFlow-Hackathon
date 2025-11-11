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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .reset-container {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
        }

        .reset-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          z-index: 0;
        }

        .form-wrapper {
          max-width: 480px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .form-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 3rem;
          border: 1px solid #e2e8f0;
        }

        .header-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3);
        }

        .icon-wrapper svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .form-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .form-subtitle {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 0.25rem;
        }

        .email-display {
          font-weight: 600;
          color: #06b6d4;
          font-size: 0.9375rem;
          margin-top: 0.25rem;
        }

        .alert {
          margin-bottom: 1.5rem;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9375rem;
          background: white;
          transition: all 0.2s ease;
          outline: none;
          color: #0f172a;
        }

        .form-input:hover {
          border-color: #cbd5e1;
        }

        .form-input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .otp-input {
          text-align: center;
          font-size: 1.5rem;
          letter-spacing: 0.5em;
          font-weight: 600;
          padding: 1rem;
        }

        .password-input {
          padding-right: 4rem;
        }

        .toggle-password-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #06b6d4;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-password-btn:hover {
          background: #ecfeff;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1.5rem;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          padding: 0.875rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .resend-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .resend-text {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .resend-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          color: #06b6d4;
          font-weight: 600;
          font-size: 0.875rem;
          background: white;
          border: 1.5px solid #06b6d4;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resend-btn:hover:not(:disabled) {
          background: #ecfeff;
          border-color: #0891b2;
          color: #0891b2;
        }

        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 1.5rem;
          color: #64748b;
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .footer-text svg {
          width: 14px;
          height: 14px;
          color: #06b6d4;
        }

        @media (max-width: 640px) {
          .form-card {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.5rem;
          }

          .icon-wrapper {
            width: 56px;
            height: 56px;
          }

          .icon-wrapper svg {
            width: 28px;
            height: 28px;
          }

          .otp-input {
            font-size: 1.25rem;
            letter-spacing: 0.4em;
          }
        }
      `}</style>

      <div className="reset-container">
        <div className="form-wrapper">
          <div className="form-card">
            <div className="header-section">
              <div className="icon-wrapper">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h1 className="form-title">Reset Password</h1>
              <p className="form-subtitle">
                Enter the 6-digit verification code sent to
              </p>
              <p className="email-display">{email}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
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
                  placeholder="• • • • • •"
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
                    {showPassword ? 'HIDE' : 'SHOW'}
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
                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
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
                {resendLoading ? (
                  <>
                    <div className="spinner" style={{borderColor: '#06b6d4', borderTopColor: 'transparent'}}></div>
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>
          </div>

          <div className="footer-text">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secured with end-to-end encryption
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;