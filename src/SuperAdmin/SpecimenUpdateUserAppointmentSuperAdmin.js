import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarSuperAdmin';
import { useParams } from 'react-router-dom';

const SpecimenUpdateUserAppointmentSuperAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const [test, setTest] = useState([]);
  const [packageOrders, setPackageOrders] = useState([]);
  const [diseaseOrders, setDiseaseOrders] = useState([]);
  const [labTestOrders, setLabTestOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const [currentStatus, setNewStatus] = useState(); // State to hold the new status

  const handleBackButtonClick = () => {
    window.location.href = `/super-admin/SpecimenUsersAppointment`;
  };

  // const handleRefNumChange = (index, value) => {
  //   setCurrentRefNum(prevState => {
  //     const newRefNum = [...prevState];
  //     newRefNum[index] = value;
  //     return newRefNum;
  //   });
  // };

  const ChangeEditStatus = () => {
    setIsEditing(!isEditing);
    if(appointment.length === 9){
        setNewStatus(appointment[8]);
    }
    if(appointment.length === 5){
      setNewStatus(appointment[4]);
    }
  };

  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;
    console.log(selectedValue);
    if(appointment.length === 9){
      setNewStatus(selectedValue === '' ? appointment[8].toString() : selectedValue);
    }
    if(appointment.length === 5){
      setNewStatus(selectedValue === '' ? appointment[4].toString() : selectedValue);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStatuses = {
        AppointmentID: id,
        newStatus: currentStatus
      };

      // Make a POST request to update the statuses on the server
      const response = await fetch('http://localhost:5000/super-admin-update-appointment-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
        },
        body: JSON.stringify(newStatuses),
      });

      if (response.ok) {
        alert('Statuses updated successfully');
        window.location.reload();
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
        const response = await fetch(`http://localhost:5000/super-admin-get-users-appointment/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const data = await response.json();
        // console.log('data', data);
        setAppointment(data.user_info);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`http://localhost:5000/super-admin-test-specimen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
          body: JSON.stringify({
            AppointmentID: id,
          })
        });
        const data = await response.json();
        console.log(data);
        setTest(data.test);
        setPackageOrders(data.PackageOrders);
        setDiseaseOrders(data.DiseaseOrders);
        setLabTestOrders(data.LabTestOrders);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchTest();
  }, [id]);

  const packageOrdersObject = packageOrders.reduce((acc, cur) => {
    acc[cur.PackageID] = cur;
    return acc;
  }, {});

  const diseaseOrdersObject = diseaseOrders.reduce((acc, cur) => {
    acc[cur.DiseaseID] = cur;
    return acc;
  }, {});

  const labTestOrdersObject = labTestOrders.reduce((acc, cur) => {
    acc[cur.TestID] = cur;
    return acc;
  }, {});

  return (
    <div>
      <NavbarAdmin />
      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex ">
        <div className="container max-w-screen-xl mx-auto">
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
                      {appointment[3] !== 'At Hospital' ? (
                        <>
                          <td className="p-3 px-5 bg-gray-50">
                            {appointment[3]} {appointment[5]} {appointment[6]} {appointment[7]}
                            {/* {appointment[4] !== "" } {" "}
                            {appointment[4]}  */}
                          </td>
                        </>
                      ) : (
                          <>
                            <td className="p-3 px-5 bg-gray-50">
                              {appointment[3]}
                            </td>
                          </>
                      )}
                      {isEditing === false ? (
                        <>
                          {appointment.length === 9 ? (
                            <td className="p-3 px-5 bg-gray-50">{appointment[8]}</td>
                          ) : (
                            <td className="p-3 px-5 bg-gray-50">
                              {appointment[4]}
                            </td>
                          )}
                        </>
                      ) : (
                        <>
                          {appointment.length === 9 ? (
                            <td className="p-3 px-5 bg-gray-50">
                              <select className="bg-white border border-gray-300 p-1 rounded" value={currentStatus} onChange={handleStatusChange}>
                                {appointment[8].toString() === 'Waiting' ? (
                                  <>
                                    <option value="Waiting">Waiting</option>
                                    <option value="Received">Received</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Received">Received</option>
                                    <option value="Waiting">Waiting</option>
                                  </>
                                )}
                              </select>
                            </td>
                          ) : (
                            <td className="p-3 px-5 bg-gray-50">
                              <select className="bg-white border border-gray-300 p-1 rounded" value={currentStatus} onChange={handleStatusChange}>
                                {appointment[4].toString() === 'Waiting' ? (
                                  <>
                                    <option value="Waiting">Waiting</option>
                                    <option value="Received">Received</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Received">Received</option>
                                    <option value="Waiting">Waiting</option>
                                  </>
                                )}
                              </select>
                            </td>
                          )}
                        </>
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
            <div>
              <h2 className="TestList font-bold text-lg">
                Test List
              </h2>
              <table className="w-full text-md bg-white shadow-md rounded mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 px-5">Name</th>
                    <th className="text-left p-3 px-5">Specimen</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(test) && test.map((testItem, index) => (
                    <tr key={index}>
                      {testItem.PackageID && (
                        <>
                          <td className="p-3 px-5 bg-gray-50">{packageOrdersObject[testItem.PackageID]?.th_package_name}</td>
                          <td className="p-3 px-5 bg-gray-50">{testItem.specimen}</td>
                        </>
                      )}
                      {testItem.DiseaseID && (
                        <>
                          <td className="p-3 px-5 bg-gray-50">{diseaseOrdersObject[testItem.DiseaseID]?.th_name}</td>
                          <td className="p-3 px-5 bg-gray-50">{testItem.specimen}</td>
                        </>
                      )}
                      {testItem.TestID && (
                        <>
                          <td className="p-3 px-5 bg-gray-50">{labTestOrdersObject[testItem.TestID]?.th_name}</td>
                          <td className="p-3 px-5 bg-gray-50">{testItem.specimen}</td>
                        </>
                      )}
                      {/* {isEditingTest === false ? (
                        <td className="p-3 px-5 bg-gray-50">{testItem.RefNum ? testItem.RefNum : '-'}</td>
                      ) : (
                        <td className="p-3 px-5 bg-gray-50">
                          <input type='text' id='refnum' value={currentRefNum[index] !== null ? currentRefNum[index] : ''} onChange={(e) => handleRefNumChange(index, e.target.value)} class={testItem.RefNum ? 'has-refnum' : 'no'}/>
                        </td>
                      )} */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecimenUpdateUserAppointmentSuperAdmin;
