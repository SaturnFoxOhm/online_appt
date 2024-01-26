import React, { useState } from 'react';
import Navbar from './navbar';
import Editappointmentlist from './Editappointmentlist';

const Appointmentlist = () => {
  const [id_number, setIDNumber] = useState("1234567891544");
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  const handleButtonClick = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

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
                {isDetailsVisible ? (
                  <table class="w-full text-md bg-white shadow-md rounded mb-4">
                    <tbody>
                        <tr class="border-b">
                            <th class="text-left p-3 px-5">Name</th>
                            <th class="text-left p-3 px-5">Date</th>
                            <th class="text-left p-3 px-5">Time</th>
                        </tr>
                        <tr class="border-b hover:bg-orange-100 bg-gray-100">
                            <td class="p-3 px-5 bg-gray-50">Supakitt Surojanakul</td>
                            <td class="p-3 px-5 bg-gray-50">14/08/2024</td>
                            <td class="p-3 px-5 bg-gray-50">
                              10:00 AM
                            </td>
                            <td class="p-3 px-5 bg-gray-50">
                              <button
                                className="flex items-center justify-end"
                                onClick={handleButtonClick}
                              >
                                <svg className="w-6 h-6 text-gray-800 dark:text-white flex flex item-center justify-end hover:text-opacity-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
                                </svg>
                              </button>
                            </td>
                        </tr>
                  </tbody>
                </table>
                ) : (
                  <Editappointmentlist />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointmentlist;