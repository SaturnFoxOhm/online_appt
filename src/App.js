import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the ProtectedRoute component for User
import ProtectedRoute from './ProtectedRoute';
// Import the ProtectedRoute component for Admin
import ProtectedRouteAdmin from './ProtectedRouteAdmin';
// Import the ProtectedRoute component for Super Admin
import ProtectedRouteSuperAdmin from './ProtectedRouteSuperAdmin';

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
import Appoint from './Auth/Appoint';
import Place from './Auth/SelectPlace';
import Hospital from './Auth/SelectHospital';
import Address from './Auth/InsertAddress';
import DateTime from './Auth/SelectDateTime';
import TestSelection from './Auth/TestSelection';

// Admin Hospital //
import LoginAdmin from './AdminHospital/LoginAdmin';
import HomeAdmin from './AdminHospital/HomeAdmin';
import UserAppointmentAdmin from './AdminHospital/UserAppointmentAdmin';
import UpdateUserAppointmentAdmin from './AdminHospital/UpdateUserAppointmentAdmin';
import SendTestReportAdmin from './AdminHospital/SendTestReportAdmin';
import SendEmailTestReportAdmin from './AdminHospital/SendEmailTestReportAdmin';
import TimeslotAdmin from './AdminHospital/TimeslotAdmin';
import UpdateTimeslotAdmin from './AdminHospital/UpdateTimeslotAdmin';

// Super Admin //
import LoginSuperAdmin from './SuperAdmin/LoginSuperAdmin';
import SignupAdmin from './SuperAdmin/SignupAdmin';
import DeleteAdmin from './SuperAdmin/DeleteAdmin';
import HomeSuperAdmin from './SuperAdmin/HomeSuperAdmin';
import UserAppointmentSuperAdmin from './SuperAdmin/UserAppointmentSuperAdmin';
import UpdateUserAppointmentSuperAdmin from './SuperAdmin/UpdateUserAppointmentSuperAdmin';
import SendTestReportSuperAdmin from './SuperAdmin/SendTestReportSuperAdmin';
import SendEmailTestReportSuperAdmin from './SuperAdmin/SendEmailTestReportSuperAdmin';
import TimeslotSuperAdmin from './SuperAdmin/TimeslotSuperAdmin';
import UpdateTimeslotSuperAdmin from './SuperAdmin/UpdateTimeslotSuperAdmin';

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

      {/* <Route path="/user/profile" element={<Profile />} />
      <Route path="/user/appoint" element={<Appoint />} />
      <Route path="/user/place" element={<Place />} />
      <Route path="/user/hospital" element={<Hospital />} />
      <Route path="/user/address" element={<Address />} />
      <Route path="/user/datetime" element={<DateTime />} />
      <Route path="/user/testSelection" element={<TestSelection />} /> */}

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
      <Route
        path="/user/appoint"
        element={<ProtectedRoute element={<Appoint />} />}
      />
      <Route
        path="/user/place"
        element={<ProtectedRoute element={<Place />} />}
      />
      <Route
        path="/user/hospital"
        element={<ProtectedRoute element={<Hospital />} />}
      />
      <Route
        path="/user/address"
        element={<ProtectedRoute element={<Address />} />}
      />
      <Route
        path="/user/datetime"
        element={<ProtectedRoute element={<DateTime />} />}
      />
      <Route
        path="/user/testSelection"
        element={<ProtectedRoute element={<TestSelection />} />}
      />

      {/* Admin Section */}
      <Route path="/adminlogin" element={<LoginAdmin />} />
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
      <Route
        path="/admin/sendTestReport"
        element={<ProtectedRouteAdmin element={<SendTestReportAdmin />} />}
      />
      <Route
        path="/admin/sendTestReport/:id"
        element={<ProtectedRouteAdmin element={<SendEmailTestReportAdmin />} />}
      />
      <Route
        path="/admin/timeslot"
        element={<ProtectedRouteAdmin element={<TimeslotAdmin />} />}
      />
      <Route
        path="/admin/timeslot/:selectedDate"
        element={<ProtectedRouteAdmin element={<UpdateTimeslotAdmin />} />}
      />

      {/* Super Admin Section */}
      <Route path="/super-adminlogin" element={<LoginSuperAdmin />} />
      <Route
        path="/super-admin"
        element={<ProtectedRouteSuperAdmin element={<HomeSuperAdmin />} />}
      />
      <Route
        path="/super-admin/signup-admin"
        element={<ProtectedRouteSuperAdmin element={<SignupAdmin />} />}
      />
      <Route
        path="/super-admin/delete-admin"
        element={<ProtectedRouteSuperAdmin element={<DeleteAdmin />} />}
      />
      <Route
        path="/super-admin/usersAppointment"
        element={<ProtectedRouteSuperAdmin element={<UserAppointmentSuperAdmin />} />}
      />
      <Route
        path="/super-admin/usersAppointment/:id"
        element={<ProtectedRouteSuperAdmin element={<UpdateUserAppointmentSuperAdmin />} />}
      />
      <Route
        path="/super-admin/sendTestReport"
        element={<ProtectedRouteSuperAdmin element={<SendTestReportSuperAdmin />} />}
      />
      <Route
        path="/super-admin/sendTestReport/:id"
        element={<ProtectedRouteSuperAdmin element={<SendEmailTestReportSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslot"
        element={<ProtectedRouteSuperAdmin element={<TimeslotSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslot/:selectedDate"
        element={<ProtectedRouteSuperAdmin element={<UpdateTimeslotSuperAdmin />} />}
      />

    </Routes>
  );
}

export default App;
