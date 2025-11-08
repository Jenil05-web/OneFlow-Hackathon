import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userData) {
    const user = JSON.parse(userData);
    if (user.role !== 'Admin') {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default AdminRoute;

