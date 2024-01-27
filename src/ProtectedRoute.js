import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, path }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-auth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.status === 200) {
          // User is authenticated
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // User is not authenticated, or token is invalid
          setIsAuthenticated(false);
        } else {
          // Handle other status codes if needed
          console.error('Unexpected response status:', response.status);
        }
      } catch (error) {
        console.error('Error while checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [path]); // Run the effect when the path changes

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
