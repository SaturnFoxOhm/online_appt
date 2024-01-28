import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import liff from '@line/liff';

const ProtectedRoute = ({ element, path }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const logout = () => {
    liff.logout();
    localStorage.removeItem('token');
    window.location.reload();
  }

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
          liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
            logout();
          }, err => console.error(err));
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
