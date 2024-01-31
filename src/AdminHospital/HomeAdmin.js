import React from 'react';
import NavbarAdmin from './NavbarAdmin';
import { Link } from 'react-router-dom';

const HomeAdmin = () => {
  return (
    <div>
      <NavbarAdmin />
      <section className="bg-white">
        <div className="flex items-center justify-center mt-32">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center mb-8">
              <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900">Admin Page</h2>
              <p className="font-light text-gray-500 sm:text-xl ">You are now the Hospital Admin Click here to view all your Users' Appointment or edit you Time Slot</p>
            </div>
            <div className="flex flex-col items-center space-y-8 mb-8"> {/* Center vertically */}
              <div className="flex flex-col sm:flex-row justify-center"> {/* Center horizontally and switch to row layout on small screens */}
                <Link to="/admin/usersAppointment">
                  <button className="mb-8 sm:mb-0 sm:mr-8 px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800">Users' Appointment</button>
                </Link>
                <button className="mb-8 sm:mb-0 sm:mr-8 px-8 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800">Time Slot</button>
                {/* <button className="mb-8 sm:mb-0 px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 focus:outline-none focus:shadow-outline-orange active:bg-orange-800">Button 3</button> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeAdmin;
