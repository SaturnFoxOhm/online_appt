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
import SignUp from './component/SignUp';
import Login from './component/Login';

// Authorized User //
import Homelog from './Auth/Home';
import Aboutlog from './Auth/About';
import Servicelog from './Auth/Service';
import ContactUslog from './Auth/ContactUs';
import Profile from './Auth/Profile';
import Appointmentlist from './Auth/Appointmentlist';
import AppointmentDetails from './Auth/AppointmentDetails';
import Appoint from './Auth/Appoint';
import Place from './Auth/SelectPlace';
import Hospital from './Auth/SelectHospital';
import Address from './Auth/InsertAddress';
import DateTime from './Auth/SelectDateTime';
import TestSelection from './Auth/TestSelection';
import LabTest from './Auth/LabTest';
import NHSO from './Auth/NHSO';
import Disease from './Auth/Disease';
import Package from './Auth/Package';
import DiseaseDetails from './Auth/DiseaseDetails';
import PackageDetails from './Auth/PackageDetails';
import Cart from './Auth/Cart';
import Confirmation from './Auth/Confirmation';
import Payment from './Auth/Payment';
import SuccessAppointment from './Auth/SuccessAppointment';

// Admin Hospital //
import LoginAdmin from './AdminHospital/LoginAdmin';
import HomeAdmin from './AdminHospital/HomeAdmin';
import SpecimenUserAppointmentAdmin from './AdminHospital/SpecimenUserAppointmentAdmin';
import SpecimenUpdateUserAppointmentAdmin from './AdminHospital/SpecimenUpdateUserAppointmentAdmin';
import SendTestReportAdmin from './AdminHospital/SendTestReportAdmin';
import SendEmailTestReportAdmin from './AdminHospital/SendEmailTestReportAdmin';
import SelectTimeSlotTypeAdmin from './AdminHospital/SelectTimeslotAdmin';
import TimeslotHospitalAdmin from './AdminHospital/TimeslotHospitalAdmin';
import UpdateTimeslotHospitalAdmin from './AdminHospital/UpdateTimeslotHospitalAdmin';
import TimeslotOffsiteAdmin from './AdminHospital/TimeslotOffsiteAdmin';
import UpdateTimeslotOffsiteAdmin from './AdminHospital/UpdateTimeslotOffsiteAdmin';

