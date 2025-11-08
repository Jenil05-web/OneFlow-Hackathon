import { Navigate } from 'react-router-dom';

// PublicRoute: Conditionally redirects authenticated users
// - Landing page: Redirect to dashboard if logged in
// - Auth pages (login/signup): Allow access even if logged in (for account switching)
const PublicRoute = ({ children, redirectIfAuth = false }) => {
  const token = localStorage.getItem('token');
  
  // Only redirect if redirectIfAuth is true (for landing page)
  // Auth pages (login/signup) should be accessible even when logged in
  if (token && redirectIfAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;

