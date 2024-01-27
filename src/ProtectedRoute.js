import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = async ({ element }) => {
  // You can implement your authentication logic here
  const isAuthenticated = false;
  const response = await fetch('http://localhost:5000/user-auth', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(localStorage.getItem('token')),
  });

  if (response.status === 200) {
    // User already exists, handle as needed
    // Access the token from the response
    isAuthenticated = false;
  }
  else if(response.status === 500){
    isAuthenticated = true;
  }

  // If the user is authenticated, render the original element
  // Otherwise, redirect to the login page
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