// Super Admin //
import LoginSuperAdmin from './SuperAdmin/LoginSuperAdmin';
import SignupAdmin from './SuperAdmin/SignupAdmin';
import DeleteAdmin from './SuperAdmin/DeleteAdmin';
import HomeSuperAdmin from './SuperAdmin/HomeSuperAdmin';
import SpecimenUserAppointmentSuperAdmin from './SuperAdmin/SpecimenUserAppointmentSuperAdmin';
import SpecimenUpdateUserAppointmentSuperAdmin from './SuperAdmin/SpecimenUpdateUserAppointmentSuperAdmin';
import SendTestReportSuperAdmin from './SuperAdmin/SendTestReportSuperAdmin';
import SendEmailTestReportSuperAdmin from './SuperAdmin/SendEmailTestReportSuperAdmin';
import SelectTimeSlotTypeSuperAdmin from './SuperAdmin/SelectTimeslotSuperAdmin';
import TimeslotHospitalSuperAdmin from './SuperAdmin/TimeslotHospitalSuperAdmin';
import UpdateTimeslotHospitalSuperAdmin from './SuperAdmin/UpdateTimeslotHospitalSuperAdmin';
import TimeslotOffsiteSuperAdmin from './SuperAdmin/TimeslotOffsiteSuperAdmin';
import UpdateTimeslotOffsiteSuperAdmin from './SuperAdmin/UpdateTimeslotOffsiteSuperAdmin';
import TransportedAppointmentSuperAdmin from './SuperAdmin/TransportedAppointmentSuperAdmin';
import TransportedAppointmentDetailSuperAdmin from './SuperAdmin/TransportedAppointmentDetailSuperAdmin';
import PackageDetail from './Auth/PackageDetails';

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

      {/* <Route path="/user" element={<Homelog />} />
      <Route path="/user/profile"element={<Profile />} />
      <Route path="/user/appointmentlist" element={<Appointmentlist />} />
      <Route path="/user/appointment-details/:id" element={<AppointmentDetails />} />
      <Route path="/user/appoint" element={<Appoint />} />
      <Route path="/user/place" element={<Place />} />
      <Route path="/user/hospital" element={<Hospital />} />
      <Route path="/user/address" element={<Address />} />
      <Route path="/user/datetime" element={<DateTime />} />
      <Route path="/user/testSelection" element={<TestSelection />} />
      <Route path="/user/LabTest" element={<LabTest />} />
      <Route path="/user/NHSO" element={<NHSO />} />
      <Route path="/user/Disease" element={<Disease />} />
      <Route path="/user/Disease/:id" element={<DiseaseDetails />} />
      <Route path="/user/Package" element={<Package />} />
      <Route path="/user/Package/:id" element={<PackageDetails />} />
      <Route path="/user/Cart" element={<Cart />} />
      <Route path="/user/confirmation" element={<Confirmation />} />
      <Route path="/user/payment" element={<Payment />} />
      <Route path="/user/appointment-success" element={<SuccessAppointment />} /> */}

      {/* <Route path="/user/profile" element={<Profile />} />
      <Route path="/user/appoint" element={<Appoint />} />
      <Route path="/user/place" element={<Place />} />
      <Route path="/user/hospital" element={<Hospital />} />
      <Route path="/user/address" element={<Address />} />
      <Route path="/user/datetime" element={<DateTime />} />
      <Route path="/user/testSelection" element={<TestSelection />} 
      /> */}
      {/* <Route path="/user/LabTest" element={<LabTest />} />
      <Route path="/user/NHSO" element={<NHSO />} /> */}

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
        path="/user/appointment-details/:id"
        element={<ProtectedRoute element={<AppointmentDetails />} />}
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
      <Route
        path="/user/LabTest"
        element={<ProtectedRoute element={<LabTest />} />}
      />
      <Route
        path="/user/NHSO"
        element={<ProtectedRoute element={<NHSO />} />}
      />
      <Route
        path="/user/Disease"
        element={<ProtectedRoute element={<Disease />} />}
      />
      <Route
        path="/user/Disease/:id"
        element={<ProtectedRoute element={<DiseaseDetails />} />}
      />
      <Route
        path="/user/Package"
        element={<ProtectedRoute element={<Package />} />}
      />
      <Route
        path="/user/Package/:id"
        element={<ProtectedRoute element={<PackageDetails />} />}
      />
      <Route
        path="/user/Cart"
        element={<ProtectedRoute element={<Cart />} />}
      />
      <Route
        path="/user/confirmation"
        element={<ProtectedRoute element={<Confirmation />} />}
      />
      <Route
        path="/user/payment"
        element={<ProtectedRoute element={<Payment />} />}
      />
      <Route
        path="/user/appointment-success"
        element={<ProtectedRoute element={<SuccessAppointment />} />}
      />


      {/* Admin Section */}
      <Route path="/adminlogin" element={<LoginAdmin />} />
      <Route
        path="/admin"
        element={<ProtectedRouteAdmin element={<HomeAdmin />} />}
      />
      <Route
        path="/admin/SpecimenUsersAppointment"
        element={<ProtectedRouteAdmin element={<SpecimenUserAppointmentAdmin />} />}
      />
      <Route
        path="/admin/SpecimenUsersAppointment/:id"
        element={<ProtectedRouteAdmin element={<SpecimenUpdateUserAppointmentAdmin />} />}
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
        path="/admin/selectTimeslot"
        element={<ProtectedRouteAdmin element={<SelectTimeSlotTypeAdmin />} />}
      />
      <Route
        path="/admin/timeslothospital"
        element={<ProtectedRouteAdmin element={<TimeslotHospitalAdmin />} />}
      />
      <Route
        path="/admin/timeslothospital/:selectedDate"
        element={<ProtectedRouteAdmin element={<UpdateTimeslotHospitalAdmin />} />}
      />
      <Route
        path="/admin/timeslotoffsite"
        element={<ProtectedRouteAdmin element={<TimeslotOffsiteAdmin />} />}
      />
      <Route
        path="/admin/timeslotoffsite/:selectedDate"
        element={<ProtectedRouteAdmin element={<UpdateTimeslotOffsiteAdmin />} />}
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
        path="/super-admin/SpecimenUsersAppointment"
        element={<ProtectedRouteSuperAdmin element={<SpecimenUserAppointmentSuperAdmin />} />}
      />
      <Route
        path="/super-admin/SpecimenUsersAppointment/:id"
        element={<ProtectedRouteSuperAdmin element={<SpecimenUpdateUserAppointmentSuperAdmin />} />}
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
        path="/super-admin/selectTimeslot"
        element={<ProtectedRouteSuperAdmin element={<SelectTimeSlotTypeSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslothospital"
        element={<ProtectedRouteSuperAdmin element={<TimeslotHospitalSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslothospital/:selectedDate"
        element={<ProtectedRouteSuperAdmin element={<UpdateTimeslotHospitalSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslotoffsite"
        element={<ProtectedRouteSuperAdmin element={<TimeslotOffsiteSuperAdmin />} />}
      />
      <Route
        path="/super-admin/timeslotoffsite/:selectedDate"
        element={<ProtectedRouteSuperAdmin element={<UpdateTimeslotOffsiteSuperAdmin />} />}
      />
      <Route
        path="/super-admin/TransportedUsersAppointment"
        element={<ProtectedRouteSuperAdmin element={<TransportedAppointmentSuperAdmin />} />}
      />
      <Route
        path="/super-admin/TransportedUsersAppointment/:id"
        element={<ProtectedRouteSuperAdmin element={<TransportedAppointmentDetailSuperAdmin />} />}
      />

    </Routes>
  );
}

export default App;
