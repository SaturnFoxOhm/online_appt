import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { Link } from 'react-router-dom';

const HomeAdmin = () => {
  const [Hos_name, setHos_name] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin-get-hospital-name', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
          },
        });
        const data = await response.json();
        setHos_name(data.results[0].hos_name);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <NavbarAdmin />
      <section className="bg-white">
        <div className="flex items-center justify-center mt-28">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center mb-8">
              <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900">Admin Page</h2>
              <h2 className="mb-4 text-2xl lg:text-3xl tracking-tight font-extrabold text-gray-900">{Hos_name}</h2>
              <p className="font-light text-gray-500 sm:text-xl">You are now the Hospital Admin. Click here to view all your Users' Appointments, Send Test Report, Edit your Time Slot, or Send Specimen Transportation.</p>
            </div>
            <div className="flex flex-col items-center space-y-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-center">
                <div className="flex flex-wrap justify-center">
                  <Link to="/admin/usersAppointment">
                    <button className="mb-4 sm:mb-2 sm:mr-4 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800">Users' Appointment</button>
                  </Link>
                  <Link to="/admin/sendTestReport">
                    <button className="mb-4 sm:mb-2 sm:mr-4 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:shadow-outline-purple active:bg-purple-800">Send Test Report</button>
                  </Link>
                  <Link to="/admin/selectTimeslot">
                    <button className="mb-4 sm:mb-2 sm:mr-4 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800">Time Slot</button>
                  </Link>
                  <button className="mb-4 sm:mb-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:shadow-outline-red active:bg-red-800">Specimen Transportation</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeAdmin;
