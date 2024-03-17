import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { Link } from 'react-router-dom';

const SpecimenUserAppointmentAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = 'http://localhost:5000/admin-get-users-appointment';

        if (selectedDate) {
          apiUrl = `http://localhost:5000/admin-get-users-appointment-date/${selectedDate}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
          },
        });
        const data = await response.json();
        setAppointments(data.user_info);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    const chosenDate = event.target.value;
    setSelectedDate(chosenDate);
  };

  return (
    <div>
      <NavbarAdmin />
      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex ">
        <div className="container max-w-screen-xl mx-auto">
          <div className="relative">
            <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
              Users' Appointment
            </h2>
          </div>
          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
              <div className="text-gray-600">
                <p className="font-medium text-lg text-black">Users' Appointment</p>
                <input
                  type="date"
                  className="border p-2"
                  onChange={handleDateChange}
                />
              </div>
              <div className="lg:col-span-2">
                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                  <tbody>
                    <tr className="border-b">
                      <th className="text-left p-3 px-5">Name</th>
                      <th className="text-left p-3 px-5">Phone Number</th>
                      <th className="text-left p-3 px-5">Date</th>
                      <th className="text-left p-3 px-5">Location</th>
                      <th className="text-left p-3 px-5">Status</th>
                    </tr>
                    {appointments.map((appointment) => (
                      <tr key={appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                        <td className="p-3 px-5 bg-gray-50 lg:w-[290px]">{appointment.user_name}</td>
                        <td className="p-3 px-5 bg-gray-50">{appointment.phone}</td>
                        <td className="p-3 px-5 bg-gray-50 ">{appointment.Date}</td>
                        <td className="p-3 px-5 bg-gray-50 lg:w-[420px]">
                          {appointment.Address[0] && (
                            <>
                              {appointment.Address[0]} {appointment.Address[2]} 
                              {appointment.Address[1] !== ""} {" "}
                              {appointment.Address[1] !== "" && appointment.Address[1]}
                              {" "} {appointment.Address[3]} {appointment.Address[4]}
                            </>
                          )}
                        </td>
                        <td className="p-3 px-5 bg-gray-50">
                          <div>{appointment.Appointment_Status}</div>
                        </td>
                        <td className="p-3 px-5 bg-gray-50">
                        <Link
                          to={`/admin/SpecimenUsersAppointment/${appointment.AppointmentID}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          See_Detail
                        </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="md:col-span-4 text-right">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecimenUserAppointmentAdmin;
