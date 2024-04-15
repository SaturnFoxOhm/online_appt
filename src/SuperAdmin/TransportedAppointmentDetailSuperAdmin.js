import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarSuperAdmin';
import { useParams } from 'react-router-dom';

const TransportedAppointmentDetailSuperAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const [test_list, setTest] = useState([]);
  const [packageOrders, setPackageOrders] = useState([]);
  const [diseaseOrders, setDiseaseOrders] = useState([]);
  const [labTestOrders, setLabTestOrders] = useState([]);
  const { id } = useParams();

  const handleBackButtonClick = () => {
    window.location.href = `/super-admin/TransportedUsersAppointment`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/super-admin-get-users-appointment-transported/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const { test, PackageOrders, DiseaseOrders, LabTestOrders } = await response.json();
        setAppointment(test[0]);
        setTest([...PackageOrders, ...DiseaseOrders, ...LabTestOrders]);
        setPackageOrders(PackageOrders);
        setDiseaseOrders(DiseaseOrders);
        setLabTestOrders(LabTestOrders);
        console.log(test_list)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
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
      <div className="min-h-screen p-6 bg-light-yellow flex ">
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
                      <th className="text-left p-3 px-5">Hospital / โรงพยาบาล</th>
                      <th className="text-left p-3 px-5">Date / วันที่</th>
                      <th className="text-left p-3 px-5">Result Status / สถานะผลการตรวจ</th>
                    </tr>
                    <tr key={appointment.AppointmentID} className="border-b hover:bg-orange-100 bg-gray-100">
                        <td className="p-3 px-5 bg-gray-50">{appointment.user_name}</td>
                        <td className="p-3 px-5 bg-gray-50">{appointment.hos_name}</td>
                        {appointment.HospitalDate !== null ? (
                            <td className="p-3 px-5 bg-gray-50">{appointment.HospitalDate}</td>
                        ) : (
                            <td className="p-3 px-5 bg-gray-50">{appointment.OffSiteDate}</td>
                        )}
                        <td className="p-3 px-5 bg-gray-50">{appointment.LabStatus}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 className="TestList font-bold text-lg">
                Transported Test List / รายการการตรวจที่ถูกโอนย้าย
              </h2>
              <table className="w-full text-md bg-white shadow-md rounded mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 px-5">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(test_list) && test_list.map((testItem, index) => (
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

export default TransportedAppointmentDetailSuperAdmin;