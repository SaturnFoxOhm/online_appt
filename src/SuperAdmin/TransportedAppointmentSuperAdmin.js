import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarSuperAdmin';
import { Link } from 'react-router-dom';

const TransportedAppointmentSuperAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = 'http://localhost:5000/super-admin-get-users-appointment-transported';

        if (selectedDate) {
          apiUrl = `http://localhost:5000/super-admin-get-users-appointment-transported-date/${selectedDate}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const data = await response.json();
        setAppointments(data.test);
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
          </div>
          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
              <div className="text-gray-600">
                <p className="font-medium text-lg text-black">Transported Users' Appointment / การนัดหมายผู้ใช้ที่ถูกโอนย้าย</p>
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
                      <th className="text-left p-3 px-5">Name / ชื่อ นามสกุล</th>
                      <th className="text-left p-3 px-5">Hospital / โรงพยาบาล</th>
                      <th className="text-left p-3 px-5">Date / วันที่</th>
                      <th className="text-left p-3 px-5">Result Status / สถานะผลการตรวจ</th>
                    </tr>
                    {appointments.map((appointment) => (
                      <tr key={appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                        <td className="p-3 px-5 bg-gray-50">{appointment.user_name}</td>
                        <td className="p-3 px-5 bg-gray-50">{appointment.hos_name}</td>
                        {appointment.HospitalDate !== null ? (
                            <td className="p-3 px-5 bg-gray-50 lg:w-[200px]">{appointment.HospitalDate}</td>
                        ) : (
                            <td className="p-3 px-5 bg-gray-50 lg:w-[200px]">{appointment.OffSiteDate}</td>
                        )}
                        {/* <td className="p-3 px-5 bg-gray-50">
                          <div>{appointment.Appointment_Status}</div>
                        </td> */}
                        <td className="p-3 px-5 bg-gray-50 lg:w-[150px]">{appointment.LabStatus}</td>
                        <td className="p-3 px-5 bg-gray-50">
                        <Link
                          to={`/super-admin/TransportedUsersAppointment/${appointment.AppointmentID}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          See_Transported_Test_Detail
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

export default TransportedAppointmentSuperAdmin;
