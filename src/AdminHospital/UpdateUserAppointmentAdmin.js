import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { useParams } from 'react-router-dom';

const UpdateUserAppointmentAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const [currentStatus, setNewStatus] = useState(); // State to hold the new status

  const handleBackButtonClick = () => {
    window.location.href = `/admin/usersAppointment`;
  };

  const ChangeEditStatus = () => {
    setIsEditing(!isEditing);
    setNewStatus(appointment[8]);
  };

  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;
    console.log(selectedValue);
    setNewStatus(selectedValue === '' ? appointment[8].toString() : selectedValue);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStatuses = {
        AppointmentID: id,
        newStatus: currentStatus
      };

      // Make a POST request to update the statuses on the server
      const response = await fetch('http://localhost:5000/update-appointment-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
        },
        body: JSON.stringify(newStatuses),
      });

      if (response.ok) {
        alert('Statuses updated successfully');
        window.location.href = `/admin/usersAppointment`;
      } else {
        console.error('Failed to update statuses:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating statuses:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/admin-get-users-appointment/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setAppointment(data.user_info);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div>
      <NavbarAdmin />
      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex ">
        <div className="container max-w-screen-lg mx-auto">
          <div className="relative">
            <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
              Edit User's Appointment
            </h2>
          </div>
          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleBackButtonClick}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                </button>
            </div>
              <div className="lg:col-span-2">
                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                  <tbody>
                    <tr className="border-b">
                      <th className="text-left p-3 px-5">Name</th>
                      <th className="text-left p-3 px-5">Date</th>
                      <th className="text-left p-3 px-5">Location</th>
                      <th className="text-left p-3 px-5">Status</th>
                    </tr>
                    <tr key={appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                      <td className="p-3 px-5 bg-gray-50">{appointment[1]}</td>
                      <td className="p-3 px-5 bg-gray-50">{appointment[2]}</td>
                      <td className="p-3 px-5 bg-gray-50">
                        {appointment[3]} {appointment[5]} {appointment[6]}
                        {appointment[4] !== "" && <br />}
                        {appointment[4]}
                      </td>
                      {isEditing === false ? (
                        <td className="p-3 px-5 bg-gray-50">{appointment[8]}</td>
                        ) : (
                            <td className="p-3 px-5 bg-gray-50">
                            <select className="bg-white border border-gray-300 p-1 rounded" value={currentStatus} onChange={handleStatusChange}>
                            {appointment[8].toString() === 'Waiting' ? (
                                <>
                                <option value="Waiting" >Waiting</option>
                                <option value="Received">Received</option>
                                </>
                            ) : (
                                <>
                                <option value="Received" >Received</option>
                                <option value="Waiting">Waiting</option>
                                </>
                            )}
                            </select>
                            </td>
                      )}
                      <td className="p-3 px-5 bg-gray-50">
                        {isEditing === false ? (
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={ChangeEditStatus}
                            >
                                Edit Status
                            </button>
                            ) : (
                            <div className="flex space-x-4">
                                <button
                                    className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={ChangeEditStatus}
                                >
                                    Cancel
                                </button>
                                <button
                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleFormSubmit}
                                >
                                    Save Status
                                </button>
                            </div>
                          )}
                      </td>
                    </tr>
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

export default UpdateUserAppointmentAdmin;
