import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { useParams } from 'react-router-dom';

const SpecimenUpdateUserAppointmentAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const [test, setTest] = useState([]);
  const [packageOrders, setPackageOrders] = useState([]);
  const [diseaseOrders, setDiseaseOrders] = useState([]);
  const [labTestOrders, setLabTestOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTest, setIsEditingTest] = useState(false);
  const { id } = useParams();
  const [currentStatus, setNewStatus] = useState(); // State to hold the new status
  const [currentTransportation, setCurrentTransportation] = useState([]);
  const [currentRefNum, setCurrentRefNum] = useState([]);

  const handleBackButtonClick = () => {
    window.location.href = `/admin/SpecimenUsersAppointment`;
  };

  // const handleRefNumChange = (index, value) => {
  //   setCurrentRefNum(prevState => {
  //     const newRefNum = [...prevState];
  //     newRefNum[index] = value;
  //     return newRefNum;
  //   });
  // };

  const toggleEditTransportation = () => {
    setIsEditingTest(!isEditingTest);
    // if (test.length > 0) {
    //   setCurrentTransportation(test[0].transfer || '');
    // }
  };

  const handleTransportationChange = (index, value) => {
    setCurrentTransportation(prevState => {
      const newTransportation = [...prevState];
      newTransportation[index] = value;
      return newTransportation;
    });
  };

  const handleSubmitTransportation = async (e, testItem) => {
    e.preventDefault();
    try {
      const filteredTransported = currentTransportation.filter(value => value === '1' || value === '0');
      // Make a POST request to update transportation on the server
      const response = await fetch('http://localhost:5000/update-test-transportation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
        },
        body: JSON.stringify({
          AppointmentID: id,
          newTransportation: filteredTransported,
          // newRefNum: currentRefNum,
          PackageID: testItem.PackageID,
          DiseaseID: testItem.DiseaseID,
          TestID: testItem.TestID
        }),
      });

      if (response.ok) {
        alert('Transportation updated successfully');
        window.location.reload(); // Reload the page to reflect changes
      } else {
        console.error('Failed to update transportation:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating transportation:', error);
    }
  };

  const ChangeEditStatus = () => {
    setIsEditing(!isEditing);
    if(appointment.length === 11){
        setNewStatus(appointment[10]);
    }
    if(appointment.length === 7){
      setNewStatus(appointment[6]);
    }
  };

  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;
    console.log(selectedValue);
    if(appointment.length === 11){
      setNewStatus(selectedValue === '' ? appointment[10].toString() : selectedValue);
    }
    if(appointment.length === 7){
      setNewStatus(selectedValue === '' ? appointment[6].toString() : selectedValue);
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
        const response = await fetch(`http://localhost:5000/admin-get-users-appointment/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
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
        const response = await fetch(`http://localhost:5000/admin-test-specimen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
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
      <div className="min-h-screen p-6 flex bg-light-yellow">
        <div className="container max-w-screen-xl mx-auto">
          <div className="relative">
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
                      <th className="text-left p-3 px-5">Name / ชื่อ นามสกุล</th>
                      <th className="text-left p-3 px-5">Phone Number / เบอร์โทรศัพท์</th>
                      <th className="text-left p-3 px-5">Date / วันที่</th>
                      <th className="text-left p-3 px-5">Time / เวลา</th>
                      <th className="text-left p-3 px-5">Location / สถานที่ที่นัด</th>
                      <th className="text-left p-3 px-5">Result Status / สถานะผลการตรวจ</th>
                    </tr>
                    <tr key={appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                      <td className="p-3 px-5 bg-gray-50">{appointment[1]}</td>
                      <td className="p-3 px-5 bg-gray-50">{appointment[2]}</td>
                      <td className="p-3 px-5 bg-gray-50">{appointment[3]}</td>
                      <td className="p-3 px-5 bg-gray-50">{appointment[4]}</td>
                      {appointment[5] !== 'At Hospital' ? (
                        <>
                          <td className="p-3 px-5 bg-gray-50">
                            {appointment[5]} {appointment[7]} {appointment[8]} {appointment[9]}
                            {/* {appointment[4] !== "" } {" "}
                            {appointment[4]}  */}
                          </td>
                        </>
                      ) : (
                          <>
                            <td className="p-3 px-5 bg-gray-50">
                              {appointment[5]}
                            </td>
                          </>
                      )}
                      {isEditing === false ? (
                        <>
                          {appointment.length === 11 ? (
                            <td className="p-3 px-5 bg-gray-50">{appointment[10]}</td>
                          ) : (
                            <td className="p-3 px-5 bg-gray-50">
                              {appointment[6]}
                            </td>
                          )}
                        </>
                      ) : (
                        <>
                          {appointment.length === 11 ? (
                            <td className="p-3 px-5 bg-gray-50">
                              <select className="bg-white border border-gray-300 p-1 rounded" value={currentStatus} onChange={handleStatusChange}>
                                {appointment[10].toString() === 'Waiting' ? (
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
                                {appointment[6].toString() === 'Waiting' ? (
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
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
              <h3 className="TestList font-bold text-lg">
                Test List / รายการการตรวจ
              </h3>
              {isEditingTest === false ? (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={toggleEditTransportation}
                >
                    Edit Transportation
                </button>
                ) : (
                  <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={toggleEditTransportation}
                  >
                      Close Edit Mode
                  </button>
              )}
              <br/>
              <br/>
              <table className="w-full text-md bg-white shadow-md rounded mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 px-5">Name / ชื่อการตรวจ</th>
                    <th className="text-left p-3 px-5">Specimen / การเก็บตัวอย่าง</th>
                    <th className="text-left p-3 px-5">Transportation / การส่งต่อการตรวจ</th>
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
                      {isEditingTest === false ? (
                        <td className="p-3 px-5 bg-gray-50">{testItem.transfer ? '✓' : 'X'}</td>
                      ) : (
                        <td className="p-3 px-5 bg-gray-50">
                          <select className="bg-white border border-gray-300 p-1 rounded" value={currentTransportation[index]} onChange={(e) => handleTransportationChange(index, e.target.value)}>
                              {(testItem.transfer === null || testItem.transfer === 0) ? (
                                <>
                                  <option value="0">X (test by own)</option>
                                  <option value="1">✓ (send to NU)</option>
                                </>
                              ) : (
                                <>
                                  <option value="1">✓ (send to NU)</option>
                                  <option value="0">X (test by own)</option>
                                </>
                              )}
                          </select>
                        </td>
                      )}
                      {/* {isEditingTest === false ? (
                        <td className="p-3 px-5 bg-gray-50">{testItem.RefNum ? testItem.RefNum : '-'}</td>
                      ) : (
                        <td className="p-3 px-5 bg-gray-50">
                          <input type='text' id='refnum' value={currentRefNum[index] !== null ? currentRefNum[index] : ''} onChange={(e) => handleRefNumChange(index, e.target.value)} class={testItem.RefNum ? 'has-refnum' : 'no'}/>
                        </td>
                      )} */}
                      <td className="p-3 px-5 bg-gray-50">
                        {isEditingTest === true && (
                            <div className="flex space-x-4">
                                <button
                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={(e) => handleSubmitTransportation(e, testItem)}
                                >
                                    Update / อัปเดต
                                </button>
                            </div>
                          )}
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
  );
};

export default SpecimenUpdateUserAppointmentAdmin;
