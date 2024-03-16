import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, path }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInfoExists, setIsInfoExists] = useState(false);
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
          setIsInfoExists(true);
        } else if(response.status === 400){
          setIsAuthenticated(true);
          setIsInfoExists(false);
        }else {
          setIsAuthenticated(false);
          setIsInfoExists(false);
        }
      } catch (error) {
        console.error('Error while checking authentication:', error);
        setIsAuthenticated(false);
        setIsInfoExists(false);
      } finally {
        setIsLoading(false); // Stop loading regardless of the result
      }
    };

    checkAuthentication();
  }, [path]);

  if (isLoading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

  if (isAuthenticated && isInfoExists) {
    return element;
  } else if (isAuthenticated && !isInfoExists) {
    // Handle case where authentication is successful but additional information is missing
    return <Navigate to="/signup" />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
