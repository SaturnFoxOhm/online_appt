import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the ProtectedRoute component for User
import ProtectedRoute from './ProtectedRoute';
// Import the ProtectedRoute component for Admin
import ProtectedRouteAdmin from './ProtectedRouteAdmin';

// Unauthorized User //
import Home from './component/Home';
import About from './component/About';
import Service from './component/Service';
import ContactUs from './component/ContactUs';
import Test from './component/Test1';
import SignUp from './component/SignUp';
import Login from './component/Login';

// Authorized User //
import Homelog from './Auth/Home';
import Aboutlog from './Auth/About';
import Servicelog from './Auth/Service';
import ContactUslog from './Auth/ContactUs';
import Profile from './Auth/Profile';
import Appointmentlist from './Auth/Appointmentlist';

// Admin Hospital //
import LoginAdmin from './AdminHospital/LoginAdmin';
import SignupAdmin from './AdminHospital/SignupAdmin';
import HomeAdmin from './AdminHospital/HomeAdmin';
import UserAppointmentAdmin from './AdminHospital/UserAppointmentAdmin';
import UpdateUserAppointmentAdmin from './AdminHospital/UpdateUserAppointmentAdmin'

function App() {
  return (
    <Routes>
      {/* Non-authenticated routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<Test />} />

      {/* Authenticated routes, wrapped with ProtectedRoute */}
      <Route
        path="/user"
        element={<ProtectedRoute element={<Homelog />} />}
      />
      <Route
        path="/user/about"
        element={<ProtectedRoute element={<Aboutlog />} />}
      />
      <Route
        path="/user/service"
        element={<ProtectedRoute element={<Servicelog />} />}
      />
      <Route
        path="/user/contactus"
        element={<ProtectedRoute element={<ContactUslog />} />}
      />
      <Route
        path="/user/profile"
        element={<ProtectedRoute element={<Profile />} />}
      />
      <Route
        path="/user/appointmentlist"
        element={<ProtectedRoute element={<Appointmentlist />} />}
      />

      {/* Admin Section */}
      <Route path="/adminlogin" element={<LoginAdmin />} />
      <Route path="/adminsignup" element={<SignupAdmin />} />
      <Route
        path="/admin"
        element={<ProtectedRouteAdmin element={<HomeAdmin />} />}
      />
      <Route
        path="/admin/usersAppointment"
        element={<ProtectedRouteAdmin element={<UserAppointmentAdmin />} />}
      />
      <Route
        path="/admin/usersAppointment/:id"
        element={<ProtectedRouteAdmin element={<UpdateUserAppointmentAdmin />} />}
      />
    </Routes>
  );
}

export default App;
