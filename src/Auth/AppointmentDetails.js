import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './navbar';

const AppointmentDetails = () => {
  const [appointmentDetails, setAppointmentDetails] = useState();
  const { id } = useParams();
  const [placeFlag, setPlaceFlag] = useState(null);
  const [hos_id, setHosId] = useState(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editedDate, setEditedDate] = useState('');
  const [timeOptions, setTimeOptions] = useState([]);
  const [editedSlot, setEditedSlot] = useState('');
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    // Fetch user data from the server when the component mounts
    const fetchUserAppointmentDetails = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-appointment-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            AppointmentID: id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user appointment details data');
        }

        if (response.ok) {
          const { AppointInfo, timeSlot, Address, PackageOrders, DiseaseOrders, LabTestOrders } = await response.json();
          // console.log('Response Data:', AppointInfo, timeSlot, Address, PackageOrders, DiseaseOrders, LabTestOrders);
          if (Address) {
            setPlaceFlag("OffSite");
          }
          else if (Address === null) {
            setPlaceFlag("Hospital");
          }
          setHosId(AppointInfo[0].HospitalID);

          // console.log(placeFlag);
          // console.log(hos_id);

          const Details = {
              AppointInfo: AppointInfo,
              DateTime: timeSlot,
              Address: Address
          };
          const Orders = {
              Package: PackageOrders,
              Disease: DiseaseOrders,
              LabTest: LabTestOrders
          };

          // console.log('data', data)
          setAppointmentDetails({Details, Orders});
          // console.log('appointmentDetails', appointmentDetails.Orders);
        } else {
          console.error("Failed to fetch user appointment details data");
        }
      } catch (error) {
        console.error("Error fetching user appointment details data:", error);
      }
    };

    // Call the fetchUserData function
    fetchUserAppointmentDetails();
  }, [id, placeFlag, hos_id])

  useEffect(() => {
    // Set minDate to today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to get tomorrow's date

    const year = tomorrow.getFullYear();
    let month = (tomorrow.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 as months are zero-indexed
    let day = tomorrow.getDate().toString().padStart(2, '0');

    const formattedTomorrow = `${year}-${month}-${day}`;
    setMinDate(formattedTomorrow);
  }, []);

  const fetchTimeOptions = async (selectedDate) => {
    try {
      const response = await fetch('http://localhost:5000/time-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          selectedDate: selectedDate,
          place: placeFlag, 
          Hos_id: hos_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time options');
      }

      if (response.ok) {
        const timeSlot  = await response.json();
        setTimeOptions(timeSlot);
      }
    } catch (error) {
      console.error("Error fetching time options:", error);
    }
  };

  const formatDate = (datetimeString) => {
    const date = new Date(datetimeString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const editAppointment = () => {
    setEditMode(true);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setEditedDate(selectedDate);
    fetchTimeOptions(selectedDate);
  };

  const handleSlotChange = (event) => {
    setEditedSlot(event.target.value);
    console.log(editedSlot)
  };

  const handleCancel = (event) => {
    setEditMode(false);
  };

  const handleSave = async () => { 
    try {
      if(editedDate == '' && editedSlot == ''){
        alert("Please select the new date and new time.");
        return;
      }
      else if(editedSlot == ''){
        alert("Please select the new time.");
        return;
      }
      const response = await fetch('http://localhost:5000/update-appointment-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          AppointmentID: id,
          Hos_id: hos_id,
          editedDate: editedDate,
          editedSlot: editedSlot,
          place: placeFlag, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user appointment details data');
      }
      if (response.ok) {
        alert("Edit Successful!");
        setEditMode(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
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
                <div>
                    {appointmentDetails && appointmentDetails.Details &&(
                      <div>
                        <div>
                          <p className="font-semibold">Name</p>
                          <ul>
                              <li>{appointmentDetails.Details.AppointInfo[0]?.Name}</li>
                              <br/>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold">Hospital</p>
                          <p>{appointmentDetails.Details.AppointInfo[0]?.hos_name}</p>
                          <br/>
                        </div>
                        {appointmentDetails.Details.Address != null &&(
                          <div>
                              <p className="font-semibold">Location</p>
                              <p>{appointmentDetails.Details.Address[0]?.ad_line1}</p>
                              <p>{appointmentDetails.Details.Address[0]?.ad_line2}</p>
                              <p>{appointmentDetails.Details.Address[0]?.province}</p>
                              <p>{appointmentDetails.Details.Address[0]?.city} {appointmentDetails.Details.Address[0]?.zipcode}</p>
                              <br/>
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">Date</p>
                          <div className="flex items-center mt-2">
                            {editMode ? (
                              <input
                                type="date"
                                name="date"
                                id="date"
                                value={editedDate}
                                min={minDate}
                                onChange={handleDateChange}
                                className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                              />
                            ) : (
                              <p>{appointmentDetails.Details.AppointInfo[0]?.HospitalDate ? formatDate(appointmentDetails.Details.AppointInfo[0]?.HospitalDate) : formatDate(appointmentDetails.Details.AppointInfo[0]?.OffSiteDate)}</p>
                            )}
                          </div>

                          <p className="font-semibold mt-4">Time</p>
                          <div className="flex items-center mt-2">
                            {editMode ? (
                              <select
                                value={editedSlot}
                                onChange={handleSlotChange}
                                className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                              >
                                <option value="">Select a time slot</option>
                                {timeOptions && timeOptions.map((time, index) => (
                                  <option key={index} value={time.hosSlotID}>
                                    {time.TimeSlot}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p>{appointmentDetails.Details.DateTime[0]?.TimeSlot}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <br />
                    {appointmentDetails && appointmentDetails.Orders && (
                      <div>
                        <p className="font-semibold">Test</p>
                          {appointmentDetails.Orders.Package && appointmentDetails.Orders.Package.map((order, index) => (
                            <li key={`package_order_${index}`}>&bull; {order.th_package_name} ({order.en_package_name})</li>
                          ))}
                          {appointmentDetails.Orders.Disease && appointmentDetails.Orders.Disease.map((order, index) => (
                            <li key={`disease_order_${index}`}>&bull; {order.th_name} ({order.en_name})</li>
                          ))}
                          {appointmentDetails.Orders.LabTest && appointmentDetails.Orders.LabTest.map((order, index) => (
                            <li key={`lab_test_order_${index}`}>&bull; {order.th_name} ({order.en_name})</li>
                          ))}
                        <br/>
                      </div>
                    )}
                    {appointmentDetails && appointmentDetails.Details && (
                      <div>
                        <p>
                          <span className="font-bold">Status:</span> {appointmentDetails.Details.AppointInfo[0]?.LabStatus}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-4 mt-4">
                      {!editMode && (
                        <button
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          onClick={editAppointment}
                        >
                          Edit
                        </button>
                      )}

                      {editMode && (
                        <>
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleSave}
                          >
                            Save
                          </button>

                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;