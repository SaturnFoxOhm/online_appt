import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, path }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true); // Start loading

      try {
        const response = await fetch('http://localhost:5000/user-auth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Corrected template string
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error while checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Stop loading regardless of the result
      }
    };

    checkAuthentication();
  }, [path]);

  if (isLoading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
