import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Editappointmentlist from './Editappointmentlist';
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";

const Appointmentlist = () => {
  const [appointmentList, setAppointmentList] = useState();

  useEffect(() => {
    // Fetch user data from the server when the component mounts
    const fetchUserAppointmentData = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-appointment', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('data', data.appointmentsWithTimeSlots)
          setAppointmentList(data.appointmentsWithTimeSlots);
        } else {
          console.error("Failed to fetch user appointment data");
        }
      } catch (error) {
        console.error("Error fetching user appointment data:", error);
      }
    };

    // Call the fetchUserData function
    fetchUserAppointmentData();
  }, [])

  return (
    <div>
      <Navbar />
      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex ">
        <div className="container max-w-screen-lg mx-auto">
          <div className="relative">
            <a href='/user/profile' className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-gray-500 py-2 px-4 rounded-l-md rounded-r-md">
              Profile Page
            </a>
            <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
              Appointment Page
            </h2>
          </div>
          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
            {/* Add overflow-x-auto to allow horizontal scrolling if needed */}
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
              <div className="text-gray-600">
                <p className="font-medium text-lg text-black">User's Appointment</p>
              </div>
              <div className="lg:col-span-2">
                  <table class="w-full text-md bg-white shadow-md rounded mb-4">
                    <tbody>
                        <tr class="border-b">
                            <th class="text-left p-3 px-5">Name</th>
                            <th class="text-left p-3 px-5">Hospital</th>
                            <th class="text-left p-3 px-5">Date</th>
                            <th class="text-left p-3 px-5">Time</th>
                            <th class="text-left p-3 px-5">Result Status</th>
                        </tr>
                        {appointmentList && appointmentList.map(appointment => (
                          <tr key={appointment.appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                            <td className="p-3 px-5 bg-gray-50">{appointment.appointment.first_name} {appointment.appointment.last_name}</td>
                            <td className="p-3 px-5 bg-gray-50">{appointment.appointment.hos_name}</td>
                            <td className="p-3 px-5 bg-gray-50">{appointment.appointment.HospitalDate ? appointment.appointment.HospitalDate : appointment.appointment.OffSiteDate}</td>
                            <td className="p-3 px-5 bg-gray-50">{appointment.timeSlot[0].TimeSlot}</td>
                            <td className="p-3 px-5 bg-gray-50">{appointment.appointment.LabStatus}</td>
                            <td className="p-3 px-5 bg-gray-50">
                              <Link to={`/user/appointment-details/${appointment.appointment.AppointmentID}`}>
                                <button className="flex items-center justify-end">
                                  <HiOutlineDocumentMagnifyingGlass size={30}/>
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointmentlist;