import React from 'react';
import NavbarSuperAdmin from './NavbarSuperAdmin';
import { Link } from 'react-router-dom';

const HomeSuperAdmin = () => {
  return (
    <div>
      <NavbarSuperAdmin />
      <section className="bg-white">
        <div className="flex items-center justify-center mt-32">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center mb-8">
              <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900">Super Admin Page</h2>
              <p className="font-light text-gray-500 sm:text-xl ">You are now the Super Admin. Click here to Add or Delete Admin Account, View all Users' Appointments, Send Test Results, Edit your Time Slot.</p>
            </div>
            <div className="flex flex-col items-center space-y-8 mb-8"> {/* Center vertically */}
              <div className="flex flex-col items-center justify-center"> {/* Center horizontally and switch to row layout on large screens */}
                <div className="flex flex-wrap justify-center">
                  <Link to="/super-admin/signup-admin">
                    <button className="mb-4 mr-4 lg:mb-0 px-4 lg:px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800">Add New Admin Account</button>
                  </Link>
                  <Link to="/super-admin/delete-admin">
                    <button className="mb-4 mr-4 lg:mb-0 px-4 lg:px-8 py-3 bg-rose-700 text-white rounded-full hover:bg-rose-800 focus:outline-none focus:shadow-outline-rose active:bg-rose-900">Delete Admin Account</button>
                  </Link>
                  <Link to="/super-admin/usersAppointment">
                    <button className="mb-4 mr-4 lg:mb-4 px-4 lg:px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800">Users' Appointment</button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center">
                  <button className="mb-4 lg:mb-0 mr-4 px-4 lg:px-8 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:shadow-outline-purple active:bg-purple-800">Send Test Report</button>
                  <Link to="/super-admin/timeslot">
                    <button className="mb-4 lg:mb-0 mr-4 px-4 lg:px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:shadow-outline-yellow active:bg-yellow-800">Time Slot</button>
                  </Link>
                  <button className="mb-4 lg:mb-0 mr-4 px-4 lg:px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:shadow-outline-red active:bg-red-800">Specimen Transportation</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSuperAdmin;
